var party = require('./party.js');

function status()
{
  if(party.isStarted) {
    console.log('La Di Da Di, I like to party ...');
  } else {
    console.log('Goodnight, go home!');
  }
}

// party starts here ...
party.start().done(function() {
  status();

  // let's party for 10 seconds
  var duration = 10000;
  setTimeout(function() {

    // end the party
    party.stop().done(function() {
      status();
    });
  }, duration);
});
