// circular dep between ArrayMethods & this file
module.exports = ObservLazyArray

var scheduler   = require("./lazy/arr-scheduler.js")
var lazySet        = require('./lazy/lazy-set')
var lazyPut        = require('./lazy/lazy-put')
var lazySplice     = require('./lazy/lazy-splice')
var lazyPush       = require('./lazy/lazy-push')

var ObservArray    = require('./index')

function ObservLazyArray(initialList, opts, lv) {
  opts = opts || {}

  var obs = ObservArray(initialList, opts, lv);

  var schedulerBuilder = opts.schedulerBuilder || scheduler.create;

  obs.scheduler = new schedulerBuilder(obs, opts);
  obs.lazySet     = lazySet(obs);
  obs.lazyPut     = lazyPut(obs);
  obs.lazySplice  = lazySplice(obs);
  obs.lazyPush    = lazyPush(obs);

  return obs;
}
