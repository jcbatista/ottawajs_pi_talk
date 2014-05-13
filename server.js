var express    = require('express');
var party      = require('./party');
var bodyParser = require('body-parser');
var app        = express();        

var port = process.env.PORT || 8080;  

var router = express.Router();      
app.use(bodyParser());

router.get('/', function(req, res) {
 res.json({ message: 'Party API', version: '1.0' }); 
});

function getState() {
  return { 
           state: party.isStarted ? 'started': 'stopped',
           light: party.lightState ? 'on': 'off'
         };
}

function getAction(postBody)
{
  if(postBody && postBody.action) {
    return postBody.action.toLowerCase();
  }  
  return null;
}

router.get('/party', function(req, res) {
  res.json( getState() );
});

router.post('/party', function(req, res) {
  var action = getAction(req.body); 
  var returnHandler = function(){
    res.json( getState() );
  };
  switch(action) {
    case 'start': party.start().done(returnHandler);
         break;
    case 'stop': party.stop().done(returnHandler);
         break;
    default: res.json({message: "wtf???"});
  }
});

app.use('/api', router);
app.listen(port);
console.log('partyapp started on port = ' + port);
