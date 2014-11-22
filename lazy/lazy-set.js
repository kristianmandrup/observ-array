module.exports = lazySet

var set = require("../set.js")

// `obs.set` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazySet(arr) {
  arr.scheduler.schedule(setter(arr));
}

function setter(arr) {
  return function(newList) {
    set(newList).bind(arr);
  }
}
