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

process.stdout.on('data', function (data){
  var str = data.toString().trim();
  if (str == "hotword"){
    electron.ipcRenderer.send('getAudioInput');
    showLoading();
  }
});

electron.ipcRenderer.on('weather-reply', (event, arr) => {
  hideLoading();
  var data = arr[0];
  var d = data.daily;
  $(".main").html("<h2>Today's Weather in " + arr[1].capitalizeFirstLetter() + "..</h2>" + "<p>" + data.currently.summary + " with temperatures up to " + data.currently.apparentTemperature + "°C." + "</p>");
});
