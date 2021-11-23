export {create_general_screen, create_individual_screens, create_connection_error_page};

let screens = document.getElementById("general_frame");

function div_generator(className) {
	let div = document.createElement('div');
	div.className = className;
	return div;
}

function progress_circle_generator() {
	let progress_circle = div_generator("chart progress-circle");
	progress_circle.id = "graph";
	progress_circle['data-percent'] = "0";
	let progress_circle_canvas = document.createElement('canvas');
	progress_circle_canvas.id = "canvas";
	progress_circle.appendChild(progress_circle_canvas);
	let progress_circle_span = document.createElement('span');
	progress_circle_span.id = "span";
	progress_circle.appendChild(progress_circle_span);
	return progress_circle;
}

function general_frame_generator(i) {
	let general_grid_i = div_generator("general_grid_" + i.toString());
	let gradient_border = div_generator("gradient-border");
	gradient_border.id = "gradient_border_" + i.toString();
	let general_frame = div_generator("general-frame");
	general_frame.id = "general_frame_" + i.toString();
	general_frame.appendChild(general_screen_generator());
	gradient_border.appendChild(general_frame);
	general_grid_i.appendChild(gradient_border);
	return general_grid_i;
}

function general_screen_generator() {
	let general_frame = div_generator("general_frame");

	// name
	let general_printer_name = div_generator("general-printer-name");
	let printer_name = document.createElement('p');
	printer_name.id = "general-printer-name";
	// printer_name.innerHTML = "Ultimaker ??";
	general_printer_name.appendChild(printer_name);
	general_frame.appendChild(general_printer_name);

	// preview
	let preview_general = div_generator("preview-general");
	let picture_iframe = document.createElement('iframe');
	picture_iframe.id = "picture_iframe";
	picture_iframe.src = "";
	picture_iframe.overflow = "hidden";
	picture_iframe.alt = "3d model preview";
	picture_iframe.border = 0;
	preview_general.appendChild(picture_iframe);
	general_frame.appendChild(preview_general);

	// progress circle
	let progress_circle = progress_circle_generator();
	general_frame.appendChild(progress_circle)

	let status = div_generator("status");
	let time_left = document.createElement('div');
	time_left.id = 'time-left';
	status.appendChild(time_left);
	general_frame.appendChild(status);

	return general_frame;
}

function individual_screen_generator(id) {
	let individual_frame = div_generator("printer_frame");
	individual_frame.id = "printer_frame_" + id.toString();

	// name
	let individual_printer_name = div_generator("title");
	let printer_name = document.createElement('p');
	printer_name.id = "printer-name";
	// printer_name.innerHTML = "Ultimaker ??";
	individual_printer_name.appendChild(printer_name);
	individual_frame.appendChild(individual_printer_name);

	// preview
	let individual_preview = div_generator("preview");
	let preview_iframe = document.createElement('iframe');
	preview_iframe.id = "preview_iframe";
	preview_iframe.src = "";
	preview_iframe.overflow = "hidden";
	preview_iframe.alt = "3d model preview";
	preview_iframe.border = 0;
	individual_preview.appendChild(preview_iframe);
	individual_frame.appendChild(individual_preview);

	// camera
	let individual_camera = div_generator("camera");
	let camera_frame = document.createElement('img');
	camera_frame.id = "camera_frame";
	camera_frame.setAttribute("style", "-webkit-user-select: none;");
	camera_frame.setAttribute("width", "100%");
	camera_frame.setAttribute("height", "100%");
	camera_frame.src = "";
	camera_frame.alt = "Camera";
	individual_camera.appendChild(camera_frame);
	individual_frame.appendChild(individual_camera);

	// temperatures
	let temperatures = div_generator("temperatures");
	let nozzle_R_logo = create_svg(
		"nozzle_R_logo",
		"nozzle_R_logo",
		"0 0 55.26 59.63",
		"fill:#000000;",
		"Calque 1",
		[
			["path",
				["d", "m32.65 20.28c0-1.81-1.56-3.2-3.85-3.2h-5.49v6.55h5.49c2.29 0 3.85-1.48 3.85-3.35z"]],
			["path",
				["d", "M47,23.75V0H8.24V23.75H0V43.47H10.18L23.91,59.63h7.92L46.05,43.47h9.21V23.75ZM32.4,34l-5.27-7.86H23.31V34h-3V14.49h8.6c3.93,0,6.69,2.51,6.69,5.76,0,3-2.14,5.27-5.35,5.77l6,8Z"]]]);
	let nozzle_L_logo = create_svg(
		"nozzle_L_logo",
		"nozzle_L_logo",
		"0 0 55.26 59.63",
		"fill:#000000;",
		"Calque 1",
		[
			["path",
				["d", "m47 23.75v-23.75h-38.76v23.75h-8.24v19.72h10.18l13.73 16.16h7.92l14.22-16.16h9.21v-19.72zm-11 10.25h-13v-19.51h3v16.83h10z"]]]);
	let bed_logo = create_svg(
		"bed_logo",
		"bed_logo",
		"0 0 66.64 41.98",
		"fill:#000000;",
		"Calque 1",
		[
			["rect",
				["y", "36.4"],
				["width", "66.64"],
				["height", "5.58"],
				["rx", "2.79"]],
			["path",
				["d", "M17,29.82a3,3,0,0,1-2.19-.95c-6.18-6.57-2.73-12-.46-15.53s3.15-5.23.39-8.36a3,3,0,0,1,4.51-4c5.85,6.64,2.42,12,.16,15.55s-3.21,5-.23,8.19A3,3,0,0,1,17,29.82Z"]],
			["path",
				["d", "M33.54,29.82a3,3,0,0,1-2.19-.95c-6.17-6.57-2.73-12-.46-15.53S34,8.11,31.28,5a3,3,0,0,1,4.51-4c5.85,6.64,2.43,12,.16,15.55s-3.21,5-.23,8.19a3,3,0,0,1-2.18,5.06Z"]],
			["path",
				["d", "M49.81,29.82a3,3,0,0,1-2.18-.95c-6.18-6.57-2.74-12-.46-15.53s3.15-5.23.39-8.36a3,3,0,0,1,4.5-4c5.85,6.64,2.43,12,.17,15.55s-3.21,5-.23,8.19A3,3,0,0,1,51.87,29,3,3,0,0,1,49.81,29.82Z"]]]);
	let nozzle_R_text = document.createElement('p');
	nozzle_R_text.className = "nozzle_R_text";
	nozzle_R_text.id = "nozzle_R_text";
	nozzle_R_text.innerHTML = "0°C";
	let nozzle_L_text = document.createElement('p');
	nozzle_L_text.className = "nozzle_L_text";
	nozzle_L_text.id = "nozzle_L_text";
	nozzle_L_text.innerHTML = "0°C";
	let bed_text = document.createElement('p');
	bed_text.className = "bed_text";
	bed_text.id = "bed_text";
	bed_text.innerHTML = "0°C";

	temperatures.appendChild(nozzle_R_logo);
	temperatures.appendChild(nozzle_R_text);
	temperatures.appendChild(nozzle_L_logo);
	temperatures.appendChild(nozzle_L_text);
	temperatures.appendChild(bed_logo);
	temperatures.appendChild(bed_text);
	individual_frame.appendChild(temperatures);


	// progress circle
	let progress_circle = progress_circle_generator();
	individual_frame.appendChild(progress_circle)

	// time left / status
	let time = div_generator("time");
	let center_time_text = div_generator("center-time-text");
	let finishes_in = document.createElement('p');
	finishes_in.setAttribute("style", "font-size:4vh;");
	finishes_in.innerHTML = "Finishes in";
	center_time_text.appendChild(finishes_in);
	let time_left_printer = document.createElement('p');
	time_left_printer.id = "time-left-printer";
	center_time_text.appendChild(time_left_printer);
	time.appendChild(center_time_text);
	individual_frame.appendChild(time);

	return individual_frame;
}

function create_svg(svg_id, svg_class, svg_viewbox, svg_style, svg_layerName, svg_paths) {
	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	let svgNS = svg.namespaceURI;
	svg.id = svg_id;
	svg.setAttribute("class", svg_class);
	svg.setAttribute("viewBox", svg_viewbox);
	svg.setAttribute("style", svg_style);

	let group = document.createElementNS(svgNS, "g");
	group.setAttribute("data-name", svg_layerName);

	for (let path of svg_paths) {
		let type = path[0];
		let path_element = document.createElementNS(svgNS, type);
		for (let i = 1; i < path.length; i++) {
			let key = path[i][0];
			let value = path[i][1];
			path_element.setAttribute(key, value);
		}
		group.appendChild(path_element);
	}
	svg.appendChild(group);
	return svg;
}


function create_general_screen() {
	for (let i = 0; i < 4; i++) {
		let general_grid_i = general_frame_generator(i);
		screens.appendChild(general_grid_i);
	}
}

function create_individual_screens(amount) {
	for (let i = 0; i < amount; i++) {
		let individual_frame_i = individual_screen_generator(i);
		document.body.appendChild(individual_frame_i);
	}
}

function create_connection_error_page() {
	let error_frame = div_generator("error_frame");
	error_frame.setAttribute("id", "error_frame");
	let error_message = document.createElement('p');
	error_message.innerHTML = "Connection error";
	let wifi_logo = create_svg(
		"wifi_logo",
		"wifi_logo",
		"0 0 52.2966 42.0359",
		"fill:#000000;",
		"Calque 1",
		[["path",
				["d", "m98.5 0c-15.7629 0-15.4162-0.439422-15.084 19.0996 0.838374 49.3322 2.63514 91.656 3.95703 93.2481 2.00799 2.41849 20.2461 2.41852 22.2539 0 1.06303-1.28053 1.63573-10.3544 2.53711-40.25 0.64007-21.2282 1.26269-45.3152 1.38477-53.5273 0.28165-18.969 0.60628-18.5703-15.0488-18.5703zm-25.6426 23.9961a131.615 122.018 0 0 0-73.1582 39.168l19.7461 19.5918a102.741 95.2495 0 0 1 53.4121-31.2812zm51.4277 0.166015v27.4258a102.741 95.2495 0 0 1 53.2109 31.3379l19.8594-19.6406a131.615 122.018 0 0 0-73.0703-39.123zm-51.4277 51.7402a80.4038 71.5109 0 0 0-37.1406 22.9961l18.0762 17.9336h0.861328a53.1453 47.2672 0 0 1 18.2031-14.5801zm51.4277 0.11914v26.3613a53.1453 47.2672 0 0 1 17.8594 14.4492h1.07031l17.9844-17.7891a80.4038 71.5109 0 0 0-36.9141-23.0215zm-25.8555 52.3477a15.2523 15.2523 0 0 0-15.252 15.252 15.2523 15.2523 0 0 0 15.252 15.2539 15.2523 15.2523 0 0 0 15.252-15.2539 15.2523 15.2523 0 0 0-15.252-15.252z"],
				["transform", "matrix(.264583 0 0 .264583 0 0)"]]]
	)
	error_frame.appendChild(wifi_logo);
	error_frame.appendChild(error_message);
	document.body.appendChild(error_frame);
}
