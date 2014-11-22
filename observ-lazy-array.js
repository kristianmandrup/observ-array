// circular dep between ArrayMethods & this file
module.exports = ObservLazyArray

var deepSet = require('./deep-set')
var Scheduler = require("./scheduler.js")

var lazySet = require('./lazy/lazy-set')
var lazyPut = require('./lazy/lazy-put')

function ObservLazyArray(initialList, opts, lv) {
  opts = opts || {}

  opts.set = lazySet;
  opts.put = lazyPut;

  var array = ObservArray(initialList, opts, lv);
  array.scheduler = new Scheduler(array, opts);
  return array;
}
