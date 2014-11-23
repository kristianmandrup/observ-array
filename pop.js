var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = pop;

// `obs.put` is a mutable implementation of `array[index] = value`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function pop(value) {
  var obs = this
  var valueList = obs().slice()

  var originalLength = valueList.length
  var val = typeof value === "function" ? value() : value

  obs._list.pop(val)

  // add listener to value if observ
  addListener(obs, val);

  // fake pop diff
  var valueArgs = valueList.slice(valueList.length -1)

  setNonEnumerable(valueList, "_diff", [valueArgs])

  obs._observSet(valueList)
  return value;
}
