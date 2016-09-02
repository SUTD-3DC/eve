'use strict';
const electron = require('electron');
const app = electron.app;
const spawn = require("child_process").spawn; // spawns a python process
const exec = require('child_process').exec;
const config = require('./config.js');

var request = require("request");

// // pocketsphinx variables
var fs = require("fs");
var key = require('./.keyfile.json');

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

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
        mainWindow.webContents.send("decode", body.results[0].alternatives[0].transcript);
        mainWindow.webContents.send("loading", false);
      });
    });
  });
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/index.html`);
  win.setFullScreen(true);
  win.on('closed', onClosed);

  var process = spawn('python',["speech/srs.py", "speech/resources/hotword.pmdl"]);

  process.stdout.on('data', function (data){
    var str = data.toString().trim();
    if (str == "hotword"){
      mainWindow.webContents.send("loading", true);
      getAudioInput();
    }
  });

  return win;
}

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
