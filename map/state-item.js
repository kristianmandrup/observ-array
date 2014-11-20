StateItem.prototype.mappingEvaluator = function() {
  if (this.isIncluded !== null) { // i.e., not first run
      // This is a replace-in-place, so call any dispose callbacks
      // we have for the earlier value
      this.disposeResultFromMostRecentEvaluation();
  }

  var mappedValue;
  if (this.mappingOptions.mapping) {
      mappedValue = this.mappingOptions.mapping(this.inputItem, this.outputArrayIndex);
  } else if (this.mappingOptions.mappingWithDisposeCallback) {
      var mappedValueWithDisposeCallback = this.mappingOptions.mappingWithDisposeCallback(this.inputItem, this.outputArrayIndex);
      if (!('mappedValue' in mappedValueWithDisposeCallback)) {
          throw new Error('Return value from mappingWithDisposeCallback should have a \'mappedItem\' property.');
      }
      mappedValue = mappedValueWithDisposeCallback.mappedValue;
      this.disposeFuncFromMostRecentMapping = mappedValueWithDisposeCallback.dispose;
  } else {
      throw new Error('No mapping callback given.');
  }

  var newInclusionState = mappedValue !== exclusionMarker;

  // Inclusion state changes can *only* happen as a result of changing an individual item.
  // Structural changes to the array can't cause this (because they don't cause any remapping;
  // they only map newly added items which have no earlier inclusion state to change).
  if (this.isIncluded !== newInclusionState) {
      if (this.isIncluded !== null) { // i.e., not first run
          this.moveSubsequentItemsBecauseInclusionStateChanged(newInclusionState);
      }

      this.isIncluded = newInclusionState;
  }

  return mappedValue;
};

StateItem.prototype.onMappingResultChanged = function(newValue) {
  if (newValue !== this.previousMappedValue) {
      if (this.isIncluded) {
          this.outputArray.splice(this.outputArrayIndex.peek(), 1, newValue);
      }

      if (!this.suppressNotification) {
          this.outputObservableArray.valueHasMutated();
      }

      this.previousMappedValue = newValue;
  }
};

StateItem.prototype.moveSubsequentItemsBecauseInclusionStateChanged = function(newInclusionState) {
    var outputArrayIndex = this.outputArrayIndex.peek(),
        iterationIndex,
        stateItem;

    if (newInclusionState) {
        // Shift all subsequent items along by one space, and increment their indexes.
        // Note that changing their indexes might cause remapping, but won't affect their
        // inclusion status (by definition, inclusion status must not be affected by index,
        // otherwise you get undefined results) so there's no risk of a chain reaction.
        this.outputArray.splice(outputArrayIndex, 0, null);
        for (iterationIndex = this.stateArrayIndex + 1; iterationIndex < this.arrayOfState.length; iterationIndex++) {
            stateItem = this.arrayOfState[iterationIndex];
            stateItem.setOutputArrayIndexSilently(stateItem.outputArrayIndex.peek() + 1);
        }
    } else {
        // Shift all subsequent items back by one space, and decrement their indexes
        this.outputArray.splice(outputArrayIndex, 1);
        for (iterationIndex = this.stateArrayIndex + 1; iterationIndex < this.arrayOfState.length; iterationIndex++) {
            stateItem = this.arrayOfState[iterationIndex];
            stateItem.setOutputArrayIndexSilently(stateItem.outputArrayIndex.peek() - 1);
        }
    }
};

StateItem.prototype.setOutputArrayIndexSilently = function(newIndex) {
    // We only want to raise one output array notification per input array change,
    // so during processing, we suppress notifications
    this.suppressNotification = true;
    this.outputArrayIndex(newIndex);
    this.suppressNotification = false;
};
