var execute    = require('./execute')

module.exports = {
  scheduled: {
    execute: execute
  },
  outer: {
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
      var max = this.maxOpsPerFrame;
      var frameOps = this.scheduled.frameOps();
      // push/pop or unshift/shift drop both
      // perhaps this is check is too expensive to really make sense!?
      // needs performance test for diff scenarios
      if (this.isInverse(frameOps, opts)) {
        frameOps.pop();
        return frameOps;
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
      this.scheduled.setFrameOps(frameOps);
      return frameOps;
    }
  }
}
