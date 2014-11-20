// This is taken directly from : knockout-projections

// https://github.com/SteveSanderson/knockout-projections/blob/master/src/knockout-projections.js

// this.mappedValueComputed = ko.computed(this.mappingEvaluator, this);
// this.mappedValueComputed.subscribe(this.onMappingResultChanged, this);
// this.previousMappedValue = this.mappedValueComputed.peek();

function getDiffEntryPostOperationIndex(diffEntry, editOffset) {
    // The diff algorithm's "index" value refers to the output array for additions,
    // but the "input" array for deletions. Get the output array position.
    if (!diffEntry) { return null; }
    switch (diffEntry.status) {
    case 'added':
        return diffEntry.index;
    case 'deleted':
        return diffEntry.index + editOffset;
    default:
        throw new Error('Unknown diff status: ' + diffEntry.status);
    }
}

function insertOutputItem(ko, diffEntry, movedStateItems, stateArrayIndex, outputArrayIndex, mappingOptions, arrayOfState, outputObservableArray, outputArray) {
    // Retain the existing mapped value if this is a move, otherwise perform mapping
    var isMoved = typeof diffEntry.moved === 'number',
        stateItem = isMoved ?
            movedStateItems[diffEntry.moved] :
            new StateItem(ko, diffEntry.value, stateArrayIndex, outputArrayIndex, mappingOptions, arrayOfState, outputObservableArray);
    arrayOfState.splice(stateArrayIndex, 0, stateItem);
    if (stateItem.isIncluded) {
        outputArray.splice(outputArrayIndex, 0, stateItem.mappedValueComputed.peek());
    }

    // Update indexes
    if (isMoved) {
        // We don't change the index until *after* updating this item's position in outputObservableArray,
        // because changing the index may trigger re-mapping, which in turn would cause the new
        // value to be written to the 'index' position in the output array
        stateItem.stateArrayIndex = stateArrayIndex;
        stateItem.setOutputArrayIndexSilently(outputArrayIndex);
    }

    return stateItem;
}

function deleteOutputItem(diffEntry, arrayOfState, stateArrayIndex, outputArrayIndex, outputArray) {
    var stateItem = arrayOfState.splice(stateArrayIndex, 1)[0];
    if (stateItem.isIncluded) {
        outputArray.splice(outputArrayIndex, 1);
    }
    if (typeof diffEntry.moved !== 'number') {
        // Be careful to dispose only if this item really was deleted and not moved
        stateItem.dispose();
    }
}

function updateRetainedOutputItem(stateItem, stateArrayIndex, outputArrayIndex) {
    // Just have to update its indexes
    stateItem.stateArrayIndex = stateArrayIndex;
    stateItem.setOutputArrayIndexSilently(outputArrayIndex);

    // Return the new value for outputArrayIndex
    return outputArrayIndex + (stateItem.isIncluded ? 1 : 0);
}

function makeLookupOfMovedStateItems(diff, arrayOfState) {
    // Before we mutate arrayOfComputedMappedValues at all, grab a reference to each moved item
    var movedStateItems = {};
    for (var diffIndex = 0; diffIndex < diff.length; diffIndex++) {
        var diffEntry = diff[diffIndex];
        if (diffEntry.status === 'added' && (typeof diffEntry.moved === 'number')) {
            movedStateItems[diffEntry.moved] = arrayOfState[diffEntry.moved];
        }
    }
    return movedStateItems;
}

function getFirstModifiedOutputIndex(firstDiffEntry, arrayOfState, outputArray) {
    // Work out where the first edit will affect the output array
    // Then we can update outputArrayIndex incrementally while walking the diff list
    if (!outputArray.length || !arrayOfState[firstDiffEntry.index]) {
        // The first edit is beyond the end of the output or state array, so we must
        // just be appending items.
        return outputArray.length;
    } else {
        // The first edit corresponds to an existing state array item, so grab
        // the first output array index from it.
        return arrayOfState[firstDiffEntry.index].outputArrayIndex.peek();
    }
}

function respondToArrayStructuralChanges(ko, inputObservableArray, arrayOfState, outputArray, outputObservableArray, mappingOptions) {
    return inputObservableArray.subscribe(function(diff) {
        if (!diff.length) {
            return;
        }

        var movedStateItems = makeLookupOfMovedStateItems(diff, arrayOfState),
            diffIndex = 0,
            diffEntry = diff[0],
            editOffset = 0, // A running total of (num(items added) - num(items deleted)) not accounting for filtering
            outputArrayIndex = diffEntry && getFirstModifiedOutputIndex(diffEntry, arrayOfState, outputArray);

        // Now iterate over the state array, at each stage checking whether the current item
        // is the next one to have been edited. We can skip all the state array items whose
        // indexes are less than the first edit index (i.e., diff[0].index).
        for (var stateArrayIndex = diffEntry.index; diffEntry || (stateArrayIndex < arrayOfState.length); stateArrayIndex++) {
            // Does the current diffEntry correspond to this position in the state array?
            if (getDiffEntryPostOperationIndex(diffEntry, editOffset) === stateArrayIndex) {
                // Yes - insert or delete the corresponding state and output items
                switch (diffEntry.status) {
                case 'added':
                    // Add to output, and update indexes
                    var stateItem = insertOutputItem(ko, diffEntry, movedStateItems, stateArrayIndex, outputArrayIndex, mappingOptions, arrayOfState, outputObservableArray, outputArray);
                    if (stateItem.isIncluded) {
                        outputArrayIndex++;
                    }
                    editOffset++;
                    break;
                case 'deleted':
                    // Just erase from the output, and update indexes
                    deleteOutputItem(diffEntry, arrayOfState, stateArrayIndex, outputArrayIndex, outputArray);
                    editOffset--;
                    stateArrayIndex--; // To compensate for the "for" loop incrementing it
                    break;
                default:
                    throw new Error('Unknown diff status: ' + diffEntry.status);
                }

                // We're done with this diff entry. Move on to the next one.
                diffIndex++;
                diffEntry = diff[diffIndex];
            } else if (stateArrayIndex < arrayOfState.length) {
                // No - the current item was retained. Just update its index.
                outputArrayIndex = updateRetainedOutputItem(arrayOfState[stateArrayIndex], stateArrayIndex, outputArrayIndex);
            }
        }

        outputObservableArray.valueHasMutated();
    }, null, 'arrayChange');
}

// Mapping
function observableArrayMap(ko, mappingOptions) {
    var inputObservableArray = this,
        arrayOfState = [],
        outputArray = [],
        outputObservableArray = ko.observableArray(outputArray),
        originalInputArrayContents = inputObservableArray.peek();

    // Shorthand syntax - just pass a function instead of an options object
    if (typeof mappingOptions === 'function') {
        mappingOptions = { mapping: mappingOptions };
    }

    // Validate the options
    if (mappingOptions.mappingWithDisposeCallback) {
        if (mappingOptions.mapping || mappingOptions.disposeItem) {
            throw new Error('\'mappingWithDisposeCallback\' cannot be used in conjunction with \'mapping\' or \'disposeItem\'.');
        }
    } else if (!mappingOptions.mapping) {
        throw new Error('Specify either \'mapping\' or \'mappingWithDisposeCallback\'.');
    }

    // Initial state: map each of the inputs
    for (var i = 0; i < originalInputArrayContents.length; i++) {
        var inputItem = originalInputArrayContents[i],
            stateItem = new StateItem(ko, inputItem, i, outputArray.length, mappingOptions, arrayOfState, outputObservableArray),
            mappedValue = stateItem.mappedValueComputed.peek();
        arrayOfState.push(stateItem);

        if (stateItem.isIncluded) {
            outputArray.push(mappedValue);
        }
    }

    // If the input array changes structurally (items added or removed), update the outputs
    var inputArraySubscription = respondToArrayStructuralChanges(ko, inputObservableArray, arrayOfState, outputArray, outputObservableArray, mappingOptions);

    // Return value is a readonly computed which can track its own changes to permit chaining.
    // When disposed, it cleans up everything it created.
    var returnValue = ko.computed(outputObservableArray).extend({ trackArrayChanges: true }),
        originalDispose = returnValue.dispose;
    returnValue.dispose = function() {
        inputArraySubscription.dispose();
        ko.utils.arrayForEach(arrayOfState, function(stateItem) {
            stateItem.dispose();
        });
        originalDispose.call(this, arguments);
    };

    // Make projections chainable
    addProjectionFunctions(ko, returnValue);

    return returnValue;
}
