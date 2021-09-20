import {get, post, put} from "./common.js"
export {setLights}

let lights_backup = null
let number = null

async function getLights(){
    lights_backup = await get("http://192.168.0.102/api/ck-wmda91RckYfk6CMIDdLO81VRLh2Z15IZYDPNM/lights")
    number = Object.keys(lights_backup).length
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomColor(id) {
    let hue = getRandomInt(65535);
    let saturation = 254;
    let brightness = 254;

    let color = {"on":true,
        "sat":saturation,
        "bri":brightness,
        "hue":hue};
    return color;
}

async function setLights(){
    await getLights()
    for(let i=0; i<number; i++){
        let test = await put("http://192.168.0.102/api/ck-wmda91RckYfk6CMIDdLO81VRLh2Z15IZYDPNM/lights/"+i+"/state",
            {"on": true, "sat":254, "bri":254, "hue":10000, "ct":182})
    }
    for(let i=0; i<20; i++){
        await onlights()
        await sleep(500)
    }
    await offLights()
}

async function onlights(){
    for(let i=0; i<number; i++){
        let test = await put("http://192.168.0.102/api/ck-wmda91RckYfk6CMIDdLO81VRLh2Z15IZYDPNM/lights/"+i+"/state",
            getRandomColor(i))
    }
}

async function offLights(){
    await sleep(1000)
    for(let i=1; i<=number; i++){
        let test = await put("http://192.168.0.102/api/ck-wmda91RckYfk6CMIDdLO81VRLh2Z15IZYDPNM/lights/"+i+"/state",
            lights_backup[String(i)].state)
    }
}