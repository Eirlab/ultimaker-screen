export {getTimeRemainingText, getPercentageTime};

// ###########################
//     Time elapsed Circle
// ###########################

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
    if (Math.abs(nowSeconds - endSeconds) === 0){
        return "finished"
    }

    let start = new Date();
    let end = new Date(start.getTime() + endSeconds * 1000);
    let now = new Date(start.getTime() + nowSeconds * 1000);
    let timeRemaining = end - now;

    // computing h, m, s, ms from ms
    let milliseconds = Math.floor((timeRemaining % 1000) / 100),
        seconds = Math.floor((timeRemaining / 1000) % 60),
        minutes = Math.floor((timeRemaining / (1000 * 60)) % 60),
        hours = Math.floor((timeRemaining / (1000 * 60 * 60)));

    // converting integers to str and formating them to always have the same length
    // ex: "73h03m", "09h40m"
    let hoursStr = (hours === 0) ? "" : (hours < 10) ? "0" + hours + "h" : hours + "h";
    let minutesStr = (minutes === 0) ? "" : (minutes < 10) ? "0" + minutes + "m" : minutes + "m";

    // If hours > 99, then only hours will be displayed (ex: "173h")
    return hours > 99 ? hoursStr : hoursStr + minutesStr;
}
