var Observ = require("observ")
var ObservStruct = require("observ-struct")

// circular dep between ArrayMethods & this file
module.exports = ObservArray

var splice = require("./splice.js")
var arrPut = require("./put.js")
var arrSet = require("./set.js")
var transaction = require("./transaction.js")
var ArrayMethods = require("./array-methods.js")
var addListener = require("./add-listener.js")

var deepSet   = require('./deep-set')
var lazyness  = require('./lazyness')

var extend = require('xtend')

/*  ObservArray := (Array<T>) => Observ<
        Array<T> & { _diff: Array }
    > & {
        splice: (index: Number, amount: Number, rest...: T) =>
            Array<T>,
        push: (values...: T) => Number,
        filter: (lambda: Function, thisValue: Any) => Array<T>,
        indexOf: (item: T, fromIndex: Number) => Number
    }

    Fix to make it more like ObservHash.

    I.e. you write observables into it.
        reading methods take plain JS objects to read
        and the value of the array is always an array of plain
        objsect.

        The observ array instance itself would have indexed
        properties that are the observables
*/

function get(index) {
    return this._list[index]
}

function ObservArray(initialList, opts, lv) {
    opts = opts || {}

    // list is the internal mutable list observ instances that
    // all methods on `obs` dispatch to.
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = splice

    // override set and store original for later use
    obs._observSet = obs.set
    obs.set = arrSet

    obs.get = get
    obs.getLength = getLength
    obs.put = arrPut
    obs.transaction = transaction

    // you better not mutate this list directly
    // this is the list of observs instances
    obs._list = list

    var removeListeners = list.map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    });
    // this is a list of removal functions that must be called
    // when observ instances are removed from `obs.list`
    // not calling this means we do not GC our observ change
    // listeners. Which causes rage bugs
    obs._removeListeners = removeListeners

    if (deepSet) {
      deepSet(list, opts, lv);
    }

    // add basic lazyness methods
    Object.keys(lazyness).forEach(function(key) {
      obs[key] = lazyness[key];
    })

    obs._lazy = false
    obs._type = "observ-array"
    obs._version = "3"

    // decorates Array with special immutable (wrapped) versions of array methods such as:
    // "concat", "slice", "every", "filter", "forEach"
    return ArrayMethods(obs, list)
}

function getLength() {
    return this._list.length
}
