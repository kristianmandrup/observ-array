module.exports = ObservLazy

var Observ = require('./index')

function ObservLazy(obj, opts, lv) {
  return Observ(obj, opts, lv).lazy();
}
