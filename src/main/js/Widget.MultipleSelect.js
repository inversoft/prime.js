/*
 * Copyright (c) 2013, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
var Prime = Prime || {};
Prime.Widget = Prime.Widget || {};


/**
 * Constructs a MultipleSelect object for the given element.
 *
 * The MultipleSelect generates a number of different HTML elements directly after the SELECT element you pass to the
 * constructor. A fully rendered MultipleSelect might look something like this:
 *
 * <pre>
 * &lt;select id="foo">
 *   &lt;option value="one">One&lt;/option>
 *   &lt;option value="two">Two&lt;/option>
 *   &lt;option value="three">Three&lt;/option>
 * &lt;/select>
 * &lt;div id="foo-display" class="prime-multiple-select-display">
 *   &lt;ul id="foo-option-list" class="prime-multiple-select-option-list">
 *     &lt;li id="foo-option-one" class="prime-multiple-select-option">&lt;span>One&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-two" class="prime-multiple-select-option">&lt;span>Two&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-three" class="prime-multiple-select-option">&lt;span>Three&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li class="prime-multiple-select-input-option">&lt;input type="text" class="prime-multiple-select-input" value="aaa"/>&lt;/li>
 *   &lt;/ul>
 *   &lt;ul class="prime-multiple-select-search-results">
 *     &lt;li class="prime-multiple-select-search-results-option">One&lt;/li>
 *     &lt;li class="prime-multiple-select-search-results-option">Two&lt;/li>
 *     &lt;li class="prime-multiple-select-search-results-option">Three&lt;/li>
 *     &lt;li class="prime-multiple-select-search-results-add-custom">Add Custom Entry: aaa/li>
 *   &lt;/ul>
 * &lt;/div>
 * </pore>
 *
 * @param {Prime.Dom.Element} element The Prime Element for the MultipleSelect.
 * @param {boolean} [customAddEnabled=true] Determines if users can add custom options to the MultipleSelect.
 * @param {string} [customAddLabel="Add Custom Value:"] The label for the custom add option in the search results.
 * @constructor
 */
Prime.Widget.MultipleSelect = function(element, customAddEnabled, customAddLabel) {
  this.element = (element instanceof Prime.Dom.Element) ? element : new Prime.Dom.Element(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widget.MultipleSelect with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widget.MultipleSelect must have the multiple="multiple" attribute set');
  }

  this.element.hide();
  this.searchDisplayed = false;
  this.customAddEnabled = typeof(customAddEnabled) !== 'undefined' ? customAddEnabled : true;
  this.customAddLabel = typeof(customAddLabel) !== 'undefined' ? customAddLabel : 'Add Custom Value: ';

  var id = this.element.getID();
  if (id === null) {
    id = 'prime-multiple-select' + Prime.Widget.MultipleSelect.count++;
    this.element.setID(id);
  }

  this.displayContainer = Prime.Dom.queryByID(id + '-display');
  if (this.displayContainer === null) {
    this.displayContainer = Prime.Dom.newElement('<div/>').
        setID(id + '-display').
        addClass('prime-multiple-select-display').
        addEventListener('click', this.openSearch, this).
        addEventListener('keydown', this.handleKeyDownEvent, this).
        addEventListener('keyup', this.handleKeyUpEvent, this).
        insertAfter(this.element);

    this.displayContainerSelectedOptionList = Prime.Dom.newElement('<ul/>').
        addClass('prime-multiple-select-option-list').
        appendTo(this.displayContainer);

    this.searchResultsContainer = Prime.Dom.newElement('<ul/>').
        addClass('prime-multiple-select-search-results').
        hide().
        appendTo(this.displayContainer);

    this.searchResultsAddCustomOption = Prime.Dom.newElement('<li/>').
        addClass('prime-multiple-select-search-results-add-custom').
        addEventListener('click', this.addCustomOption, this).
        hide().
        appendTo(this.searchResultsContainer);
  } else {
    this.displayContainer.
        removeAllEventListeners().
        addEventListener('click', this.openSearch, this).
        addEventListener('keydown', this.handleKeyDownEvent, this).
        addEventListener('keyup', this.handleKeyUpEvent, this);
    this.displayContainerSelectedOptionList = Prime.Dom.queryFirst('.prime-multiple-select-option-list', this.displayContainer);
    this.searchResultsContainer = Prime.Dom.queryFirst('.prime-multiple-select-search-results', this.displayContainer);
    this.searchResultsAddCustomOption = Prime.Dom.queryFirst('.prime-multiple-select-search-results-add-custom', this.displayContainer).
        removeAllEventListeners().
        addEventListener('click', this.addCustomOption, this);
  }

  // Rebuild the display
  this.rebuildDisplay();
};

/*
 * Statics
 */
Prime.Widget.MultipleSelect.count = 1;

Prime.Widget.MultipleSelect.prototype = {
  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  addOption: function(value, display) {
    if (this.containsOptionWithValue(value)) {
      return this;
    }

    Prime.Dom.newElement('<option/>').
        setValue(value).
        setHTML(display).
        appendTo(this.element);

    return this;
  },

  /**
   * Displays the search input box and search results div.
   */
  closeSearch: function() {
    if (this.searchDisplayed) {
      this.searchDisplayed = false;
      this.inputOption.hide();
      this.searchResultsContainer.hide();
      this.removeAllSearchResults();
    }
  },

  /**
   * Determines if this MultipleSelect contains an option with the given value.
   *
   * @param {String} value The value to look for.
   */
  containsOptionWithValue: function(value) {
    return this.findOptionWithValue(value) !== null;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container.
   *
   * @param {Prime.Dom.Element} option The option to deselect.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  deselectOption: function(option) {
    option.removeAttribute('selected');

    var id = this.makeOptionID(option);
    var displayOption = Prime.Dom.queryByID(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    return this;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container. If the MultipleSelect doesn't contain an option for the given value,
   * this method throws an exception.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  deselectOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.deselectOption(option);

    return this;
  },

  /**
   * Finds the HTMLSelectOption with the given text and returns it wrapped in a Prime.Dom.Element.
   *
   * @param {String} text The text to look for.
   * @return {Prime.Dom.Element} The option element or null.
   */
  findOptionWithText: function(text) {
    for (var i = 0; i < this.element.domElement.length; i++) {
      var cur = this.element.domElement.options[i];
      if (cur.innerText === text) {
        return new Prime.Dom.Element(cur);
      }
    }

    return null;
  },

  /**
   * Finds the HTMLSelectOption with the given value and returns it wrapped in a Prime.Dom.Element.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Dom.Element} The option element or null.
   */
  findOptionWithValue: function(value) {
    for (var i = 0; i < this.element.domElement.length; i++) {
      var cur = this.element.domElement.options[i];
      if (cur.value === value) {
        return new Prime.Dom.Element(cur);
      }
    }

    return null;
  },

  /**
   * Determines if the MultipleSelect contains an option with the given value.
   *
   * @param {string} value The value.
   * @returns {boolean} True if the MultipleSelect contains an option with the given value, false otherwise.
   */
  hasOptionWithValue: function(value) {
    return this.findOptionWithValue(value) !== null;
  },

  /**
   * Highlights the previous option in the search results if one is highlighted. If there isn't any option highlighted,
   * this highlights the last one. This method handles wrapping.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  highlightNextOptionInSearchResults: function() {
    var searchResults = this.searchResultsContainer.getChildren();
    var length = this.isCustomAddVisible() ? searchResults.length : searchResults.length - 1;
    var index = this.indexOfHighlightedOptionInSearchResults();
    if (index === -1 || index === length - 1) {
      this.highlightOptionInSearchResults(0);
    } else {
      this.highlightOptionInSearchResults(index + 1);
    }

    return this;
  },

  /**
   * Highlights the final selected option (if there is one) to indicate that it will be unselected if the user clicks
   * the delete key again.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  highlightOptionForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].addClass('prime-multiple-select-option-highlighted');
    }

    return this;
  },

  /**
   * Highlights the option in the search results at the given index.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  highlightOptionInSearchResults: function(index) {
    var searchResults = this.searchResultsContainer.getChildren();
    searchResults.each(function(element) {
      element.removeClass('prime-multiple-select-highlighted-search-result');
    });

    searchResults[index].addClass('prime-multiple-select-highlighted-search-result');

    return this;
  },

  /**
   * Highlights the previous option in the search results if one is highlighted. If there isn't any option highlighted,
   * this selects the last one. This method handles wrapping.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  highlightPreviousOptionInSearchResults: function() {
    var searchResults = this.searchResultsContainer.getChildren();
    var length = this.isCustomAddVisible() ? searchResults.length : searchResults.length - 1;
    var index = this.indexOfHighlightedOptionInSearchResults();
    if (index <= 0) {
      this.highlightOptionInSearchResults(length - 1);
    } else {
      this.highlightOptionInSearchResults(index - 1);
    }

    return this;
  },

  /**
   * @returns {number} The index in the search results of the option that is currently highlighted.
   */
  indexOfHighlightedOptionInSearchResults: function() {
    var searchResults = this.searchResultsContainer.getChildren();
    var index = -1;
    for (var i = 0; i < searchResults.length; i++) {
      if (searchResults[i].hasClass('prime-multiple-select-highlighted-search-result')) {
        index = i;
        break;
      }
    }

    return index;
  },

  /**
   * @returns {boolean} True if the search results add custom option is being displayed currently.
   */
  isCustomAddVisible: function() {
    return this.searchResultsAddCustomOption.isVisible();
  },

  /**
   * @returns {boolean} True if the last option is highlighted for unselect.
   */
  isLastOptionHighlightedForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('prime-multiple-select-option-highlighted');
  },

  /**
   * @returns {boolean} True if the search input field is being displayed currently.
   */
  isSearchInputVisible: function() {
    return this.searchDisplayed;
  },

  /**
   * @returns {boolean} True if any search results are being displayed currently.
   */
  isSearchResultsVisible: function() {
    return this.searchResultsContainer.isVisible();
  },

  /**
   * Displays the search input box and search results div.
   */
  openSearch: function() {
    if (!this.searchDisplayed) {
      this.searchDisplayed = true;
      this.displayContainer.scrollToBottom();
      this.input.setValue('');
      this.inputOption.show();
      this.input.focus();
    }

    return false;
  },

  /**
   * Rebuilds the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  rebuildDisplay: function() {
    // Close the search
    this.closeSearch();

    // Remove the currently displayed options
    this.displayContainerSelectedOptionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    this.inputOption = Prime.Dom.newElement('<li/>').
        addClass('prime-multiple-select-input-option').
        hide(). // Start hidden
        appendTo(this.displayContainerSelectedOptionList);
    this.input = Prime.Dom.newElement('<input/>').
        setAttribute('type', 'text').
        addClass('prime-multiple-select-input').
        appendTo(this.inputOption);

    // Add the selected options
    for (var i = 0; i < this.element.domElement.length; i++) {
      var option = this.element.domElement.options[i];
      if (option.selected) {
        this.selectOption(new Prime.Dom.Element(option));
      }
    }

    return this;
  },

  /**
   * Removes all of the options from the MultipleSelect.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeAllOptions: function() {
    // Remove in reverse order because the options array is dynamically updated when elements are deleted from the DOM
    var options = this.element.domElement.options;
    for (var i = options.length - 1; i >= 0; i--) {
      this.removeOption(new Prime.Dom.Element(options[i]));
    }

    return this;
  },

  /**
   * Removes the highlighted option.
   */
  removeHighlightedOption: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    this.deselectOptionWithValue(options[options.length - 2].getAttribute('value'));
  },

  /**
   * Removes the given option from the MultipleSelect by removing the option in the select box and the option in the
   * display container.
   *
   * @param {Prime.Dom.Element} option The option to remove.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeOption: function(option) {
    if (!(option instanceof Prime.Dom.Element)) {
      throw new TypeError('MultipleSelect#removeOption only takes Prime.Dom.Element instances');
    }

    option.removeFromDOM();

    var id = this.makeOptionID(option);
    var displayOption = Prime.Dom.queryByID(id);

    // Check if the option has already been selected
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    return this;
  },

  /**
   * Removes the option with the given value from the MultipleSelect by removing the option in the select box and the
   * option in the display container. If the MultipleSelect doesn't contain an option with the given value, this throws
   * an exception.
   *
   * @param {Prime.Dom.Element} value The value of the option to remove.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.removeOption(option);

    return this;
  },

  /**
   * Executes a search using the value from the input field and the selectable options.
   *
   * @param {string} searchText The text to search for (this value is also set into the input box).
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  search: function(searchText) {
    // Set the search text into the input box if it is different and then lowercase it
    if (this.input.getValue() !== searchText) {
      this.input.setValue(searchText);
    }

    searchText = searchText.toLowerCase();

    // Clear the search results (if there are any)
    this.removeAllSearchResults();

    // Grab the search text and look up the options for it. If there aren't any or it doesn't exactly match any, show
    // the add custom option.
    var selectableOptions = this.selectableOptionsForPrefix(searchText);
    var show = false;
    if (this.customAddEnabled && searchText !== '' &&
        (selectableOptions.length === 0 || !this.arrayContainsValueIgnoreCase(selectableOptions, searchText))) {
      this.searchResultsAddCustomOption.setHTML(this.customAddLabel + searchText);
      this.searchResultsAddCustomOption.show();
      show = true;
    } else {
      this.searchResultsAddCustomOption.hide();
      show = false;
    }

    for (var i = 0; i < selectableOptions.length; i++) {
      var optionText = selectableOptions[i];
      Prime.Dom.newElement('<li/>').
          addClass('prime-multiple-select-search-results-option').
          setHTML(optionText).
          addEventListener('click', function() {
            var option = this.findOptionWithText(optionText);
            this.selectOption(option);
            this.closeSearch();
          }, this).
          prependTo(this.searchResultsContainer);
      show = true;
    }

    // Only show the display if we have any options to display
    if (show) {
      this.searchResultsContainer.show();
    } else {
      this.searchResultsContainer.hide();
    }

    return this;
  },

  /**
   * Selects the highlighted search result unless there isn't one highlighted, in which case, this does nothing.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  selectHighlightedSearchResult: function() {
    var index = this.indexOfHighlightedOptionInSearchResults();
    if (index === -1) {
      return this;
    }

    var highlightedSearchResult = this.searchResultsContainer.getChildren()[index];
    if (highlightedSearchResult.hasClass('prime-multiple-select-search-results-add-custom')) {
      this.addCustomOption();
    } else {
      var option = this.findOptionWithText(highlightedSearchResult.getHTML());
      this.selectOption(option);
    }

    return this;
  },

  /**
   * Selects the given option by setting the selected attribute on the option in the select box (the object passed in is
   * the option from the select box wrapped in a Prime.Dom.Element) and adding it to the display container. If the
   * option is already in the display container, that step is skipped.
   *
   * @param {Prime.Dom.Element} option The option object from the select box wrapped in a Prime.Dom.Element instance.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  selectOption: function(option) {
    if (!(option instanceof Prime.Dom.Element)) {
      throw new TypeError('MultipleSelect#selectOption only takes Prime.Dom.Element instances');
    }

    var id = this.makeOptionID(option);

    // Check if the option has already been selected
    if (Prime.Dom.queryByID(id) === null) {
      option.setAttribute('selected', 'selected');

      var li = Prime.Dom.newElement('<li/>').
          addClass('prime-multiple-select-option').
          setAttribute('value', option.getValue()).
          setID(id).
          insertBefore(this.inputOption);
      Prime.Dom.newElement('<span/>').
          setHTML(option.getHTML()).
          setAttribute('value', option.getValue()).
          appendTo(li);
      Prime.Dom.newElement('<a/>').
          setAttribute('href', '#').
          setAttribute('value', option.getValue()).
          setHTML('X').
          addEventListener('click', function(event) {
            this.deselectOptionWithValue(new Prime.Dom.Element(event.target).getAttribute('value'));
            return false;
          }, this).
          appendTo(li);
    }

    return this;
  },

  /**
   * Selects the option with the given value by setting the selected attribute on the option in the select box (the
   * object passed in is the option from the select box wrapped in a Prime.Dom.Element) and adding it to the display
   * container. If the option is already in the display container, that step is skipped.
   * <p/>
   * If there isn't an option with the given value, this throws an exception.
   *
   * @param {String} value The value of the option to select.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  selectOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.selectOption(option);

    return this;
  },

  /**
   * Unhighlights the last option if it is highlighted.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  unhighlightOptionForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].removeClass('prime-multiple-select-option-highlighted');
    }

    return this;
  },


  /*
   * Private methods
   */

  /**
   * Handles when a user clicks on the add custom value option. This creates a new option, selects it and then closes
   * the search.
   *
   * @private
   */
  addCustomOption: function() {
    var customValue = this.input.getValue();
    this.addOption(customValue, customValue);
    this.selectOptionWithValue(customValue);
  },

  /**
   * Determines if the given array contains the given string value ignoring case on both sides.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {string} value The string value ot look for.
   * @returns {boolean} True if the array contains the value, false otherwise.
   */
  arrayContainsValueIgnoreCase: function(array, value) {
    for (var i = 0; i < array.length; i++) {
      if (value.toLowerCase() === array[i].toLowerCase()) {
        return true;
      }
    }

    return false;
  },

  /**
   * Handles the key down events that should not be propagated.
   *
   * @private
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the event is not an arrow key.
   */
  handleKeyDownEvent: function(event) {
    // Handle backspace and escape specially since it can occur when the search is closed
    var key = event.keyCode;
    if (key == Prime.Event.Keys.BACKSPACE) {
      if (this.isLastOptionHighlightedForUnselect()) {
        this.removeHighlightedOption();
        this.highlightOptionForUnselect();
        return false;
      } else if (this.input.getValue() === '') {
        this.highlightOptionForUnselect();
        this.closeSearch();
        return false;
      } else {
        return true;
      }
    } else if (key === Prime.Event.Keys.ESCAPE) {
      // Close the search
      this.closeSearch();
      this.unhighlightOptionForUnselect();
      return false;
    }

    if (!this.isSearchInputVisible()) {
      return true;
    }

    var value = this.input.getValue();
    if (key === Prime.Event.Keys.UP_ARROW) {
      if (this.isSearchResultsVisible()) {
        this.highlightPreviousOptionInSearchResults();
      } else {
        this.search(value);
      }

      return false;
    } else if (key === Prime.Event.Keys.DOWN_ARROW) {
      if (this.isSearchResultsVisible()) {
        this.highlightNextOptionInSearchResults();
      } else {
        this.search(value);
      }

      return false;
    }

    return true;
  },

  /**
   * Handles all key up events sent to the display container.
   *
   * @private
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the search display is not open, false otherwise. This will prevent the event from continuing.
   */
  handleKeyUpEvent: function(event) {
    if (!this.isSearchInputVisible()) {
      return true;
    }

    var key = event.keyCode;
    var value = this.input.getValue();
    if (key === Prime.Event.Keys.ENTER) {
      // If a search result is highlighted, add it
      if (this.indexOfHighlightedOptionInSearchResults() !== -1) {
        this.selectHighlightedSearchResult();
      } else if (this.isCustomAddVisible()) {
        // If the custom option is visible, add a custom option. Otherwise, if there is an option for the current value, select it
        this.addCustomOption();
      } else if (this.hasOptionWithValue(value)) {
        this.selectOptionWithValue(value);
      }

      this.closeSearch();
      this.openSearch();

      return false;
    } else if (key !== Prime.Event.Keys.UP_ARROW && key !== Prime.Event.Keys.DOWN_ARROW) {
      this.search(value);
    }

    return true;
  },

  /**
   * Makes an ID for the option.
   *
   * @private
   * @param {Prime.Dom.Element} option The option to make the ID for.
   */
  makeOptionID: function(option) {
    return this.element.getID() + '-option-' + option.getValue().replace(' ', '-');
  },

  /**
   * Removes all of the search results.
   *
   * @private
   */
  removeAllSearchResults: function() {
    Prime.Dom.query('.prime-multiple-select-search-results-option', this.searchResultsContainer).removeAllFromDOM();
  },

  /**
   * Returns the set of selectable options for the given prefix.
   *
   * @private
   * @param {string} [prefix] The prefix to look for options for.
   * @returns {Array} The selectable options in an array of strings.
   */
  selectableOptionsForPrefix: function(prefix) {
    prefix = typeof prefix !== 'undefined' ? prefix : null;

    var options = this.element.domElement.options;
    var selectableOptions = [];
    for (var i = 0; i < options.length; i++) {
      var option = new Prime.Dom.Element(options[i]);
      if (option.isSelected()) {
        continue;
      }

      var html = option.getHTML();
      if (prefix === null || prefix === '' || html.toLowerCase().indexOf(prefix) === 0) {
        selectableOptions.push(html);
      }
    }

    // Alphabetize the options
    if (selectableOptions.length > 0) {
      selectableOptions.sort();
    }

    return selectableOptions;
  }
};