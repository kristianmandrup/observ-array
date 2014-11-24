module.exports = lazyUnshift

// `obs.lazyPush` is a LAZY mutable implementation of `obs.push`
// that schedules lazy mutation for later
function lazyUnshift() {
  return function (newValue) {
    return this.scheduler.schedule(unshifter(), {type: 'unshift'});
  }
}

function unshifter() {
  return function(newState) {
    newState.unshift();
    return newState;
  }
}
