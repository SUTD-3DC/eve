electron.ipcRenderer.on('decode', (event, message) => {
  $("footer").html("You said: " + message);
  // request.get({ headers: {
  //   "Authorization": config.wit.key,
  //   'Content-Type': 'application/json'},
  //   url: 'https://api.wit.ai/message?v=20160902&q='+message},
  //   function(err, httpResponse, body){
  //     console.log(body);
  //     if (err) {
  //       return console.error(err);
  //     }
  //     // let url = `https://api.forecast.io/forecast/${config.weather.key}/1.352083,103.819836?units=${config.weather.units}&exclude=minutely,hourly`
  //     // var request = https.get(url, function (response) {
  //     //   var buffer = "", data, route;

  //     //   response.on("data", function (chunk) {
  //     //     buffer += chunk;
  //     //   });

  //     //   response.on("end", function (err) {
  //     //     data = JSON.parse(buffer);
  //     //     mainWindow.webContents.send("weather", data)
  //     //   });
  //     // });
  //   }
  // );
});
