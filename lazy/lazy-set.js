module.exports = lazySet

// `obs.lazySet` is a LAZY mutable implementation of `obs.set`
// that schedules lazy mutation for later
function lazySet() {
  return function (list) {
    return this.scheduler.schedule(setter(list), {type: 'set'});
  }
}

function setter(list) {
  return function() {
    return list;
  }
}
