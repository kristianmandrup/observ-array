module.exports = lazySet

var set = require("../set.js")

// `obs.set` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazySet(arr) {
  return function (list) {
    return arr.scheduler.schedule(setter(list, arr));
  }
}

function setter(list, arr) {
  return function(newState) {
    return list;
  }
}
