import {getPercentageTime, getTimeRemainingText} from "./remaining-print-times.js";
import {set_time_remaining_text, set_percentage, change_screen, remove_loader, set_title_on_screen,
	set_preview, set_camera, set_temperature} from "./front-manipulation.js";
import {create_general_screen, create_individual_screens} from "./html-generation.js";
import {promiseTimeout} from "./promises.js";
import {reboot_raspberry_pi} from "./reboot-raspberry.js";

const API = {
	HOST_URL: "http://192.168.0.109/",
	PRINT_JOB: "cluster-api/v1/print_jobs/",
	HISTORY: "cluster-api/v1/print_jobs/history",
	COUNT: "cluster-api/v1/print_jobs/history/count",
	HEADS_TEMPERATURE: "api/v1/printer/heads",
	BED_TEMPERATURE: "api/v1/printer/bed/temperature",
	CAMERA: "api/v1/camera",
}

const state = {
	PRINTING: "PRINTING",
	WAITING: "WAITING",
	ERROR: "ERROR",
	FINISHED: "FINISHED",
}

/**
 * Class for managing Ultimaker printers
 * @param {string} ip - The ip address of the printer
 * @param {string} name - The name of the printer to display on screen
 * @param {string} uuid - Unique identifier of the printer
 */
class Ultimaker {
	constructor(ip, name, uuid) {
		this._ip = ip;
		this._name = name;
		this._job = null;
		this._state = state.WAITING;
		this._uuid = uuid;
		this._bed_temperature = 0;
		this._right_temperature = 0;
		this._left_temperature = 0;
		this._camera_url = `${this.ip.slice(0, -1)}:8080/?action=stream`;
		this._preview_url = "";
		this._index = 0;
	}

	// Getters
	get ip() { return this._ip;	}
	get name() { return this._name;	}
	get job() {	return this._job;	}
	get state() { return this._state;	}
	get index() { return this._index;	}
	get uuid() { return this._uuid;	}
	get bed_temperature() { return this._bed_temperature;	}
	get right_temperature() { return this._right_temperature;	}
	get left_temperature() { return this._left_temperature;	}
	get camera_url() { return this._camera_url;	}
	get preview_url() { return this._preview_url;	}
	set index(value) { this._index = value;	}

	/**
	 * Logs a pretty representation of the printer
	 */
	show() {
		console.log(`
Name: ${this.name}
IP: ${this.ip}
State: ${this.state}
UUID: ${this.uuid}
index: ${this.index}
current job:
  name: ${this.job.name}
  state: ${this.job.state}
  time_remaining_text: ${this.job.time_remaining_text}
  percentage: ${this.job.percentage}
  uuid: ${this.job.uuid}
bed_temperature: ${this.bed_temperature}
right_temperature: ${this.right_temperature}
left_temperature: ${this.left_temperature}
camera_url: ${this.camera_url}
preview_url: ${this.preview_url}
`);
	}

	/**
	 * Gives relevant information about current job
	 * @return {Promise<Response>}
	 */
	async get_job() {
		return await fetch(`${API.HOST_URL}${API.PRINT_JOB}`)
			.then(async resp => {
				const jobs = await resp.json();
				for (let job of jobs) {
					if (job.printer_uuid === this.uuid && job.started) {
						return {
							name: job.name,
							state: job.state,
							time_remaining_text: getTimeRemainingText(job.time_elapsed, job.time_total),
							percentage: getPercentageTime(job.time_elapsed, job.time_total),
							uuid: job.uuid,
						}
					}
				}
				return this.get_last_job();
				})
	}

	/**
	 * Updates the preview for the current job / the last job
	 */
	update__preview() {
		this._preview_url = `${API.HOST_URL}/cluster-api/v1/print_jobs/${this.job.uuid}/preview_image`
  }

	/**
	 * Gives relevant information about last job
	 * @return {Promise<{time_remaining_text: string|string, percentage: number|number, name: *, state: *, uuid: *}>}
	 */
	async get_last_job() {
		// console.log("No printer job running, I'm fetching last print job");
		const count = await fetch(`${API.HOST_URL}${API.COUNT}`)
			.then(async res => {
				return await res.json().then(_ => _.count);
			});

		const response = await fetch(`${API.HOST_URL}${API.HISTORY}?offset=${count-1}`);
		return await response.json()
			.then(function (job) {
				job = job[0];
				return {
					name: job.name,
					state: job.status,
					time_remaining_text: getTimeRemainingText(1, 1),
					percentage: getPercentageTime(1, 1),
					uuid: job.uuid,
				}
			})
	}

	/**
	 * Updates printer state variable
	 */
	update__state() {
		switch (this.job.state) {
			case "printing":
        this._state = state.PRINTING;
        break;
			case "finished":
				this._state = state.FINISHED;
        break;
			case "booting":
			case "idle":
			case "waiting":
			case "wait_cleanup":
			case undefined:
        this._state = state.WAITING;
        break;
			case "error":
				this._state = state.ERROR;
        break;
	    default:
		    this._state = state.ERROR;
				console.log(`An unknown printer state was found : ${this.job.state}`)
		}
	}

	/**
   * Updates printer temperatures
   */
	async update__temperatures() {
		// extruders temperatures
		const heads = await fetch(`${this.ip}${API.HEADS_TEMPERATURE}`)
			.then(async res => {
				const h = await res.json();
				return {
          right: h[0].extruders[1].hotend.temperature.current,
          left: h[0].extruders[0].hotend.temperature.current
        }
			});
		this._right_temperature = heads.right;
		this._left_temperature = heads.left;

		// bed temperature
		this._bed_temperature = await fetch(`${this.ip}${API.BED_TEMPERATURE}`)
      .then(async res => {
        return await res.json().then(_ => _.current);
      });
	}

	/**
	 * Initializes the printer with get requests on:
	 * - current job (or previous job if the printer is inactive)
	 * - temperatures
	 * - preview of the current (or previous) job
	 * @return {Promise<void>}
	 */
	async init() {
		this._job = await this.get_job();
		this.update__preview();
		this.update__state();
		await this.update__temperatures();
	}

	/**
	 * Performs all updates of printer information, this function
	 * is called by the request loop of TV class
	 * @return {Promise<boolean>} has job changed ?
	 */
	async update() {
		let job_changed = false,
				job = await this.get_job();
		if (job.uuid !== this.job.uuid) { job_changed = true; }

		this._job = job;
		await this.update__temperatures();
		this.update__state();

		if (job_changed) {
      this.update__preview();
    }
		return job_changed;
	}
}

/**
 * Class representing the TV displaying printers information.
 * @param {int} timerRequests - time between each request (seconds)
 * @param {int} timerScreens - time to spend in each screen (seconds)
 * @param {Ultimaker} - Array of printers
 */
class TV {
	constructor(timerRequests, timerScreens, printers) {
		this._timerRequests = timerRequests;  // seconds between 2 updates
		this._timerScreens = timerScreens;  // seconds to spend on each screen (general, printer1, printer2, ...)
		this._printers = printers;
		this._current_screen = -1;  // -1 is general screen
	}

	get timerRequests() { return this._timerRequests; }
	get timerScreens() { return this._timerScreens; }
	get current_screen() {	return this._current_screen;	}
	get printers() { return this._printers; }

	/**
   * Performs init requests to update each printer information
   * @return {Promise<void>}
   */
	async init() {
		let index = 0;
		let unreachable_printers = [];
		for (let printer of this.printers) {
			printer._index = index++;
			await promiseTimeout(15000 , printer.init())
				.then(() => {
					printer.show();
	      })
				.catch(err => {
          console.log(err);
          unreachable_printers.push(index - 1)
					console.log(`Printer ${printer.name} will be removed from the list`);
        });
    }
		this._printers = this.printers.filter(printer => !unreachable_printers.includes(printer.index))
		create_general_screen(); // generates HTML for general Screen
		create_individual_screens(this.printers.length) ; // generates HTML for individual screens
	}

	/**
	 * Simply runs the 2 following loops :
	 * - Screen loop changes the displayed screen every 'timerScreens' seconds
	 * - Request loop updates printer information every 'timerRequests' seconds
	 */
	run() {
		console.log(`%cI will run the main loop with those parameters:
  - time between two requests: ${this._timerRequests}
  - time on each screen:       ${this._timerScreens}`, 'color: #e04107;');
		remove_loader(); // removes the css loading animation
		for (let initialize_screen = -1; initialize_screen < this.printers.length; initialize_screen++) {
			if (initialize_screen === -1) {
				for (let printer of this.printers) {
					set_title_on_screen(printer, initialize_screen);  // Updates printer title on screen
					set_preview(printer, initialize_screen);  // Updates preview on screen
					set_camera(printer, initialize_screen);  // Updates camera on screen
					set_time_remaining_text(printer, initialize_screen);  // Updates time remaining on screen
					set_percentage(printer, "general_frame_" + printer.index.toString());  // Updates percentage on screen
				}
			} else {
				let printer = this.printers[initialize_screen]
				set_title_on_screen(printer, initialize_screen);  // Updates printer title on screen
				set_preview(printer, initialize_screen);  // Updates preview on screen
				set_camera(printer, initialize_screen);  // Updates camera on screen
				set_temperature(printer, initialize_screen);  // Updates temperature on screen
				set_time_remaining_text(printer, initialize_screen);  // Updates time remaining on screen
				set_percentage(printer, "printer_frame_" + printer.index.toString());  // Updates percentage on screen
			}
		}
		this.request_loop();
		this.screen_loop();
	}

	/**
	 * Updates information of printers on displayed screen
	 * @return {Promise<null>}
	 */
	async request_loop() {
		if (this.current_screen === -1) {
			for (let printer of this.printers) {
				let has_changed = await printer.update();

				if (has_changed) {
					set_title_on_screen(printer, this.current_screen);  // Updates printer title on screen
					set_preview(printer, this.current_screen);  // Updates preview on screen
					set_camera(printer, this.current_screen);  // Updates camera on screen
				}
				set_time_remaining_text(printer, this.current_screen);  // Updates time remaining on screen
				set_percentage(printer, "general_frame_" + printer.index.toString());  // Updates percentage on screen
			}
		} else {
			let printer = this.printers[this.current_screen]
			let has_changed =  await printer.update();

			if (has_changed) {
				set_title_on_screen(printer, this.current_screen);  // Updates printer title on screen
				set_preview(printer, this.current_screen);  // Updates preview on screen
				set_camera(printer, this.current_screen);  // Updates camera on screen
			}
			set_temperature(printer, this.current_screen);  // Updates temperature on screen
			set_time_remaining_text(printer, this.current_screen);  // Updates time remaining on screen
			set_percentage(printer, "printer_frame_" + printer.index.toString());  // Updates percentage on screen
		}
		setTimeout(() => {this.request_loop()}, this.timerRequests * 1000);
	}

	/**
	 * Changes the displayed screen
	 */
	screen_loop() {
		this._current_screen = (this.current_screen + 2) % (this.printers.length + 1) - 1;
		change_screen(this);
		if (this.current_screen >= 0-1) {
			set_camera(this.printers[this.current_screen], this.current_screen);
		}
		setTimeout(() => {this.screen_loop()}, this.timerScreens * 1000);
	}
}

// Initializing & Running
let S5 = new Ultimaker("http://192.168.0.109/", "Ultimaker S5", "d959a261-02e6-42b5-a310-380ce7596611");
let S3 = new Ultimaker("http://192.168.0.114/", "Ultimaker S3", "0f215a23-0317-43b5-8a04-69b8fb918dde");

let television = new TV(3, 10, [S5, S3]);


(async () => {
	await television.init();
	if (television.printers.length > 0) {
    television.run();
  } else {
		reboot_raspberry_pi();
	}
})();



