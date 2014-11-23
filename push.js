var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = push;

// `obs.put` is a mutable implementation of `array[index] = value`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function push(value) {
  var obs = this
  var valueList = obs().slice()

  var originalLength = valueList.length
  var val = typeof value === "function" ? value() : value

  obs._list.push(val)

  // add listener to value if observ
  addListener(obs, val);

  // fake push diff
  var valueArgs = valueList.concat(val)

  setNonEnumerable(valueList, "_diff", [valueArgs])

  obs._observSet(valueList)
  return value;
}
