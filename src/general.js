"use strict";

import {get} from "./common.js";
import {host_url, printerAddresses} from "./index.js";
import {getPercentageTime, getTimeRemainingText, update_percentage} from "./utility.js";

export {screen_frame}

function screen_frame(printerAdresses) {
    for (let i = 0; i < printerAdresses.length; i++) {
        if (printerAdresses[i].name !== "general_screen") {
            if (printerAdresses[i].running === false) {
                generalFrameOff(printerAdresses[i], i + 1)
            } else if (printerAdresses[i].running === true) {
                generalFrameOn(printerAdresses[i], i + 1)
            }
        }
    }
}

async function generalFrameOff(printer, id) {
    let result = await get(host_url + "cluster-api/v1/print_jobs/history")
    let maintenance = await get(host_url + "cluster-api/v1/printers/")
    let recentJob = result[0]
    let time = result[0].print_end_time
    for (let i = 0; i < result.length; i++) {
        if (result[i].printer_uuid === printer.printer_uuid) {
            if (result[i].print_end_time >= time) {
                recentJob = result[i];
            }
        }
    }
    let pictureUrl = recentJob.uuid

    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', '../general.html', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let generalFrame = document.getElementById("general_frame_" + id)
            generalFrame.innerHTML = xhr.responseText;
            generalFrame.querySelector("#picture_iframe").src = host_url + "cluster-api/v1/print_jobs/" + pictureUrl + "/preview_image"
            generalFrame.querySelector("#general-printer-name").innerHTML = "Ultimaker " + printerAddresses[id - 1].name.replace("_", " (") + ")";

            let timeLeft = generalFrame.querySelector("#time-left");
            timeLeft.innerHTML = recentJob.status
            let percentage = getPercentageTime(recentJob.time_total || recentJob.estimated_time_total, recentJob.estimated_time_total);
            let border = document.getElementById("gradient_border_" + id);
            border.style.setProperty("--borderWidth", "0px");
            if (recentJob.status === "finished") {
                border.style.setProperty("--borderWidth", "10px");
                border.style.setProperty("--secondColor", "lightgreen");
                timeLeft.style.color = "green"
            } else if (recentJob.status === "aborted") {
                border.style.setProperty("--borderWidth", "10px")
                border.style.setProperty("--secondColor", "lightgreen");
                timeLeft.style.color = "red"
            } else {
                timeLeft.style.color = "red"
            }
            let el = generalFrame.querySelector("#graph-general");
            el.setAttribute('data-percent', percentage);
            update_percentage(el);
        }
    };
    xhr.send();
}

async function generalFrameOn(printer, id) {
    let printJobs = await get(printer.address + "api/v1/print_job");
    let jobUuid = await get(host_url + "cluster-api/v1/print_jobs/");
    let pictureUrl = jobUuid[0].uuid;
    for (let i = 0; i < jobUuid.length; i++) {
        if (jobUuid[i].printer_uuid === printer.printer_uuid && jobUuid[i].started) {
            pictureUrl = jobUuid[i].uuid;
        }
    }
    let printers = await get(host_url + "cluster-api/v1/printers/")
    let materials = printers[0].configuration

    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', '../general.html', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let generalFrame = document.getElementById("general_frame_" + id)
            generalFrame.innerHTML = xhr.responseText;
            generalFrame.querySelector("#general-printer-name").innerHTML = "Ultimaker " + printerAddresses[id - 1].name.replace("_", " (") + ")";
            generalFrame.querySelector("#picture_iframe").src = host_url + "cluster-api/v1/print_jobs/" + pictureUrl + "/preview_image"

            let timeLeft = generalFrame.querySelector("#time-left");
            timeLeft.innerHTML = getTimeRemainingText(printJobs.time_elapsed, printJobs.time_total);
            timeLeft.style.color = "black";
            let percentage = getPercentageTime(printJobs.time_elapsed, printJobs.time_total);
            let border = document.getElementById("gradient_border_" + id);
            border.style.setProperty("--borderWidth", "0px")
            if (percentage >= 100) {
                border.style.setProperty("--borderWidth", "10px")
                border.style.setProperty("--secondColor", "orange")
            }
            if (printJobs.result === "Aborted") {
                timeLeft.innerHTML = "aborted";
                timeLeft.style.color = "red";
            }
            if (!Number.isInteger(percentage)) {
                percentage = 0;
            }
            let el = generalFrame.querySelector("#graph-general"); // get canvas
            el.setAttribute('data-percent', percentage);
            update_percentage(el);
        }
    };
    xhr.send();
}