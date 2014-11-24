module.exports = lazyPop

// `obs.lazyPush` is a LAZY mutable implementation of `obs.push`
// that schedules lazy mutation for later
function lazyPop() {
  return function (newValue) {
    return this.scheduler.schedule(popper(), {type: 'pop'});
  }
}

function popper() {
  return function(newState) {
    newState.pop();
    return newState;
  }
}
