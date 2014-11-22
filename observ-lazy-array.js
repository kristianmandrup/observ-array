// circular dep between ArrayMethods & this file
module.exports = ObservLazyArray

var Scheduler   = require("./lazy/scheduler.js")
var lazySet     = require('./lazy/lazy-set')
var lazyPut     = require('./lazy/lazy-put')
var ObservArray = require('./index')

function ObservLazyArray(initialList, opts, lv) {
  opts = opts || {}


  var array = ObservArray(initialList, opts, lv);
  array.scheduler = new Scheduler(array, opts);
  array.set = lazySet(array);
  array.put = lazyPut(array);

  return array;
}
