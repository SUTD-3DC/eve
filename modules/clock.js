function startTime() {
    var today = new Date();
    var h = today.getHours()
    var hh = h > 12 ? h - 12 : h;
    var ampm = h > 12 ? "PM" : "AM"
    var m = today.getMinutes();
    var month = ["January", "Feburary", "March", "April", "May", "June", "July",
                 "August", "September", "October", "November", "December"];

    // var s = today.getSeconds();
    m = checkTime(m);
    $('.date').html(today.getDate() + " " + month[today.getMonth()] + " " + today.getFullYear());
    $('.time').html(hh + ":" + m + " " + ampm);
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

startTime();
