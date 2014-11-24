module.exports = lazyShift

// `obs.lazyPush` is a LAZY mutable implementation of `obs.push`
// that schedules lazy mutation for later
function lazyShift() {
  return function (newValue) {
    return this.scheduler.schedule(shifter(), {type: 'shift'});
  }
}

function shifter() {
  return function(newState) {
    newState.shift();
    return newState;
  }
}
