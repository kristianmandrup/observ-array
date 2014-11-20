// Taken from: https://github.com/SteveSanderson/knockout-projections/blob/master/src/knockout-projections.js

// Filtering
function observableArrayFilter(ko, predicate) {
    return observableArrayMap.call(this, ko, function(item) {
        return predicate(item) ? item : exclusionMarker;
    });
}

// Attaching projection functions
// ------------------------------
//
// Builds a collection of projection functions that can quickly be attached to any object.
// The functions are predefined to retain 'this' and prefix the arguments list with the
// relevant 'ko' instance.

var projectionFunctionsCacheName = '_ko.projections.cache';

function attachProjectionFunctionsCache(ko) {
    // Wraps callback so that, when invoked, its arguments list is prefixed by 'ko' and 'this'
    function makeCaller(ko, callback) {
        return function() {
            return callback.apply(this, [ko].concat(Array.prototype.slice.call(arguments, 0)));
        };
    }
    ko[projectionFunctionsCacheName] = {
        map: makeCaller(ko, observableArrayMap),
        filter: makeCaller(ko, observableArrayFilter)
    };
}

function addProjectionFunctions(ko, target) {
    ko.utils.extend(target, ko[projectionFunctionsCacheName]);
    return target; // Enable chaining
}

// Module initialisation
// ---------------------
//
// When this script is first evaluated, it works out what kind of module loading scenario
// it is in (Node.js or a browser `<script>` tag), and then attaches itself to whichever
// instance of Knockout.js it can find.

function attachToKo(ko) {
    ko.projections = {
        _exclusionMarker: exclusionMarker
    };
    attachProjectionFunctionsCache(ko);
    addProjectionFunctions(ko, ko.observableArray.fn); // Make all observable arrays projectable
}

// Determines which module loading scenario we're in, grabs dependencies, and attaches to KO
function prepareExports() {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // Node.js case - load KO synchronously
        var ko = require('knockout');
        attachToKo(ko);
        module.exports = ko;
    } else if (typeof define === 'function' && define.amd) {
        define(['knockout'], attachToKo);
    } else if ('ko' in global) {
        // Non-module case - attach to the global instance
        attachToKo(global.ko);
    }
}

prepareExports();

})(this);
