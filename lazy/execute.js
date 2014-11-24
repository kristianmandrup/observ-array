module.exports = function() {
  if (!this.anyOps())
    return;

  // take latest framebuffer and play it
  var newState = this.obj._list;
  // We build up a new state from playing all the operation on
  // a cloned array of original
  this.ops.shift().forEach(function(scheduledObj) {
    // newState = ... Not sure how it should be done :P
    newState = scheduledObj.op(newState);
  })
  // then set via the final array
  this.obj._list = newState;
  this.obj._observSet(newState)
}
