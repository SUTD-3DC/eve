const electron = require('electron');

electron.ipcRenderer.on('loading', (event, message) => {
  if (message){
    $(".main").html("<h2 class='bottom-center'>Loading..</h2>");
  }
  else {
    $(".main").html("");
  }

});

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

electron.ipcRenderer.on('weather', (event, data) => {
  var d = data.daily;
  $(".main").html("<h2>Today's Weather..</h2>" + "<p>" + data.currently.summary + " with temperatures up to " + data.currently.apparentTemperature + "°C." + "</p>");
  $(".main").append("<table>");
  for (i = 0; i < d.data.length; i++){
    $(".main").append("<tr><td>" + days[i] + "</td><td>"+d.data[i].summary+"</td></tr>");
  }
  $(".main").append("</table>");
})

electron.ipcRenderer.on('decode', (event, message) => {
  $("footer").html("You said: " + message);
  request.get(
    { headers: { "Authorization": config.wit.key },
      url: 'https://api.wit.ai/message?v=20160902&q='+message
    },
    function(err, httpResponse, body){
      console.log(body);
      if (err) {
        return console.error(err);
      }
      if (body.intent !== null){
        // there is a valid response
        if (body.intent[0].value === "weather"){
          // get weather
          // if (body.entities.location !== null){
            // get weather in location
          // } else {
            // get in singapore
          let url = `https://api.forecast.io/forecast/${config.weather.key}/1.352083,103.819836?units=${config.weather.units}&exclude=minutely,hourly`
          var request = https.get(url, function (response) {
            var buffer = "", data, route;

            response.on("data", function (chunk) {
              buffer += chunk;
            });

            response.on("end", function (err) {
              data = JSON.parse(buffer);
              mainWindow.webContents.send("weather", data)
            });
          });
        }
      }
    });
});
