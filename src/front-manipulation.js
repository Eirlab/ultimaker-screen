export {changeSvgColor, confettiRain, set_percentage, set_time_remaining_text, change_screen, remove_loader,
	set_title_on_screen, set_preview, set_camera, set_temperature};

// ###########################
//     Change logo colors
// ###########################
function changeSvgColor(element, color) {
	// Examples
	// changeSvgColor('nozzle_R_logo', 'red');
	// changeSvgColor('nozzle_L_logo', 'blue');
	// changeSvgColor('bed_logo', 'orange');
	element.style.fill = color;
}

// ##################################################
//     Dropping confettis when a printer succeeds
// ##################################################
function confettiRain() {
	for (let i = 0; i < 200; i++) {
		// Random rotation
		let randomRotation = Math.floor(Math.random() * 360);
		// Random width & height between 0 and viewport
		let randomWidth = Math.floor(Math.random() * Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
		let randomHeight = Math.floor(Math.random() * Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
		// Random animation-delay
		let randomAnimationDelay = Math.floor(Math.random() * 10);

		// Random colors
		let colors = [
			'#FF1C1C',  // red
			'#FF93DE',  // light pink
			'#0a1577',  // deep blue
			'#FFC61C',  // yellow
			'#6bb100',  // eirlab green
			'#009edc',  // eirlab blue
			'#f78500',  // eirlab orange
			'#eb008d']  // eirlab pink
		let randomColor = colors[Math.floor(Math.random() * colors.length)];

		// Create confetti piece
		let confetti = document.createElement('div');
		confetti.className = 'confetti';
		confetti.style.top = randomHeight + 'px';
		confetti.style.left = randomWidth + 'px';
		confetti.style.backgroundColor = randomColor;
		confetti.style.transform = 'skew(15deg) rotate(' + randomRotation + 'deg)';
		confetti.style.animationDelay = randomAnimationDelay + 's';
		document.getElementById("confetti-wrapper").appendChild(confetti);
	}
}

// ##################################
//     Updating percentage circle
// ##################################

function set_percentage(ultimaker, screen_id) {
	let percentage = ultimaker.job.percentage;
	let screen = document.getElementById(screen_id);
	let el = screen.querySelector("#graph");
	el.setAttribute('data-percent', percentage);
	let options = {
		percent: el.getAttribute('data-percent') || 25,
		size: el.getAttribute('data-size') || 220,
		lineWidth: el.getAttribute('data-line') || 15,
		rotate: el.getAttribute('data-rotate') || 0
	}
	let canvas = el.querySelector("#canvas");
	let span = el.querySelector("#span");
	span.textContent = options.percent + '%';

	if (typeof (G_vmlCanvasManager) !== 'undefined') {
		G_vmlCanvasManager.initElement(canvas);
	}

	let ctx = canvas.getContext('2d');
	canvas.width = canvas.height = options.size;

	ctx.translate(options.size / 2, options.size / 2); // change center
	ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

	let radius = (options.size - options.lineWidth) / 2;

	let drawCircle = function (color, lineWidth, percent) {
		percent = Math.min(Math.max(0, percent || 1), 1);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
		ctx.strokeStyle = color;
		ctx.lineCap = 'round'; // butt, round or square
		ctx.lineWidth = lineWidth
		ctx.stroke();
	};

	drawCircle('#efefef', options.lineWidth, 100 / 100);
	drawCircle('#555555', options.lineWidth, options.percent / 100);
}

function set_time_remaining_text(ultimaker, current_screen) {
	if (current_screen === -1) {
		let frame = document.getElementById("general_frame_" + ultimaker.index.toString());
		frame.querySelector('#time-left').innerHTML = ultimaker.job.time_remaining_text;
		frame.querySelector('#time-left').style.color = "black";
	} else {
		let frame = document.getElementById("printer_frame_" + ultimaker.index.toString());
		frame.querySelector("#time-left-printer").innerHTML = ultimaker.job.time_remaining_text;
		frame.querySelector("#time-left-printer").style.color = "black";
	}
}


function change_screen(TV) {
	document.getElementById("general_frame").style.display = "none";
	for (let i = 0; i < TV.printers.length; i++) {
		document.getElementById("printer_frame_" + i.toString()).style.display = "none";
	}

	let current_screen = TV.current_screen;
	if (current_screen === -1) {
		document.getElementById("general_frame").style.display = "grid";
	} else {
		document.getElementById("printer_frame_" + current_screen.toString()).style.display = "grid";
	}
}

function remove_loader() {
  document.getElementById("loader").style.display = "none";
}

function color_from_temperature(value) {
	let h = (1.0 - value) * 255;
	let r = 255;
	let g = (h <= 210) ? h : 210;
	let b = 0;
	return "rgb(" + r + "," + g + "," + b + ")";
}

function set_temperature(ultimaker, current_screen) {
	if (current_screen === -1) {
		;
	} else {
		let frame = document.getElementById("printer_frame_" + ultimaker.index.toString());

		let colorRight = color_from_temperature(1 - (1 - ultimaker.right_temperature / 250) * 2);
		changeSvgColor(frame.querySelector("#nozzle_R_logo"), colorRight);
		frame.querySelector("#nozzle_R_text").innerHTML = Math.floor(ultimaker.right_temperature).toString() + "°C";

		let colorLeft = color_from_temperature(1 - (1 - ultimaker.left_temperature / 250) * 2);
		changeSvgColor(frame.querySelector("#nozzle_L_logo"), colorLeft);
		frame.querySelector("#nozzle_L_text").innerHTML = Math.floor(ultimaker.left_temperature).toString() + "°C";

		let colorBed = color_from_temperature(1 - (1 - ultimaker.bed_temperature / 60) * 2);
		changeSvgColor(frame.querySelector("#bed_logo"), colorBed);
		frame.querySelector("#bed_text").innerHTML = Math.floor(ultimaker.bed_temperature).toString() + "°C";
	}
}

function set_title_on_screen(ultimaker, current_screen) {
	if (current_screen === -1) {
		let frame = document.getElementById("general_frame_" + ultimaker.index.toString());
		frame.querySelector('#general-printer-name').innerHTML = ultimaker.name;
	} else {
		let frame = document.getElementById("printer_frame_" + ultimaker.index.toString());
		frame.querySelector("#printer-name").innerHTML = ultimaker.name;
	}
}

function set_preview(ultimaker, current_screen) {
	if (current_screen === -1) {
		let frame = document.getElementById("general_frame_" + ultimaker.index.toString());
		frame.querySelector('#picture_iframe').src = ultimaker.preview_url;
	} else {
		let frame = document.getElementById("printer_frame_" + ultimaker.index.toString());
		frame.querySelector("#preview_iframe").src = ultimaker.preview_url;
	}
}

function set_camera(ultimaker, current_screen) {
	if (current_screen === -1) {
		// there is nothing to do, the camera is not displayed on the general screen
	} else {
		let frame = document.getElementById("printer_frame_" + ultimaker.index.toString());
		frame.querySelector("#camera_frame").src = ultimaker.camera_url;
	}
}
