/* 
Developed by Tryfon Tzanetis
    trif.tz@gmail.com
	    	 ____
	    	(_  _)
	    	  )(
	     	 (__)

************************************************************************          
Tinnitaid app intends to help tinnitus patient get rid of the noise. Please consult a doctor before using the app.
The creating team of the app does not hold any responsibility on how the app is used. By using the app you accept this policy statement.

    Copyright (C) 2019 Tryfon Tzanetis

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

For the complete license, please refer here: http://tinnitaid.github.io/LICENSE.txt
************************************************************************
 */

//...................................................... live working
// *** NOISE GENERATOR SCRIPT ***

// Create Web Audio API context | Temp workaround until AudioContext is standardized
const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
numSeconds = 3600;
sampleRate = 32000;
bufferSize = numSeconds * sampleRate;

var whiteNoiseNode = context.createBufferSource(),
  buffer = context.createBuffer(1, bufferSize, sampleRate), // context.sampleRate
  data = buffer.getChannelData(0);
for (var i = 0; i < bufferSize; i++) {
  data[i] = Math.random() * 2 - 1;
}
whiteNoiseNode.buffer = buffer;
whiteNoiseNode.loop = true;

var connected = false;

// Volume
var gainNode = context.createGain();
gainNode.gain.value = 0.2; // 20 %
gainNode.connect(context.destination);

var playStopWhiteNoise = function () {
  if (!connected) {
    whiteNoiseNode.connect(gainNode);

    if (iOS) {
      alert(
        "Sound started. Un-mute your device or select volume if you cannot hear anything."
      );
      webAudioTouchUnlock(context).then(
        function (unlocked) {
          if (unlocked) {
            // AudioContext was unlocked from an explicit user action,
            // sound should start playing now
            whiteNoiseNode.start(context.currentTime);
          } else {
            window.location.reload();
          }
        },
        function (reason) {
          console.error(reason);
        }
      );
    } else {
      // Non-iOS
      whiteNoiseNode.start(context.currentTime);
    }
  } else {
    // If connected
    whiteNoiseNode.stop(0);
    whiteNoiseNode.disconnect();
    gainNode.disconnect();
    window.location.reload();   
  }
  connected = !connected;
};

// *** //NOISE GENERATOR SCRIPT ***

// *** iOS CHECK SCRIPT ***
var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isSafari && iOS) {
  alert(
    "You are using Safari on iOS! The feature of listening to your music in parallel with the generated sound is not allowed in this browser. Please use Chrome."
  );
}
// *** //iOS CHECK SCRIPT ***

// *** iOS CHECK TOUCH SCRIPT ***
function webAudioTouchUnlock(context) {
  return new Promise(function (resolve, reject) {
    if (context.state === "suspended" && "ontouchstart" in window) {
      var unlock = function () {
        context.resume().then(
          function () {
            document.body.removeEventListener("touchstart", unlock);
            document.body.removeEventListener("touchend", unlock);

            resolve(true);
          },
          function (reason) {
            reject(reason);
          }
        );
      };

      document.body.addEventListener("touchstart", unlock, false);
      document.body.addEventListener("touchend", unlock, false);
    } else {
      resolve(false);
    }
  });
}
// *** //iOS CHECK TOUCH SCRIPT ***

// *** VOLUME SCRIPT ***
var setWhiteNoiseVolume = function () {
  var vol = document.getElementById("whiteNoiseVolRange").value;
  gainNode.gain.value = vol;
};
// *** //VOLUME SCRIPT ***