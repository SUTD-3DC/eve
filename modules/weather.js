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
