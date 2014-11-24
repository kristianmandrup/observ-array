module.exports = lazyPut

// `obs.lazyPut` is a LAZY mutable implementation of `obs.put`
// that schedules lazy mutation for later
function lazyPut() {
  return function (index, newValue) {
    return this.scheduler.schedule(putter(index, newValue), {type: 'put'});
  }
}

function putter(index, value) {
  return function(newState) {
    newState[index] = value;
    return newState;
  }
}
