module.exports = Scheduler;

// customize to fit your scenario (and machine speed of client)
Scheduler.prototype.maxOpsPerFrame = 500;

var Scheduler = function(list, opts) {
  opts = opts || {maxOpsPerFrame: Scheduler.maxOpsPerFrame || 500}

  return {
    target: list,
    maxOpsPerFrame: opts.maxOpsPerFrame,
    executeScheduled: function() {
      this.scheduled.execute();
    }
    scheduled: {
      ops: [[]],
      frameIndex: function() {
        return this.ops.length;
      }
      anyOps: function() {
        return this.ops.length > 0;
      }
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
      var ops = this.scheduled.ops[this.scheduled.frameIndex];
      if (ops.length < this.maxOpsPerFrame) {
        // add one more frame buffer
        ops = this.scheduled.ops.unshift();
        ops.push(mutator);
      }
      return ops;
    }
  }
}
