'use strict';
const electron = require('electron');
const app = electron.app;
const spawn = require("child_process").spawn; // spawns a python process

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

  var process = spawn('python',["snowboy/demo.py", "snowboy/resources/snowboy.umdl"]);

  process.stdout.on('data', function (data){
    console.log(data.toString());
    mainWindow.webContents.send('keyword-spotted', true)
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
