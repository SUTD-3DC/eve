electron.ipcRenderer.on('decode', (event, message) => {
  $("footer").html("You said: " + message);
});
