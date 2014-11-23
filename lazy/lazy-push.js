module.exports = lazyPush

// `obs.lazyPush` is a LAZY mutable implementation of `obs.push`
// that schedules lazy mutation for later
function lazyPush(arr) {
  return function (newValue) {
    return arr.scheduler.schedule(pusher(newValue), {type: 'push'});
  }
}

function pusher(value) {
  return function(newState) {
    newState.push(value);
    return newState;
  }
}
