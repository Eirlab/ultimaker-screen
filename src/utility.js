export {changeSvgColor, getTimeRemainingText, getPercentageTime, update_percentage, confettiRain};
// ###########################
//     Change logo colors
// ###########################
function changeSvgColor(elementName, color) {
    let elem = document.getElementById(elementName);
    elem.style.fill = color;
}

// Examples
// changeSvgColor('nozzle_R_logo', 'red');
// changeSvgColor('nozzle_L_logo', 'blue');
// changeSvgColor('bed_logo', 'orange');

// ###########################
//     Time elapsed Circle
// ###########################

// Variables used to change time remaining text & progress circle.
// The unit of variables is the second
let totalTime = 3600; // 3600 seconds = 1h
let timeElapsed = 1200; // 1200 seconds = 20min


function getPercentageTime(nowSeconds, endSeconds) {
    if (nowSeconds === 0 && endSeconds === 0){
        return 0
    }
    let start = new Date();
    let end = new Date(start.getTime() + endSeconds * 1000);
    let now = new Date(start.getTime() + nowSeconds * 1000);
    return Math.round((now - start) / (end - start) * 100) < 100 ? Math.round((now - start) / (end - start) * 100) : 100;
}

function getTimeRemainingText(nowSeconds, endSeconds) {
    if (!Number.isInteger(nowSeconds) || !Number.isInteger(endSeconds)) {
        return ""
    }
    if (nowSeconds > endSeconds) {
        return "waiting"
    }
    if (nowSeconds === 0 && endSeconds === 0){
        return "preparing"
    }
    let start = new Date();
    let end = new Date(start.getTime() + endSeconds * 1000);
    let now = new Date(start.getTime() + nowSeconds * 1000);
    let timeRemaining = end - now;
    var milliseconds = Math.floor((timeRemaining % 1000) / 100),
        seconds = Math.floor((timeRemaining / 1000) % 60),
        minutes = Math.floor((timeRemaining / (1000 * 60)) % 60),
        hours = Math.floor((timeRemaining / (1000 * 60 * 60)));
    hours = (hours == 0) ? "" : (hours < 10) ? "0" + hours + "h" : hours + "h";
    minutes = (minutes == 0) ? "" : (minutes < 10) ? "0" + minutes + "m" : minutes + "m";
    seconds = (seconds == 0) ? "" : (seconds < 10) ? "0" + seconds + "s" : seconds + "s";
    return hours + minutes; // + seconds + ", " + milliseconds + "ms";
}

let el = document.getElementById('graph'); // get canvas
var canvas = document.createElement('canvas');
canvas.setAttribute("id", "canvas");
var span = document.createElement('span');
span.setAttribute("id", "span");
el.appendChild(span);
el.appendChild(canvas);

function update_percentage(el) {
    var options = {
        percent: el.getAttribute('data-percent') || 25,
        size: el.getAttribute('data-size') || 220,
        lineWidth: el.getAttribute('data-line') || 15,
        rotate: el.getAttribute('data-rotate') || 0
    }
    var canvas = el.querySelector("#canvas");
    var span = el.querySelector("#span");
    // var canvas = document.getElementById('canvas');
    // var span = document.getElementById('span');
    span.textContent = options.percent + '%';

    if (typeof (G_vmlCanvasManager) !== 'undefined') {
        G_vmlCanvasManager.initElement(canvas);
    }

    var ctx = canvas.getContext('2d');
    canvas.width = canvas.height = options.size;

    ctx.translate(options.size / 2, options.size / 2); // change center
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

//imd = ctx.getImageData(0, 0, 240, 240);
    var radius = (options.size - options.lineWidth) / 2;

    var drawCircle = function (color, lineWidth, percent) {
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

function confettiRain() {
    for (let i = 0; i < 200; i++) {
        // Random rotation
        var randomRotation = Math.floor(Math.random() * 360);
        // Random width & height between 0 and viewport
        var randomWidth = Math.floor(Math.random() * Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
        var randomHeight = Math.floor(Math.random() * Math.max(document.documentElement.clientHeight, window.innerHeight || 0));

        // Random animation-delay
        var randomAnimationDelay = Math.floor(Math.random() * 10);

        // Random colors
        var colors = ['#6bb100',
            '#FF1C1C',
            '#FF93DE',
            '#0a1577',
            '#FFC61C',
            '#009edc',
            '#f78500',
            '#eb008d']
        var randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Create confetti piece
        var confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.top = randomHeight + 'px';
        confetti.style.left = randomWidth + 'px';
        confetti.style.backgroundColor = randomColor;
        confetti.style.transform = 'skew(15deg) rotate(' + randomRotation + 'deg)';
        confetti.style.animationDelay = randomAnimationDelay + 's';
        document.getElementById("confetti-wrapper").appendChild(confetti);
    }
}