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

// electron.ipcRenderer.send('getAudioInput');

process.stdout.on('data', (data) => {
  var str = data.toString().trim();
  if (str == "hotword"){
    electron.ipcRenderer.send('getAudioInput');
    showLoading();
    process.exit(0);
  }
});

electron.ipcRenderer.on('timetable-reply', (event, arr) => {
  hideLoading();
  console.log(arr);
  $('#calendar').fullCalendar({
    defaultView: "agendaWeek",
    minTime: "08:00:00",
    maxTime: "19:00:00",
    height: 650,
    header: {
      left: '',
      center: '',
      right: '',
    },
    events: arr
  })
})

// this is shitty way of doing, should use something like React here!
electron.ipcRenderer.on('play-video', (e, id) => {
  hideLoading();
  $("#player").show();
  const loadVideo = () => {
    if (youtubePlayer && playerReady){
        youtubePlayer.loadVideoById(id);
      } else {
        setTimeout(() => {
          loadVideo();
        }, 30);
      }
  }
  loadVideo();
});

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
  var str = "<table class='weather-table'><tr>";
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
