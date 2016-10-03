const electron = require('electron');
const fs = require('fs');
const record = require('node-record-lpcm16');
const {Detector, Models} = require('snowboy');
const models = new Models();

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


models.add({
  file: 'resources/hotword.pmdl',
  sensitivity: '0.5',
  hotwords : 'hey-eve'
});

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: 2.0
});

detector.on('silence', function () {
  console.log('silence');
});

detector.on('sound', function () {
  console.log('sound');
});

detector.on('error', function () {
  console.log('error');
});

detector.on('hotword', function (index, hotword) {
  console.log('hotword', index, hotword);
});

const mic = record.start({
  threshold: 0,
  verbose: true
});

mic.pipe(detector);


// function waitForHotWord(p){
//   p.stdout.on('data', (data) => {
//     var str = data.toString().trim();
//     if (str == "hotword"){
//       electron.ipcRenderer.send('getAudioInput');
//       showLoading();
//       p.kill('SIGKILL');
//     }
//   });
// }

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
  waitForHotWord(spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]));
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

electron.ipcRenderer.on('undefined-method', (event, str) => {
  $(".main").html(
    `<h1>Sorry I couldn't understand what you said!</h1>`+
    `<h2>I heard: ${str}</h2>`
  );
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
  waitForHotWord(spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]));
});
