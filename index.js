'use strict';
const electron = require('electron');
const config = require('./config.js');
const https = require('https');
const request = require("request");
const fs = require("fs");
const exec = require('child_process').exec;

const app = electron.app;
const ipcMain = electron.ipcMain;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/index.html`);
  win.setFullScreen(true);
  win.on('closed', onClosed);

  return win;
}
ipcMain.on("getAudioInput", (event) => {
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
        ipcMain.send("decode", body.results[0].alternatives[0].transcript);
      });
    });
  });
})

ipcMain.on("decode", (event, message) => {
  var e = event;

  request.get(
    { headers: { "Authorization": config.wit.key },
    url: 'https://api.wit.ai/message?v=20160902&q='+message
  },
  (err, httpResponse, body) => {
    var response = JSON.parse(body);
    if (err) {
      return console.error(err);
    }
    if (response.entities.intent !== null){
      // there is a valid response
      if (response.entities.intent[0].value === "weather"){
        console.log("getting weather..");
        // get weather
        // if (body.entities.location !== null){
          // get weather in location
        // } else {
          // get in singapore
          let url = `https://api.forecast.io/forecast/${config.weather.key}/1.352083,103.819836?units=${config.weather.units}&exclude=minutely,hourly`
          var request = https.get(url, function(res) {
            var buffer = "", data, route;

            res.on("data", function(chunk) {
              buffer += chunk;
            });

            res.on("end", function(err) {
              data = JSON.parse(buffer);
              e.sender.send('weather-reply', data);
            });
          });
        }
      }
    });
});


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
