"use strict";

var Promise = require("bluebird");
var gpio = Promise.promisifyAll(require("pi-gpio"));

var PartyController = function() { 
  var self = {},
      relayPin = 26,
      shouldStop = false,
      loopDeferred = undefined;

  self.lightState = 0; // 0 light is off, 1 it's on
  self.isStarted = false;
  self.interval = 2000; // 2 second

  function loop() {
    self.lightState = (self.lightState+1)%2;
    console.log("Light lightState: " + self.lightState);
    gpio.writeAsync(relayPin, self.lightState)
        .done(function() { 
          if(!shouldStop) {
            setTimeout(loop, self.interval);
          } else {
            console.log("Terminating loop ...");
            loopDeferred.fulfill();
            return loopDeferred;
          }
        });
  }

  self.start = function() {
    return new Promise(function(resolve) {
      if(self.isStarted) {
        resolve();
        return;
      }
      shouldStop = false;
      loopDeferred = Promise.pending(); 
      gpio.openAsync(relayPin, "output")
          .then(function() {
            self.lightState = 1;
            return gpio.writeAsync(relayPin, self.lightState);
          })
          .done(function() {
            self.isStarted = true;
            console.log("Relay loop started ...");
            setTimeout(loop, self.interval);
            resolve();
          });
    });
  };

  self.stop = function() {
    return new Promise(function(resolve) {
    if(!self.isStarted) {
      console.log("Party hasn't started yet, whatcha doing?");
      resolve();
      return;
    }

    shouldStop = true;
    console.log("signaling stop ...");
    loopDeferred.promise.then(function() {
          // make sure the light is turned off when we stop the party
          if(self.lightState==1) {
            self.lightState = 0;
            return gpio.writeAsync(relayPin, self.lightState); 
          }
          return Promise.pending();
        })
      .then(function() {
          console.log("closing relay ...");
          return gpio.closeAsync(relayPin);
        })
      .done(function() {
         self.isStarted = false;
         console.log("Party's over ...");
         resolve();
       });
    });
  }
  return self;
};

module.exports = PartyController(); 
