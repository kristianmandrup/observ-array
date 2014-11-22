module.exports = lazyPut

var put = require("../put.js")

// `obs.put` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazyPut(arr) {
  return function (newValue) {
    arr.scheduler.schedule(putter(newValue, arr));
  }
}

function putter(value, ctx) {
  return function(index) {
    put(index, value).bind(ctx);
  }
}
