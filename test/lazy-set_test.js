var test    = require("tape")
var Observ  = require("observ")

var lazySet = require("../lazy/lazy-set")

test("lazySet is a function", function (assert) {
    assert.equal(typeof lazySet, "function")
    assert.end()
})
