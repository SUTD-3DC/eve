'use strict';
const electron = require('electron');
const config = require('./config.js');
const https = require('https');
const request = require("request");
const fs = require("fs");
const exec = require('child_process').exec;

const app = electron.app;
const ipcMain = electron.ipcMain;

const google = require('googleapis');

var authClient;

google.auth.getApplicationDefault( (err, ac) => {
  if (err) {
    console.log(err);
  }
  if (ac.createScopedRequired && ac.createScopedRequired()) {
    authClient = ac.createScoped(['https://www.googleapis.com/auth/cloud-platform']);
  }
});

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;
let lat = '1.352083';
let lng = '103.819836';

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

  // google speech relay
  exec('rec --encoding signed-integer --bits 16 --channels 1 --rate 16000 out.wav trim 0 3', () => {
    fs.readFile("out.wav", (err, data) => {
      google.speech('v1beta1').syncrecognize({
        "resource": data.toString('base64'),
        "auth": authClient,
        "key": config.google.key },
        { "encoding": "LINEAR16",
          "sample_rate": 16000
        }, (err, response) => {
          if (err) {
            console.error(err)
          }
          // fs.unlink("out.wav");
          ipcMain.send("decode", response.results[0].alternatives[0].transcript);
        });
  //     request.post({
  //       headers: { 'Content-Type': 'application/json', 'Authorization': config.speech.key},
  //       url: 'https://speech.googleapis.com/v1beta1/speech:syncrecognize',
  //       json: {
  //         "config": {
  //           "encoding":"LINEAR16",
  //           "sample_rate": 16000
  //         },
  //         "audio": {
  //           "content": data.toString('base64')
  //         }
  //       }
  //     }, function(err, httpResponse, body){
  //       console.log(httpResponse);
  //       if (err) {
  //         return console.error(err);
  //       }
  //       fs.unlink("out.wav")
  //       ipcMain.send("decode", body.results[0].alternatives[0].transcript);
  //     });
    });
  });

  // straight to wit
  // exec('rec --encoding signed-integer --bits 16 --channels 1 --rate 16000 out.wav trim 0 3', function(){
  //   fs.readFile("out.wav", function(err, data) {
  //     request.post({
  //       headers: { 'Authorization': 'Bearer ' + config.wit.key,
  //                  'Content-Type': 'audio/wav'},
  //       url: 'https://api.wit.ai/speech?v=20160902',
  //       body: data
  //     }, function(err, httpResponse, body){
  //       if (err) {
  //         return console.error(err);
  //       }
  //       fs.unlink("out.wav")
  //       renderResponse(event, JSON.parse(body));
  //     });
  //   });
  // });
  // getVideo(event, "why taeyeon");
  // getTimetable(event, "F02");
})

const renderResponse = (event, response) => {
  console.log(response);
  try {
    if (response.entities.intent !== null){
        // there is a valid response
      switch (response.entites.intent[0].value) {
        case "weather":
          if (response.entities.location !== null){
            // get weather in location
            https.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${response.entities.location[0].value}`, (res) => {
              var buffer = "", data;

              res.on("data", (chunk) => {
                buffer += chunk;
              });

              res.on("end", (err) => {
                data = JSON.parse(buffer);
                lat = data.results[0].geometry.location.lat;
                lng = data.results[0].geometry.location.lng;
                getWeather(event, response.entities.location[0].value);
              });
            })
          } else {
            // get in singapore
            getWeather(event, "Singapore");
          }
        case "timetable":
          getTimetable(event, response.entities.search_query[0].value.toUpperCase());
        default:
          console.log("no value responses.");
      }
    }
  } catch(e){
  }
}

const getTimetable = (event, group) => {
  request.get(
    {url: 'http://sutd-timetable.herokuapp.com/group_sections?' + group},
    (err, httpResponse, body) => {
      var res = JSON.parse(body);
      event.sender.send('timetable-reply', res.events);
    }
  );
}

const getVideo = (event, query) => {
  // event.sender.send('play-video', "Ri6wvGjuoOg");
  google.youtube('v3').search.list({"q": query, "part": "snippet", "maxResults": 1, "key": config.google.key}, (err, val) =>{
    if (val.items[0].id.kind == "youtube#video"){
      event.sender.send('play-video', val.items[0].id.videoId);
    };
  });
}

const getWeather = (event, location) => {
  let url = `https://api.forecast.io/forecast/${config.weather.key}/${lat},${lng}?units=${config.weather.units}&exclude=currently,daily`
  var request = https.get(url, (res) => {
    var buffer = "", data;

    res.on("data", (chunk) => {
      buffer += chunk;
    });

    res.on("end", (err) => {
      data = JSON.parse(buffer);
      event.sender.send('weather-reply', [data, location]);
    });
  });
}

ipcMain.on("decode", (event, message) => {
  request.get(
    { headers: { "Authorization": config.wit.key },
    url: 'https://api.wit.ai/message?v=20160902&q='+message
  },
  (err, httpResponse, body) => {
    var response = JSON.parse(body);
    if (err) {
      return console.error(err);
    }
    renderResponse(event, response);
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
