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
  var len = data.hourly.data.length;
  var date = new Date();

  $(".main").html(
    `<h2>Today's Weather in ${arr[1].capitalizeFirstLetter()}..</h2>` +
    `<p> ${data.hourly.summary}</p>` +
    `<p> Temperatures up to ${data.hourly.data[0].temperature}°C.</p>`
  );
  var str = "<table><tr>";
  for (var i = 0; i < len; i++){
    var hour = date.getHours();
    str += `<td>${hour}:00</td>`;
    date.setHours(date.getHours() + 1);
  }
  str += "</tr><tr>";
  for (var i = 0; i < len; i++){
    str += `<td>${data.hourly.data[i].icon}</td>`;
  }
  str += `</tr></table>`;
  $(".main").append(str);
});
