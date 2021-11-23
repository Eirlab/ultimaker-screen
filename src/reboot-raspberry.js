import {create_connection_error_page} from "./html-generation.js";
import {remove_loader} from "./front-manipulation.js";
import {sleep} from "./promises.js";

export function reboot_raspberry_pi() {
	console.log(`%cNo printers found`, 'color: #e04107;');
	create_connection_error_page();
	remove_loader()

	console.log("Starting a 5 min cooldown before rebooting the Raspberry...");
	sleep(5000).then(() => {
		console.log('%cThe raspberry will now reboot', 'color: #e04107;');
		sleep(2000).then(() => {
			// performs a get request on localhost port 8081 to restart the server
			fetch("http://localhost:8081/")
				.then((res) => {
					if (res.ok) {
						console.log("%cSHUTTING DOWN", 'color: #e04107;');
					} else if (res.status === 403) {
						console.log("%cYou're not running the client on a Raspberry, I will now reboot the computer", 'color: #e04107;');
					}
				})
				.catch(() => console.log("%cThe shutdown server is not running", 'color: #e04107;'));
		});
	});
}
