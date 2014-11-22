// customize to fit your scenario (and machine speed of client)
var ArrScheduler = require('./arr-scheduler')

var Scheduler = function(list, opts) {
  opts = opts || {}
  opts.maxOpsPerFrame = opts.maxOpsPerFrame || ArrScheduler.maxOpsPerFrame || 700

  var outer = {
    array: list,
    maxOpsPerFrame: opts.maxOpsPerFrame,
    executeScheduled: function() {
      this.scheduled.execute();
    },
    schedule: function(mutator) {
      var frameIndex = this.scheduled.frameIndex();
      var max = this.maxOpsPerFrame;
      var ops = this.scheduled.ops;
      var frameOps = ops[frameIndex] || [];

      if (frameOps.length < max) {
        // add one more frame buffer
        frameOps.push(mutator);
        this.onScheduled(frameOps)
      }
      return frameOps;
    },
    // hook: override to log scheduled operations as they are added
    onScheduled: function(ops) {
    }
  }

  var scheduled = {
    array: list,
    ops: [[]],
    frameIndex: function() {
      return Math.max(this.ops.length-1, 0);
    },
    numOps: function() {
      return this.ops[this.frameIndex()].length;
    },
    anyOps: function() {
      return this.numOps() > 0;
    },
    execute: function() {
      if (!this.anyOps())
        return;

      // take latest framebuffer and play it
      var newState = this.array._list;
      // We build up a new state from playing all the operation on
      // a cloned array of original
      this.ops.shift().forEach(function(op) {
        // newState = ... Not sure how it should be done :P
        newState = op(newState);
      })
      // then set via the final array
      this.array._list = newState;
      this.array._observSet(newState)
    }
  }
  outer.scheduled = scheduled;
  return outer;
}

module.exports = Scheduler;
