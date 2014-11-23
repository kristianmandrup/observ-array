module.exports = lazySet

// `obs.lazySet` is a LAZY mutable implementation of `obs.set`
// that schedules lazy mutation for later
function lazySet(arr) {
  return function (list) {
    return arr.scheduler.schedule(setter(list), {type: 'set'});
  }
}

function setter(list) {
  return function() {
    return list;
  }
}
