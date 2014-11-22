// customize to fit your scenario (and machine speed of client)
var ArrScheduler = require('./arr-scheduler')

var Scheduler = function(list, opts) {
  opts = opts || {}
  opts.maxOpsPerFrame = opts.maxOpsPerFrame || ArrScheduler.maxOpsPerFrame || 700

  return {
    target: list,
    maxOpsPerFrame: opts.maxOpsPerFrame,
    executeScheduled: function() {
      this.scheduled.execute();
    },
    scheduled: {
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
        this.ops.shift().forEach(function(op) {
          op();
        })
      }
    },
    schedule: function(mutator) {
      var frameIndex = this.scheduled.frameIndex();
      var max = this.maxOpsPerFrame;
      var ops = this.scheduled.ops[frameIndex];

      if (ops.length < max) {
        // add one more frame buffer
        ops = this.scheduled.ops.unshift();
        ops.push(mutator);
      }
      return ops;
    }
  }
}

module.exports = Scheduler;
