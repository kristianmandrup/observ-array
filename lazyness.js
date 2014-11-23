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
  var schedulerBuilder = opts.schedulerBuilder || scheduler.create;
  this.scheduler   = new schedulerBuilder(this, opts);
  this.updateNow   = updateNow;
  var self = this
  arrMethods.forEach(function(name) {
    var fullName = "lazy" + capitalise(name);
    self[fullName] = lazyApi[fullName];
  })

  this._lazy = true
  return this;
}

var allLazyMethods = arrMethods.concat('scheduler')

function unlazy() {
  var self = this;
  allLazyMethods.forEach(function(fun) {
    self[fun] = undefined;
  })
  this.updateNow = function() {
  }
  this._lazy = false;
  return this;
}

function updateNow(obs) {
  this.scheduler.executeScheduled();
}
