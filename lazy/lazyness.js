var methodsObj = {}
var methods = ['set', 'put', 'push', 'pop', 'shift', 'unshift', 'splice']
methods.forEach(function (key) {
  methodsObj[key] = require('./lazy-' + key)
})

var opts = {
  methods: methodsObj,
  scheduler: require("./scheduler.js")
}
var apiBuilder = require('observ/lazy/lazy-api')

module.exports = apiBuilder(opts)
