const electron = require('electron');
const spawn = require("child_process").spawn; // spawns a python process
const fs = require('fs');

var process = spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]);
var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

function showLoading(){
  $(".main").html("<h2 class='bottom-center'>Loading..</h2>");
}

function hideLoading(){
  $(".main").html("");
}

process.stdout.on('data', function (data){
  var str = data.toString().trim();
  if (str == "hotword"){
    electron.ipcRenderer.send('getAudioInput');
    showLoading();
  }
});

electron.ipcRenderer.on('weather-reply', (event, data) => {
  hideLoading();
  var d = data.daily;
  $(".main").html("<h2>Today's Weather..</h2>" + "<p>" + data.currently.summary + " with temperatures up to " + data.currently.apparentTemperature + "°C." + "</p>");
  $(".main").append("<table>");
  for (i = 0; i < d.data.length; i++){
    $(".main").append("<tr><td>" + days[i] + "</td><td>"+d.data[i].summary+"</td></tr>");
  }
  $(".main").append("</table>");
});
