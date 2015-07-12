// SQ_Adress = "http://192.168.1.40:9002";
SQ_Adress = localStorage.getItem(6);

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  console.log("status::: "+xhr.status);
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

function init_SqueezeBox() {
  console.log("init_SuqueezeBox");
  var url=SQ_Adress+"/jsonrpc.js";
  var myData='{"id":1,"method":"slim.request","params":["",["serverstatus",0,999]]}';
  ajaxJSONPost(url, myData,
    function(responseText) {
      var json = JSON.parse(responseText);
      SQ_mac = json.result.players_loop[0].playerid;
      console.log("mac_SQ: "+SQ_mac);
    }
  );
  trackInfo();
}

function trackInfo() {
  console.log("trackinfo():"+SQ_Adress);
  var url=SQ_Adress+"/jsonrpc.js";
  var myData='{"id":1,"method":"slim.request","params":["'+SQ_mac+'",["status","-",1,"tags:gABbehldiqtyrSuoKLN"]]}';
  ajaxJSONPost(url, myData,
    function(responseText) {
      var json = JSON.parse(responseText);
      var title = json.result.playlist_loop[0].title;
      var albumartist = json.result.playlist_loop[0].artist;
      var album = json.result.playlist_loop[0].album;

      var dictionary = {
        "PLAT": "sq",
        "TITLE_INFO": title,
        "ARTIST_INFO": albumartist,
        "ALBUM_INFO": album,
      };
 
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

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log('PebbleKit JS ready!');
  }
);

Pebble.addEventListener("showConfiguration",
  function(e) {
    //Load the remote config page
    Pebble.openURL("http://srv.gibald.com/pebble/squeezebox_conf.html");
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

    localStorage.setItem(6, SQ_Adress);
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function (e) {
    try {
      console.log(JSON.stringify(e.payload));
      console.log("status "+e.payload["STATUS_KEY"]);
      console.log("message "+e.payload["MESSAGE_KEY"]);
      if( e.payload["STATUS_KEY"] == "sb") {
        if (e.payload["MESSAGE_KEY"] == "track_info") {
          init_SqueezeBox();
        }
        if (e.payload["MESSAGE_KEY"] == "play"){
          init_SqueezeBox();
          var myurl=SQ_Adress+"/status.html?p0=pause&player="+SQ_mac;
          xhrRequest(myurl, 'GET', function(responseText) {console.log("play");});
        }
        if (e.payload["MESSAGE_KEY"] == "previous"){
          var myurl=SQ_Adress+"/status.html?p0=playlist&p1=jump&p2=-1&player="+SQ_mac;
          xhrRequest(myurl, 'GET', function(responseText) {console.log("previous");});
          trackInfo();
        }
        if (e.payload["MESSAGE_KEY"] == "next"){
          var myurl=SQ_Adress+"/status.html?p0=playlist&p1=jump&p2=%2b1&player="+SQ_mac;
          xhrRequest(myurl, 'GET', function(responseText) {console.log("next");});
          trackInfo();
        }
      }
    } catch (exc) {
      console.log("exception: " + exc.message);
    }
  }
);