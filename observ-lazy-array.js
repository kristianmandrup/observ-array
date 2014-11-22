var Observ = require("observ")
var ObservStruct = require("observ-struct")

// circular dep between ArrayMethods & this file
module.exports = ObservLazyArray

var splice = require("./splice.js")
var put = require("./lazy/lazy-put.js")
var set = require("./lazy/lazy-set.js")

var transaction = require("./transaction.js")
var ArrayMethods = require("./array-methods.js")
var addListener = require("./add-listener.js")

var deepSet = require('./deep-set')

var Scheduler = require("./scheduler.js")

function ObservLazyArray(initialList, opts, lv) {
  var array = ObservArray(initialList, opts, lv);
  array.scheduler = new Scheduler()
  array.anyScheduled = array.scheduler.any;
  return array;
}
