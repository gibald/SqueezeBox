var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function ajaxJSONPost(url, jsondata, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    // console.log(xhr.readyState);
    // console.log(xhr.status);
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(xhr.responseText);
    }
  }
  xhr.send(jsondata);
}

function locationError(err) {
  console.log('Error requesting location!');
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log('PebbleKit JS ready!');
  }
);

function trackInfo() {
  // console.log("Button SELECT");
  var url1="http://192.168.1.40:9002/jsonrpc.js";
  var myData='{"id":1,"method":"slim.request","params":["00:04:20:26:27:45",["status","-",1,"tags:gABbehldiqtyrSuoKLN"]]}'
  ajaxJSONPost(url1, myData,
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);
      var title = json.result.playlist_loop[0].title;
      var albumartist = json.result.playlist_loop[0].artist;
      var album = json.result.playlist_loop[0].album;
      // var info = title+" de "+album+" par "+albumartist;
      // console.log(info);

      // Assemble dictionary using our keys
      var dictionary = {
        "TITLE_INFO": title,
        "ARTIST_INFO": albumartist,
        "ALBUM_INFO": album,
      };
 
      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
    }
  );
}

Pebble.addEventListener("showConfiguration",
  function(e) {
    //Load the remote config page
    Pebble.openURL("http://srv.gibald.com/pebble.html");
  }
);

Pebble.addEventListener("webviewclosed",
  function(e) {
    //Get JSON dictionary
    var configuration = JSON.parse(decodeURIComponent(e.response));
    console.log("Configuration window returned: " + JSON.stringify(configuration));
    var SQ_IP=configuration.ip;
    var SQ_Port=configuration.port;
    SQ_Adress="http://"+SQ_IP+":"+SQ_Port;

    localStorage.setItem(5, SQ_Adress);
    // console.log("111"+SQ_Adress);
    //Send to Pebble, persist there
    Pebble.sendAppMessage(
      {"SQ_ADRESS": SQ_Adress},
      function(e) {
        console.log("Sending settings data..."+SQ_Adress);
      },
      function(e) {
        console.log("Settings feedback failed!");
      }
    );
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function (e) {
    try {
    // console.log(JSON.stringify(e.payload));
    var SQ_Adress = localStorage.getItem(5);
    console.log(":::::::::::"+SQ_Adress);
    if (e.payload["MESSAGE_KEY"] == "track_info") 
    {
      // console.log("Button SELECT");
      var url1=SQ_Adress+"/jsonrpc.js";
      var myData='{"id":1,"method":"slim.request","params":["00:04:20:26:27:45",["status","-",1,"tags:gABbehldiqtyrSuoKLN"]]}'
      ajaxJSONPost(url1, myData,
        function(responseText) {
          // responseText contains a JSON object with weather info
          var json = JSON.parse(responseText);
          var title = json.result.playlist_loop[0].title;
          var albumartist = json.result.playlist_loop[0].artist;
          var album = json.result.playlist_loop[0].album;
          // var info = title+" de "+album+" par "+albumartist;
          // console.log(info);

          // Assemble dictionary using our keys
          var dictionary = {
            "TITLE_INFO": title,
            "ARTIST_INFO": albumartist,
            "ALBUM_INFO": album,
          };
     
          // Send to Pebble
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log("Info sent to Pebble successfully!");
            },
            function(e) {
              console.log("Error sending weather info to Pebble!");
            }
          );
        }
      );
    }
    if (e.payload["MESSAGE_KEY"] == "play"){
      var myurl=SQ_Adress+"/status.html?p0=pause&player=00%3A04%3A20%3A26%3A27%3A45";
      xhrRequest(myurl, 'GET', function(responseText) {console.log("play");});
      trackInfo();
    }
    if (e.payload["MESSAGE_KEY"] == "previous"){
      var myurl=SQ_Adress+"/status.html?p0=playlist&p1=jump&p2=-1&player=00%3A04%3A20%3A26%3A27%3A45";
      xhrRequest(myurl, 'GET', function(responseText) {console.log("previous");});
      trackInfo();
    }
    if (e.payload["MESSAGE_KEY"] == "next"){
      var myurl=SQ_Adress+"/status.html?p0=playlist&p1=jump&p2=%2b1&player=00%3A04%3A20%3A26%3A27%3A45";
      xhrRequest(myurl, 'GET', function(responseText) {console.log("next");});
      trackInfo();
    }
    } catch (exc) {
      console.log("exception: " + exc.message);
    }
  }
);