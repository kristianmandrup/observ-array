module.exports = lazyPut

var put = require("../put.js")

// `obs.put` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazyPut(arr) {
  return function (index, newValue) {
    return arr.scheduler.schedule(putter(index, newValue, arr));
  }
}

function putter(index, value, ctx) {
  return function() {
    put(index, value).bind(ctx);
  }
}
