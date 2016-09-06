const electron = require('electron');
const spawn = require("child_process").spawn; // spawns a python process
const exec = require('child_process').exec;

var process = spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]);
var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

function getAudioInput(){
  // for osx:    ffmpeg -f avfoundation -i ":0" -t 3 -ar 16000 -ac 1 -sample_fmt s16 out.wav
  // for jessie:
  exec('rec --encoding signed-integer --bits 16 --channels 1 --rate 16000 out.wav trim 0 3', function(){
    fs.readFile("out.wav", function(err, data) {
      request.post({
        headers: { 'Content-Type': 'application/json', 'Authorization': config.speech.key},
        url: 'https://speech.googleapis.com/v1beta1/speech:syncrecognize',
        json: {
          "config": {
            "encoding":"LINEAR16",
            "sample_rate": 16000
          },
          "audio": {
            "content": data.toString('base64')
          }
        }
      }, function(err, httpResponse, body){
        console.log(httpResponse);
        if (err) {
          return console.error(err);
        }
        fs.unlink("out.wav")
        console.log(body.results[0].alternatives[0].transcript);
        // mainWindow.webContents.send("decode", body.results[0].alternatives[0].transcript);
        // mainWindow.webContents.send("loading", false);
      });
    });
  });
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
    // getAudioInput();
    showLoading();
    electron.ipcRenderer.send("decode", "what is the weather today");
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
