module.exports = ObservLazyArray

var ObservArray    = require('./index')

function ObservLazyArray(initialList, opts, lv) {
  opts = opts || {}

  var obs = ObservArray(initialList, opts, lv);
  obs.lazy(opts);

  return obs;
}
