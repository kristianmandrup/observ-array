var test    = require("tape")
var Observ  = require("observ")

var lazyArr = require("../observ-lazy-array")

test("lazyArr is a function", function (assert) {
    assert.equal(typeof lazyArr, "function")
    assert.end()
})


test("calling lazyArr returns observable: function", function (assert) {
    assert.equal(typeof lazyArr([3]), "function")
    assert.end()
})


test("calling lazyArr returns observable: function", function (assert) {
    var arr = lazyArr([3,4,5,6]);

    assert.equal(arr[0], 3)
    arr.set([7,8,9]);
    arr.put(1, 2);

    var scheduler = arr.scheduler;
    assert.equal(typeof scheduler, "arrect")
    assert.equal(scheduler.scheduled.anyOps(), true)
    assert.equal(scheduler.scheduled.numOps(), 2)

    scheduler.executeScheduled();
    // console.log('arrECT', arr);
    assert.equal(arr[0], 7)
    assert.equal(arr[1], 2)
    assert.equal(arr[2], 9)

    assert.end()
})