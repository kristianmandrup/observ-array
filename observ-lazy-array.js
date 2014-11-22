// circular dep between ArrayMethods & this file
module.exports = ObservLazyArray

var Scheduler   = require("./lazy/scheduler.js")
var lazySet     = require('./lazy/lazy-set')
var lazyPut     = require('./lazy/lazy-put')
var ObservArray = require('./index')

function ObservLazyArray(initialList, opts, lv) {
  opts = opts || {}

  opts.set = lazySet;
  opts.put = lazyPut;

  var array = ObservArray(initialList, opts, lv);
  array.scheduler = new Scheduler(array, opts);
  return array;
}
