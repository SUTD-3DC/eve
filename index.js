'use strict';
const electron = require('electron');
const config = require('./config.js');
const https = require('https');
const request = require("request");
const fs = require("fs");
const exec = require('child_process').exec;

const app = electron.app;

const google = require('googleapis');

var authClient;

google.auth.getApplicationDefault( (err, ac) => {
  if (err) {
    console.log(err);
  } else if (ac.createScopedRequired && ac.createScopedRequired()) {
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

electron.ipcMain.on("getAudioInput", (event) => {
  exec('AUDIODEV=hw:1;0 rec --encoding signed-integer --bits 16 --channels 1 --rate 16000 out.wav trim 0 3', () => {
    var bitmap = fs.readFileSync("out.wav");
    var audioString = new Buffer(bitmap).toString('base64');
    google.speech('v1beta1').speech.syncrecognize({
      "auth": authClient,
      "resource": {
        "config": {
          "encoding": "LINEAR16",
          "sampleRate": 16000,
          "speechContext": {
            "phrases": [ "f01", "f02", "f03", "f04", "f05", "f06", "f07", "f08", "f09"]
          }
        },
        "audio": {
          "content": audioString,
        }
      }}, (err, response) => {
        if (err) {
          console.error(err)
        }
      fs.unlink("out.wav");
      console.log(response.results[0].alternatives[0].transcript);
      decode(event, response.results[0].alternatives[0].transcript);
    });
  });
});

const renderResponse = (event, response, message) => {
  try {
    if (response.entities.intent !== null){
      // there is a valid response
      console.log(response.entities);
      switch (response.entities.intent[0].value) {
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
          break
        case "timetable":
          var q = response.entities.local_search_query ? response.entities.local_search_query[0].value : response.entities.search_query[0].value
          getTimetable(event, q.toUpperCase());
          break
        case "video":
          var q = response.entities.local_search_query ? response.entities.local_search_query[0].value : response.entities.search_query[0].value
          getVideo(event, q);
          break
        default:
          console.log("no value responses.");
      }
    }
  } catch(e){
    event.sender.send('undefined-method', message)
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
const decode = (event, message) => {
  request.get(
    { headers: { "Authorization": "Bearer " + config.wit.key },
    url: 'https://api.wit.ai/message?v=20160902&q='+message
  },
  (err, httpResponse, body) => {
    var response = JSON.parse(body);
    if (err) {
      return console.error(err);
    }
    renderResponse(event, response, message);
  });
};


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
