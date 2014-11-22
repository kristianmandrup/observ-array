# observ-array

<!--
    [![build status][1]][2]
    [![NPM version][3]][4]
    [![Coverage Status][5]][6]
    [![gemnasium Dependency Status][7]][8]
    [![Davis Dependency status][9]][10]
-->

<!-- [![browser support][11]][12] -->

An array containing observable values

## Example

An `ObservArray` is an observable version of an array, every
  mutation of the array or mutation of an observable element in
  the array will cause the `ObservArray` to emit a new changed
  plain javascript array.

```js
var ObservArray = require("observ-array")
var ObservStruct = require("observ-struct")
var Observ = require("observ")
var uuid = require("uuid")

function createTodo(title) {
  return ObservStruct({
    id: uuid(),
    title: Observ(title || ""),
    completed: Observ(false)
  })
}

var state = ObservStruct({
  todos: ObservArray([
    createTodo("some todo"),
    createTodo("some other todo")
  ])
})

state(function (currState) {
  // currState.todos is a plain javascript todo
  // currState.todos[0] is a plain javascript value
  currState.todos.forEach(function (todo, index) {
    console.log("todo", todo.title, index)
  })
})

state.todos.get(0).title.set("some new title")
state.todos.push(createTodo("another todo"))
```

### Transactions

Batch changes together with transactions.

```js
var array = ObservArray([ Observ("foo"), Observ("bar") ])

var removeListener = array(handleChange)

array.transaction(function(rawList) {
  rawList.push(Observ("foobar"))
  rawList.splice(1, 1, Observ("baz"), Observ("bazbar"))
  rawList.unshift(Observ("foobaz"))
  rawList[6] = Observ("foobarbaz")
})

function handleChange(value) {
  // this will only be called once
  // changes are batched into a single diff
  value._diff //= [ [1,1,"baz","bazbar","foobar", , "foobarbaz"],
              //    [0,0,"foobaz"] ]
}
```

## TODO

Learn from KO [observableArrays](http://knockoutjs.com/documentation/observableArrays.html)

Also learn from [knockout-projections](https://github.com/SteveSanderson/knockout-projections)
and implement computed-map and computed-filter, similar to [observable array: map and filter](https://github.com/SteveSanderson/knockout-projections/blob/master/src/knockout-projections.js)

## Lazy array

A lazy array will use lazy versions of `set` and `put`. Instead of executing the operations directly on the state, the operations will be stored for later execution in a scheduler for that array.

```js
var lazyList = ObservLazyArray(list);

// schedules operations for later
for (var i=3; i < someList.length; i = i + 2) {
  lazyList.put(i, someList[i]);
}
```

The scheduler can later be asked to "play" those operations when convenient. This way we can buffer operations and only execute them once per redraw to gain more control and performance boost.

Note however, that you must be careful with this approach, and try to avoid buffering more operations than can be executed for a single frame update, including the DOM patch rendering itself.

For this reason the schedule uses a multi-framed buffer. It creates each buffer with max 500 scheduled operations per frame (default). You can configure this setting on a per array basis like this: `lazyList.scheduler.maxOpsPerFrame = 1300`. You can also set the global default used by all lazy observables when instantiated: `Scheduler.prototype.maxOpsPerFrame = 500;`

Using a "multi-framed buffer" let's us schedule a huge number of operations to be played over multiple frames so we can still get a fluid visual experience.

Note that we will likely be using a common `Scheduler` from `observ` as the base prototype. Then for each type of observable, the Scheduler might behave a little differently or at least have a different `maxOpsPerFrame` default value.

```js
var LazyArrayScheduler.prototype =  Scheduler.prototype`
LazyArrayScheduler.maxOpsPerFrame = 800

var LazyStructScheduler.prototype =  Scheduler.prototype`
LazyArrayScheduler.maxOpsPerFrame = 500
```

We can use all this infrastructure as part of the [main-loop](https://github.com/Raynos/main-loop) implementation...

```js
// inside main-loop update function
// we then instead call `doScheduledAndRedraw(state)` which calls `executeScheduled()` on the state
// if such a method exists, in order to lazily update the state "at the last minute".
function update(state) {
  ...
  if (currentState === null && !redrawScheduled) {
      redrawScheduled = true
      raf(doScheduledAndRedraw(state))
  }
  ...
}

function executeScheduled(state) {
  ...
}

function doScheduledAndRedraw(state) {
  executeScheduled(state);
  redraw();
}

function redraw() {
  ...
```


## Installation

`npm install observ-array`

## Contributors

 - Raynos
 - [Matt McKegg][13]

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/observ-array.png
  [2]: https://travis-ci.org/Raynos/observ-array
  [3]: https://badge.fury.io/js/observ-array.png
  [4]: https://badge.fury.io/js/observ-array
  [5]: https://coveralls.io/repos/Raynos/observ-array/badge.png
  [6]: https://coveralls.io/r/Raynos/observ-array
  [7]: https://gemnasium.com/Raynos/observ-array.png
  [8]: https://gemnasium.com/Raynos/observ-array
  [9]: https://david-dm.org/Raynos/observ-array.png
  [10]: https://david-dm.org/Raynos/observ-array
  [11]: https://ci.testling.com/Raynos/observ-array.png
  [12]: https://ci.testling.com/Raynos/observ-array
  [13]: https://github.com/mmckegg
