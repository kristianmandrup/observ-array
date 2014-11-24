module.exports = lazyPush

// `obs.lazyPush` is a LAZY mutable implementation of `obs.push`
// that schedules lazy mutation for later
function lazyPush() {
  return function (newValue) {
    return this.scheduler.schedule(pusher(newValue), {type: 'push'});
  }
}

function pusher(value) {
  return function(newState) {
    newState.push(value);
    return newState;
  }
}
