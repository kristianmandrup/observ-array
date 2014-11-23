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


test("lazySet and lazyPut are played back on executeScheduled", function (assert) {
    var arr = lazyArr([3,4,5,6]);

    // assert.equal(arr[0], 3)
    assert.equal(typeof arr.set, "function")
    assert.equal(typeof arr.put, "function")

    arr.lazySet([7,8,9]);
    arr.lazyPut(1, 2);

    //
    var scheduler = arr.scheduler;
    assert.equal(typeof scheduler, "object")
    assert.equal(scheduler.scheduled.anyOps(), true)
    assert.equal(scheduler.scheduled.numOps(), 2)
    //
    scheduler.executeScheduled();
    // // console.log('arrECT', arr);
    assert.equal(arr.get(0), 7)
    assert.equal(arr.get(1), 2)
    assert.equal(arr.get(2), 9)

    assert.end()
})


test("last lazySet wins!", function (assert) {
    var arr = lazyArr([3,4,5,6]);

    // assert.equal(arr[0], 3)
    assert.equal(typeof arr.set, "function")
    assert.equal(typeof arr.put, "function")

    arr.lazySet([0,1,0]);
    arr.lazyPut(1, 2);
    arr.lazySet([7,8,9]);

    //
    var scheduler = arr.scheduler;
    assert.equal(typeof scheduler, "object")
    assert.equal(scheduler.scheduled.anyOps(), true)
    assert.equal(scheduler.scheduled.numOps(), 1)
    //
    scheduler.executeScheduled();
    // // console.log('arrECT', arr);
    assert.equal(arr.get(0), 7)
    assert.equal(arr.get(1), 8)
    assert.equal(arr.get(2), 9)
    assert.equal(arr.get(3), undefined)

    assert.end()
})


test("splicer", function (assert) {
    var arr = lazyArr([3,4,5,6]);

    // assert.equal(arr[0], 3)
    assert.equal(typeof arr.set, "function")
    assert.equal(typeof arr.put, "function")

    arr.lazySet([9,8,7,6,5]);
    arr.lazySplice(1, 2);

    //
    var scheduler = arr.scheduler;
    assert.equal(typeof scheduler, "object")
    assert.equal(scheduler.scheduled.anyOps(), true)
    assert.equal(scheduler.scheduled.numOps(), 2)
    //
    scheduler.executeScheduled();
    // console.log('arr', arr);

    assert.equal(arr.get(0), 8)
    assert.equal(arr.get(1), 7)
    assert.equal(arr.get(2), undefined)

    assert.end()
})


test("pusher", function (assert) {
    var arr = lazyArr([3,4,5,6]);

    // assert.equal(arr[0], 3)
    assert.equal(typeof arr.set, "function")
    assert.equal(typeof arr.put, "function")

    arr.lazySet([9]);
    arr.lazyPush(1);
    arr.lazyPush(2);

    //
    var scheduler = arr.scheduler;
    assert.equal(typeof scheduler, "object")
    assert.equal(scheduler.scheduled.anyOps(), true)
    assert.equal(scheduler.scheduled.numOps(), 3)
    //
    scheduler.executeScheduled();
    // console.log('arr', arr);

    assert.equal(arr.get(0), 9)
    assert.equal(arr.get(1), 1)
    assert.equal(arr.get(2), 2)

    assert.end()
})
