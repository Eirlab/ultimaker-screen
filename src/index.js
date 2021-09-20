"use strict";

import {get} from "./common.js";
import {screen_frame} from "./general.js";
import {changeSvgColor, confettiRain, getPercentageTime, getTimeRemainingText, update_percentage} from "./utility.js";
import {setLights} from "./light.js";

export {host_url, printerAddresses}


let currentDisplay = 0;
let lastJob = null;
let confetti = null;
const host_url = "http://192.168.0.109/";
let identifier = null

let confetti_jobs = ["1942e309-6f87-4725-af10-82cc272ba959"]

/**
 * Dictionary of eirlab printers including their name, their address in the eirlabIot network and a boolean indicating if a print is in progress
 * @type {[{running: boolean, address: string, name: string}, {running: boolean, address: string, name: string}]}
 */
const printerAddresses = [
    {
        name: "s5_1",
        address: "http://192.168.0.109/",
        running: false,
        printer_uuid: "d959a261-02e6-42b5-a310-380ce7596611"
    },
    {
        name: "s3_1",
        address: "http://192.168.0.114/",
        running: false,
        printer_uuid: "0f215a23-0317-43b5-8a04-69b8fb918dde"
    },
    {name: "general_screen", address: "", running: true},
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Performs all the necessary queries to obtain the relevant printer information and updates the printer-frame in the index.html
 * @param url
 * @returns {Promise<void>}
 */
async function completeProcessPrinter(url) {
    let printJobs = await get(url + "api/v1/print_job");
    let timeLeft = document.getElementById('time-left-printer');
    timeLeft.innerHTML = getTimeRemainingText(printJobs.time_elapsed, printJobs.time_total);
    timeLeft.style.color = "black";
    let percentage = getPercentageTime(printJobs.time_elapsed, printJobs.time_total);
    if(printJobs.result === "Aborted"){
        timeLeft.innerHTML = "aborted";
        timeLeft.style.color = "red";
    }else if (printJobs.result === "Finished"){
        timeLeft.innerHTML = "waiting";
        timeLeft.style.color = "orange";
    }
    if (!Number.isInteger(percentage)) {
        percentage = 0;
    }
    let confetti_time = false
    if(percentage >= 100){
        confetti_time = true
    }
    for(let i = 0; i < confetti_jobs.length; i++){
        if(printJobs.uuid === confetti_jobs[i]){
            confetti_time = false
            try {
                document.getElementById("confetti-wrapper").remove()
            }catch (err){}
            break;
        }
    }
    if(confetti_time === true){
        console.log(confetti_jobs)
        confetti = document.createElement("div");
        confetti.setAttribute("id", "confetti-wrapper");
        document.getElementById("printer_frame").appendChild(confetti);
        confettiRain();
        setLights();
        confetti_jobs.push(printJobs.uuid);
        await sleep(1000)
    }
    let el = document.getElementById('graph'); // get canvas
    el.setAttribute('data-percent', percentage);
    update_percentage(el);

    let temperatureBed = await get(url + "api/v1/printer/bed/temperature");
    let temperatureHead = await get(url + "api/v1/printer/heads");
    temperatureTreatment(temperatureBed, temperatureHead)
}

function heatMapColorForValue(value) {
    var h = (1.0 - value) * 255;
    let r = 255;
    let g = (h <= 210) ? h : 210;
    let b = 0;
    return "rgb(" + r + "," + g + "," + b + ")";
}


function temperatureTreatment(tempreratureBed, temperatureHead) {
    // bed
    const currentBed = tempreratureBed.current;
    document.getElementById("bed_text").innerHTML = Math.floor(currentBed) + " °C";
    let colorBed = heatMapColorForValue(1 - (1 - currentBed / 60) * 2);
    changeSvgColor("bed_logo", colorBed);

    const currentHeadLeft = temperatureHead[0].extruders[0].hotend.temperature.current;
    const currentHeadRight = temperatureHead[0].extruders[1].hotend.temperature.current;

    let colorRight = heatMapColorForValue(1 - (1 - currentHeadRight / 250) * 2);
    changeSvgColor("nozzle_R_logo", colorRight);
    document.getElementById("nozzle_R_text").innerHTML = Math.floor(currentHeadRight) + " °C";

    let colorLeft = heatMapColorForValue(1 - (1 - currentHeadLeft / 250) * 2);
    changeSvgColor("nozzle_L_logo", colorLeft);
    document.getElementById("nozzle_L_text").innerHTML = Math.floor(currentHeadLeft) + " °C";
}

async function checkPrinters() {
    for (let i in printerAddresses) {
        if (printerAddresses[i].name !== "general_screen") {
            let result = await get(printerAddresses[i].address + "api/v1/printer/status");
            if (result === "printing") {
                printerAddresses[i].running = true;
            } else if (result === "idle") {
                printerAddresses[i].running = false;
            }
        }
    }
}

/**
 * call completeProcessPrinter every 30 secondes
 */
function printerLoop(id) {
    if (id !== printerAddresses.length - 1) {
        if (Number.isInteger(id))
            identifier = id
        if (identifier == currentDisplay) {
            completeProcessPrinter(printerAddresses[identifier].address);
            document.getElementById("printer_name").innerHTML = "Ultimaker " + printerAddresses[identifier].name.replace("_", " (") + ")";
        }
        setTimeout(printerLoop, 10000);
    }
}

async function staticData(printer) {
    let cameraUrl = await get(printer.address + "api/v1/camera");
    document.getElementById("camera1_iframe").src = cameraUrl.feed;
    let jobUuid = await get(host_url + "cluster-api/v1/print_jobs/");
    let pictureUrl = jobUuid[0].uuid;
    for (let i = 0; i < jobUuid.length; i++) {
        if (jobUuid[i].printer_uuid === printer.printer_uuid && jobUuid[i].started === true) {
            pictureUrl = jobUuid[i].uuid;
        }
    }
    document.getElementById("picture1_iframe").src = host_url + "cluster-api/v1/print_jobs/" + pictureUrl + "/preview_image"
}

/**
 * main function, checks which printers are up to date and calls the function that updates the interface. This function is called every 5 minutes
 */
function generalLoop() {
    checkPrinters();
    if (printerAddresses[currentDisplay].running === true) {
        if (currentDisplay === printerAddresses.length - 1) {
            document.getElementById("printer_frame").style.display = "none";
            document.getElementById("loader").style.display = "none";
            document.getElementById("screen").style.display = "grid";
            screen_frame(printerAddresses)
        } else {
            document.getElementById("printer_frame").style.display = "grid";
            document.getElementById("loader").style.display = "none";
            document.getElementById("screen").style.display = "none";
            staticData(printerAddresses[currentDisplay]);
            printerLoop(currentDisplay)
        }
    }
    currentDisplay++;
    if (currentDisplay > printerAddresses.length - 1) {
        currentDisplay = 0
    }
    setTimeout(generalLoop, 60000);
}


checkPrinters();
generalLoop();
