// customize to fit your scenario (and machine speed of client)
var ArrScheduler = {
  maxOpsPerFrame: 700,
  create: require('./scheduler')
};

module.exports = ArrScheduler;
