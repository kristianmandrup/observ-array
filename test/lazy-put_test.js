var test    = require("tape")
var Observ  = require("observ")

var lazyPut = require("../lazy/lazy-put")

test("lazyPut is a function", function (assert) {
    assert.equal(typeof lazyPut, "function")
    assert.end()
})
