module.exports = lazyPut

var set = require("../set.js")

// `obs.set` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazySet(index, value) {
  this.scheduler.schedule(setter(this));
}

function setter(list) {
  return function() {
    set(index, value).bind(list);
  }
}
