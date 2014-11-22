module.exports = lazyPut

var put = require("../put.js")

// `obs.put` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazyPut(index, value) {
  this.scheduler.schedule(putter(this));
}

function putter(list) {
  return function() {
    put(index, value).bind(list);
  }
}
