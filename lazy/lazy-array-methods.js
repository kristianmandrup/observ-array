var ObservArray = require("./index.js")

var slice = Array.prototype.slice

// TODO: add computed filter and map...
var ARRAY_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

function scheduledMethod(name) {
  this.scheduler.schedule(lazyMethod(name));
}

// can we generalize the pattern of most lazy array mutate methods similar to unlazy versions!?
function lazyMethod(name) {

    // TODO: Needs some love...
    return function() {
      var res = this._list[name].apply(this._list, arguments)

      if (res && Array.isArray(res)) {
          res = ObservArray(res)
      }
      return res
    }
  }
}

var methods = ARRAY_METHODS.map(function (name) {
    return [name, scheduledMethod(name).bind(this)];
})
