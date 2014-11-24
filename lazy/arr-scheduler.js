// customize to fit your scenario (and machine speed of client)
var ArrScheduler = {
  // when Frame Time API has landed, we can track how much CPU-time is spent on each frame and
  // perhaps use this as feedback to tune the maxOpsPerFrame if necessary...
  maxOpsPerFrame: 700,
  create: require('./scheduler')
};

module.exports = ArrScheduler;
