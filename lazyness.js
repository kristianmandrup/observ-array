module.exports = {
  lazy: lazy,
  isLazy: isLazy,
  unlazy: unlazy
}

var scheduler   = require("./lazy/arr-scheduler.js")

var arrMethods = ['set', 'put', 'splice',
'push', 'pop', 'shift', 'unshift']

var lazyApi = {}

arrMethods.forEach(function(name) {
  var capName = capitalise(name)
  lazyApi["lazy" + capName] = require('./lazy/lazy-' + name)
})

function isLazy() {
  return !!this._lazy;
}

function capitalise(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lazy(opts) {
  opts = opts || {}
  var schedulerBuilder = opts.schedulerBuilder || scheduler.create;
  this.scheduler   = new schedulerBuilder(this, opts);
  this.updateNow   = updateNow;
  var self = this
  arrMethods.forEach(function(name) {
    var fullName = "lazy" + capitalise(name);
    self[fullName] = lazyApi[fullName]();
  })

  this._lazy = true
  return this;
}

var allLazyMethods = Object.keys(lazyApi).concat('scheduler')

function unlazy() {
  var self = this;
  // Remove all lazy methods, including access to scheduler
  allLazyMethods.forEach(function(fun) {
    delete self[fun]
  })
  // updateNow becomes no-op
  this.updateNow = function() {
  }
  this._lazy = false;
  return this;
}

// to force evaluation of scheduled ops now!
function updateNow() {
  this.scheduler.executeScheduled();
}
