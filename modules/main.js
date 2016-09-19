const electron = require('electron');
const spawn = require("child_process").spawn; // spawns a python process
const fs = require('fs');

var process = spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]);
var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

function showLoading(){
  $(".main").html("<h2 class='bottom-center'>Loading..</h2>");
}

function hideLoading(){
  $(".main").html("");
}

electron.ipcRenderer.send('getAudioInput');
// process.stdout.on('data', function (data){
//   var str = data.toString().trim();
//   if (str == "hotword"){
//     electron.ipcRenderer.send('getAudioInput');
//     showLoading();
//   }
// });

electron.ipcRenderer.on('timetable-reply', (event, arr) => {
  hideLoading();
  // default to show timetable this week
  // reset timezone because API returns date without timezone
  var offset = new Date().getTimezoneOffset()*60*1000
  var grouped_events = _.chain(arr).groupBy((e) => {
    return new Date(Date.parse(e.start) + offset).toISOString().split("T")[0]
  }).value();

  // convert the groups into arrays
  var events = []
  for (date in grouped_events){
    events.push(grouped_events[date]);
  }

  var str = "";
  var days_to_loop = (events.length < 5 ? events.length : 5)
  var table = "<table class='timetable'>"
  for (var i = 8; i < 20; i++){
    var converted_time = i >= 10 ? i.toString() + "00" : "0" + i.toString() + "00"
    var half_converted_time = i >= 10 ? i.toString() + "30" : "0" + i.toString() + "30"

    table += `<tr><td rowspan='2'>${converted_time}</td>`
    for (var j = 0; j < days_to_loop; j++){
      table += `<td class='${converted_time}-${j}'></td>`
    }
    table += "</tr><tr><td></td>"
    for (var j = 0; j < days_to_loop; j++){
      table += `<td class='${half_converted_time}-${j}'></td>`
    }
    table += "</tr>"
  }
  table += "</table>"
  $(

  // for (var i = 0; i < days_to_loop; i++){
  //   for (var j = 0; j < events[i].length; j++){
  //     // console.log(events[i][j]);
  //     str += `${events[i][j].title}<br/>`
  //   }
  //   str += "<br/>"
  // }
})

electron.ipcRenderer.on('weather-reply', (event, arr) => {
  hideLoading();
  var data = arr[0];
  var len = data.hourly.data.length;
  var date = new Date();
  var hoursToMidnight =  24 - date.getHours();
  var skycons = new Skycons({"color": "white"});

  $(".main").html(
    `<h2>Today's Weather in ${arr[1].capitalizeFirstLetter()}..</h2>` +
    `<p> ${data.hourly.summary}</p>` +
    `<p> Temperatures up to ${data.hourly.data[0].temperature}°C.</p>`
  );
  var str = "<table><tr>";
  for (var i = 0; i < hoursToMidnight; i++){
    var hour = date.getHours();
    str += `<td><div>${hour}:00</div><canvas id="icon${i}" width="64" height="64"></td>`;
    date.setHours(date.getHours() + 1);
  }
  str += `</tr></table>`;
  $(".main").append(str);
  for (var i = 0; i < hoursToMidnight; i++){
    skycons.add(`icon${i}`, data.hourly.data[i].icon);
  }
  skycons.play();
});
