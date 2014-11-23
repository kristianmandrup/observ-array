module.exports = lazySplice

// `obs.lazySplice` is a LAZY mutable implementation of `obs.splice`
// that schedules lazy mutation for later
function lazySplice(arr) {
  return function (index, amount) {
    return arr.scheduler.schedule(splicer(index, amount), {type: 'splice'});
  }
}

function splicer(index, amount) {
  return function(newState) {
    return newState.splice(index, amount)
  }
}
