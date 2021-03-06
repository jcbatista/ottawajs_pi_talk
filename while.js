// Simple while loop demo using Promises
var Promise = require("bluebird");

// taken from: http://blog.victorquinn.com/javascript-promise-while-loop
var promiseWhile = function(condition, action) {
  resolver = Promise.defer();
  var loop = function() {
    if (!condition()) return resolver.resolve();
      return Promise.cast(action())
      .then(loop)
      .catch(resolver.reject);
    };

    process.nextTick(loop);
    return resolver.promise;
};

(function() {
  var i=0;
  function cond() { 
    return i < 5; 
  }

  function action() {
    console.log("i="+i);
    i++;
  }

  promiseWhile(cond, action).done(function() {
    console.log('done done!');
  });
}());
