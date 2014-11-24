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

    inversePairs: {
      'pop': 'push',
      'shift': 'unshift'
    },

    isInverse: function(frameOps, opts) {
      var self = this
      for (var key in this.inversePairs) {
        if (this.inversePairs.hasOwnProperty(key)) {
          if (opts.type === key) {
            var lastFrameOp = frameOps[frameOps.length -1] || {}
            var inverseKey = self.inversePairs[key]
            var result = opts.type === key && lastFrameOp.type === inverseKey;
            return result
          }
        }
      }
      return false;
    },

    schedule: function(mutator, opts) {
      opts = opts || {}
      var frameIndex = this.scheduled.frameIndex();
      var max = this.maxOpsPerFrame;
      var ops = this.scheduled.ops;
      var frameOps = ops[frameIndex] || []
      // push/pop or unshift/shift drop both
      // perhaps this is check is too expensive to really make sense!?
      // needs performance test for diff scenarios
      if (this.isInverse(frameOps, opts)) {
        frameOps.pop();
        return frameOps
      }

      if (frameOps.length < max) {
        // add one more frame buffer
        if (opts.type === 'set') {
          // reset all previos ops on set (overrides any previous value)
          frameOps = [];
        }

        frameOps.push({op: mutator, type: opts.type});
        this.onScheduled(frameOps)
      }
      this.scheduled.ops[frameIndex] = frameOps;
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
      this.ops.shift().forEach(function(scheduledObj) {
        // newState = ... Not sure how it should be done :P
        newState = scheduledObj.op(newState);
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
