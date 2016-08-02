'use strict';
const electron = require('electron');
const app = electron.app;
const spawn = require("child_process").spawn; // spawns a python process
const config = require('config');
var http = require("http");

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

  var process = spawn('python',["speech/srs.py", "speech/resources/snowboy.umdl",
   "speech/resources/weather.pmdl"]);

  process.stdout.on('data', function (data){
    var str = data.toString().trim();
    console.log(str);
    switch (str){
      case "weather":
        mainWindow.webContents.send("loading", true);
        let url = `https://api.forecast.io/forecast/${config.weather.key}/1.352083,103.819836`
        var request = http.get(url, function (response) {
          // data is streamed in chunks from the server
          // so we have to handle the "data" event
          var buffer = "",
          data,
          route;

          response.on("data", function (chunk) {
            buffer += chunk;
          });

          response.on("end", function (err) {
            data = JSON.parse(buffer);
            mainWindow.webContents.send("weather", data)
          });
        });
      break
    }
    // mainWindow.webContents.send('keyword-spotted', str);
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
