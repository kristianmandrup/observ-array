module.exports = Scheduler;

var Scheduler = function(list, opts) {
  opts = opts || {maxOpsPerFrame: 500} // experimental

  return {
    list: list,
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
