var ObservArray = require("./index.js")

var slice = Array.prototype.slice

// TODO: add computed filter and map...
var READ_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

var MUTATE_METHODS = [
  // TODO: ??
]

function scheduledMethod(name) {
  this.scheduler.schedule(lazyMethod(name).bind(this));
}

function lazyMethod(name) {
    return function() {
      var res = this._list[name].apply(this._list, arguments)

      if (res && Array.isArray(res)) {
          res = ObservArray(res)
      }
      return res
    }
  }
}

var methods = MUTATE_METHODS.map(function (name) {
    return [name, scheduledMethod(name).bind(this)];
})
