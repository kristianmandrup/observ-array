module.exports = lazySet

var set = require("../set.js")

// `obs.set` is a LAZY mutable implementation of `array[index] = value`
// that schedules lazy mutation for later (ie. when a getter is called)
function lazySet(arr) {
  return function (list) {
    console.log('arr', arr);
    console.log('list', list);
    return arr.scheduler.schedule(setter(arr));
  }
}

function setter(arr) {
  return function(newList) {
    arr.set(newList);
  }
}
