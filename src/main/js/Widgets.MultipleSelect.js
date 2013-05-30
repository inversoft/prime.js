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

/**
 * The Prime.Widgets namespace. This currently only contains the MultipleSelect class.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};


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
 *   &lt;ul class="prime-multiple-select-search-result-list">
 *     &lt;li class="prime-multiple-select-search-result">One&lt;/li>
 *     &lt;li class="prime-multiple-select-search-result">Two&lt;/li>
 *     &lt;li class="prime-multiple-select-search-result">Three&lt;/li>
 *     &lt;li class="prime-multiple-select-add-custom">Add Custom Entry: aaa/li>
 *   &lt;/ul>
 * &lt;/div>
 * </pore>
 *
 * @constructor
 * @param {Prime.Document.Element} element The Prime Element for the MultipleSelect.
 * @param {string} [placeholder="Choose"] Placeholder text.
 * @param {boolean} [customAddEnabled=true] Determines if users can add custom options to the MultipleSelect.
 * @param {string} [customAddLabel="Add Custom Value:"] The label for the custom add option in the search results.
 * @param {boolean} [noSearchResultsLabel="No Matches For:] The label used when there are no search results.
 */
Prime.Widgets.MultipleSelect = function(element, placeholder, customAddEnabled, customAddLabel, noSearchResultsLabel) {
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widgets.MultipleSelect with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widgets.MultipleSelect must have the multiple="multiple" attribute set');
  }

  this.element.hide();
  this.placeholder = typeof(placeholder) !== 'undefined' ? placeholder : 'Choose';
  this.noSearchResultsLabel = typeof(noSearchResultsLabel) !== 'undefined' ? noSearchResultsLabel : 'No Matches For: ';
  this.customAddEnabled = typeof(customAddEnabled) !== 'undefined' ? customAddEnabled : true;
  this.customAddLabel = typeof(customAddLabel) !== 'undefined' ? customAddLabel : 'Add Custom Value: ';

  var id = this.element.getID();
  if (id === null) {
    id = 'prime-multiple-select' + Prime.Widgets.MultipleSelect.count++;
    this.element.setID(id);
  }

  this.displayContainer = Prime.Document.queryByID(id + '-display');
  this.input = null;
  if (this.displayContainer === null) {
    this.displayContainer = Prime.Document.newElement('<div/>').
        setID(id + '-display').
        addClass('prime-multiple-select-display').
        addEventListener('click', this.handleClickEvent, this).
        addEventListener('keydown', this.handleKeyDownEvent, this).
        addEventListener('keyup', this.handleKeyUpEvent, this).
        insertAfter(this.element);

    this.displayContainerSelectedOptionList = Prime.Document.newElement('<ul/>').
        addClass('prime-multiple-select-option-list').
        appendTo(this.displayContainer);

    this.searchResultsContainer = Prime.Document.newElement('<ul/>').
        addClass('prime-multiple-select-search-result-list').
        hide().
        appendTo(this.displayContainer);
  } else {
    this.displayContainer.
        removeAllEventListeners().
        addEventListener('click', this.handleClickEvent, this).
        addEventListener('keydown', this.handleKeyDownEvent, this).
        addEventListener('keyup', this.handleKeyUpEvent, this);
    this.displayContainerSelectedOptionList = Prime.Document.queryFirst('.prime-multiple-select-option-list', this.displayContainer);
    this.searchResultsContainer = Prime.Document.queryFirst('.prime-multiple-select-search-result-list', this.displayContainer);
  }

  Prime.Document.queryFirst('html').addEventListener('click', this.handleGlobalClickEvent, this);

  // Rebuild the display
  this.rebuildDisplay();
};

/*
 * Statics
 */
Prime.Widgets.MultipleSelect.count = 1;

Prime.Widgets.MultipleSelect.prototype = {
  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @return {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  addOption: function(value, display) {
    if (this.containsOptionWithValue(value)) {
      return this;
    }

    Prime.Document.newElement('<option/>').
        setValue(value).
        setHTML(display).
        appendTo(this.element);

    if (this.isSearchResultsVisible()) {
      this.search();
    }

    return this;
  },

  /**
   * Closes the search results display, unhighlights any options that are highlighted and resets the input's value to
   * empty string.
   */
  closeSearchResults: function() {
    this.unhighlightOptionForUnselect();
    this.searchResultsContainer.hide();
    this.input.setValue('');
    this.resizeInput();
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
   * @param {Prime.Document.Element} option The option to deselect.
   * @return {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  deselectOption: function(option) {
    option.removeAttribute('selected');

    var id = this.makeOptionID(option);
    var displayOption = Prime.Document.queryByID(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    // If there are no selected options left, add back the placeholder attribute to the input and resize it
    if (Prime.Document.query('.prime-multiple-select-option', this.displayContainerSelectedOptionList).length === 0) {
      this.input.setAttribute('placeholder', this.placeholder);
      this.resizeInput();
    }

    if (this.isSearchResultsVisible()) {
      this.search();
    }

    return this;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container. If the MultipleSelect doesn't contain an option for the given value,
   * this method throws an exception.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Widgets.MultipleSelect} This MultipleSelect.
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
   * Finds the HTMLSelectOption with the given text and returns it wrapped in a Prime.Document.Element.
   *
   * @param {String} text The text to look for.
   * @return {Prime.Document.Element} The option element or null.
   */
  findOptionWithText: function(text) {
    for (var i = 0; i < this.element.domElement.length; i++) {
      var cur = this.element.domElement.options[i];
      if (cur.innerText === text) {
        return new Prime.Document.Element(cur);
      }
    }

    return null;
  },

  /**
   * Finds the HTMLSelectOption with the given value and returns it wrapped in a Prime.Document.Element.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Document.Element} The option element or null.
   */
  findOptionWithValue: function(value) {
    for (var i = 0; i < this.element.domElement.length; i++) {
      var cur = this.element.domElement.options[i];
      if (cur.value === value) {
        return new Prime.Document.Element(cur);
      }
    }

    return null;
  },

  /**
   * @returns {Prime.Document.Element} The highlighted search result or null.
   */
  getHighlightedSearchResult: function() {
    return Prime.Document.queryFirst('.prime-multiple-select-highlighted-search-result', this.searchResultsContainer);
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
   * Highlights the next search result if one is highlighted. If there isn't a highlighted search result, this
   * highlights the first one. This method handles wrapping.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  highlightNextSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
    if (searchResult !== null) {
      searchResult = searchResult.getNextSibling();
    }

    // Grab the first search result in the list if there isn't a next sibling
    if (searchResult === null) {
      searchResult = Prime.Document.queryFirst('.prime-multiple-select-search-result', this.searchResultsContainer);
    }

    if (searchResult !== null) {
      this.highlightSearchResult(searchResult);
    }

    return this;
  },

  /**
   * Highlights the final selected option (if there is one) to indicate that it will be unselected if the user clicks
   * the delete key again.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  highlightOptionForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].addClass('prime-multiple-select-option-highlighted');
    }

    return this;
  },

  /**
   * Highlights the previous search result if one is highlighted. If there isn't a highlighted search result, this
   * selects the last one. This method handles wrapping.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  highlightPreviousSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
    if (searchResult !== null) {
      searchResult = searchResult.getPreviousSibling();
    }

    if (searchResult === null) {
      searchResult = Prime.Document.queryLast('.prime-multiple-select-search-result', this.searchResultsContainer);
    }

    if (searchResult !== null) {
      this.highlightSearchResult(searchResult);
    }

    return this;
  },

  /**
   * Highlights the given search result.
   *
   * @param {Prime.Document.Element} searchResult The search result to highlight.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  highlightSearchResult: function(searchResult) {
    this.searchResultsContainer.getChildren().each(function(element) {
      element.removeClass('prime-multiple-select-highlighted-search-result');
    });

    searchResult.addClass('prime-multiple-select-highlighted-search-result');
    var scrollTop = this.searchResultsContainer.getScrollTop();
    var height = this.searchResultsContainer.getHeight();
    var searchResultOffset = searchResult.getOffsetTop();
    if (searchResultOffset + 1 >= scrollTop + height) {
      this.searchResultsContainer.scrollTo(searchResult.getOffsetTop() - this.searchResultsContainer.getHeight() + searchResult.getOuterHeight());
    } else if (searchResultOffset < scrollTop) {
      this.searchResultsContainer.scrollTo(searchResultOffset);
    }

    return this;
  },

  /**
   * @returns {boolean} True if the search results add custom option is being displayed currently.
   */
  isCustomAddVisible: function() {
    return Prime.Document.queryFirst('.prime-multiple-select-add-custom', this.displayContainer) !== null;
  },

  /**
   * @returns {boolean} True if the last option is highlighted for unselect.
   */
  isLastOptionHighlightedForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('prime-multiple-select-option-highlighted');
  },

  /**
   * @returns {boolean} True if any search results are being displayed currently.
   */
  isSearchResultsVisible: function() {
    return this.searchResultsContainer.isVisible();
  },

  /**
   * Rebuilds the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @return {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  rebuildDisplay: function() {
    // Close the search
    this.searchResultsContainer.hide();

    // Remove the currently displayed options
    this.displayContainerSelectedOptionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    this.inputOption = Prime.Document.newElement('<li/>').
        addClass('prime-multiple-select-input-option').
        appendTo(this.displayContainerSelectedOptionList);
    this.input = Prime.Document.newElement('<input/>').
        addClass('prime-multiple-select-input').
        addEventListener('click', this.handleClickEvent, this).
        addEventListener('focus', this.handleFocusEvent, this).
        addEventListener('blur', this.handleBlurEvent, this).
        setAttribute('type', 'text').
        appendTo(this.inputOption);

    // Add the selected options
    var hasSelectedOptions = false;
    for (var i = 0; i < this.element.domElement.length; i++) {
      var option = this.element.domElement.options[i];
      if (option.selected) {
        this.selectOption(new Prime.Document.Element(option));
        hasSelectedOptions = true;
      }
    }

    // Put the placeholder attribute in if the MultipleSelect has no selected options
    if (!hasSelectedOptions) {
      this.input.setAttribute('placeholder', this.placeholder);
    }

    this.resizeInput();

    return this;
  },

  /**
   * Removes all of the options from the MultipleSelect.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  removeAllOptions: function() {
    // Remove in reverse order because the options array is dynamically updated when elements are deleted from the DOM
    var options = this.element.domElement.options;
    for (var i = options.length - 1; i >= 0; i--) {
      this.removeOption(new Prime.Document.Element(options[i]));
    }

    return this;
  },

  /**
   * Removes the highlighted option.
   */
  removeHighlightedOption: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    this.deselectOptionWithValue(options[options.length - 2].getAttribute('value'));
    this.search();
  },

  /**
   * Removes the given option from the MultipleSelect by removing the option in the select box and the option in the
   * display container.
   *
   * @param {Prime.Document.Element} option The option to remove.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  removeOption: function(option) {
    if (!(option instanceof Prime.Document.Element)) {
      throw new TypeError('MultipleSelect#removeOption only takes Prime.Document.Element instances');
    }

    option.removeFromDOM();

    var id = this.makeOptionID(option);
    var displayOption = Prime.Document.queryByID(id);

    // Check if the option has already been selected
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    if (this.isSearchResultsVisible()) {
      this.search();
    }

    return this;
  },

  /**
   * Removes the option with the given value from the MultipleSelect by removing the option in the select box and the
   * option in the display container. If the MultipleSelect doesn't contain an option with the given value, this throws
   * an exception.
   *
   * @param {Prime.Document.Element} value The value of the option to remove.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
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
   * Poor mans resizing of the input field as the user types into it.
   */
  resizeInput: function() {
    var text = this.input.getValue() === '' ? this.input.getAttribute('placeholder') : this.input.getValue();
    var newLength =  Prime.Utils.calculateTextLength(this.input, text) + 10;
    if (newLength < 25) {
      newLength = 25;
    }

    this.input.setWidth(newLength);
  },

  /**
   * Executes a search by optionally updating the input to the given value (if specified) and then rebuilding the search
   * results using the input's value. This method also puts focus on the input and shows the search results (in case
   * they are hidden for any reason).
   *
   * @param {string} [searchText] The text to search for (this value is also set into the input box). If this is not
   * specified then the search is run using the input's value.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  search: function(searchText) {
    // Set the search text into the input box if it is different and then lowercase it
    if (typeof(searchText) !== 'undefined' && this.input.getValue() !== searchText) {
      this.input.setValue(searchText);
    }

    searchText = typeof(searchText) !== 'undefined' ? searchText.toLowerCase() : this.input.getValue();
    this.resizeInput();

    // Clear the search results (if there are any)
    this.removeAllSearchResults();

    // Grab the search text and look up the options for it. If there aren't any or it doesn't exactly match any, show
    // the add custom option.
    var selectableOptions = this.selectableOptionsForPrefix(searchText);
    var count = 0;
    for (var i = 0; i < selectableOptions.length; i++) {
      var optionText = selectableOptions[i];
      Prime.Document.newElement('<li/>').
          addClass('prime-multiple-select-search-result').
          setAttribute('value', optionText).
          setHTML(optionText).
          addEventListener('click', this.handleClickEvent, this).
          addEventListener('mouseover', this.handleMouseOverEvent, this).
          appendTo(this.searchResultsContainer);
      count++;
    }

    // Show the custom add option if necessary
    if (this.customAddEnabled && searchText !== '' &&
        (selectableOptions.length === 0 || !this.arrayContainsValueIgnoreCase(selectableOptions, searchText))) {
      Prime.Document.newElement('<li/>').
          addClass('prime-multiple-select-search-result prime-multiple-select-add-custom').
          addEventListener('click', this.handleClickEvent, this).
          addEventListener('mouseover', this.handleMouseOverEvent, this).
          setHTML(this.customAddLabel + searchText).
          appendTo(this.searchResultsContainer);
      count++;
    }

    // Show the no matches if necessary
    if (count === 0 && searchText !== '') {
      Prime.Document.newElement('<li/>').
          addClass('prime-multiple-select-no-search-results').
          setHTML(this.noSearchResultsLabel + searchText).
          appendTo(this.searchResultsContainer);
      count++;
    }

    // Show the results
    if (count > 0) {
      this.searchResultsContainer.show();

      if (count < 5) {
        this.searchResultsContainer.setHeight(this.searchResultsContainer.getChildren()[0].getOuterHeight() * count + 1);
      } else {
        this.searchResultsContainer.setHeight(this.searchResultsContainer.getChildren()[0].getOuterHeight() * 10 + 1);
      }
    } else {
      this.searchResultsContainer.hide();
    }

    return this;
  },

  /**
   * Selects the highlighted search result unless there isn't one highlighted, in which case, this does nothing.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  selectHighlightedSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
    if (searchResult === null) {
      return this;
    }

    if (searchResult.hasClass('prime-multiple-select-add-custom')) {
      this.addCustomOption();
    } else {
      var option = this.findOptionWithText(searchResult.getHTML());
      this.selectOption(option);
    }

    return this;
  },

  /**
   * Selects the given option by setting the selected attribute on the option in the select box (the object passed in is
   * the option from the select box wrapped in a Prime.Document.Element) and adding it to the display container. If the
   * option is already in the display container, that step is skipped.
   *
   * @param {Prime.Document.Element} option The option object from the select box wrapped in a Prime.Document.Element instance.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  selectOption: function(option) {
    if (!(option instanceof Prime.Document.Element)) {
      throw new TypeError('MultipleSelect#selectOption only takes Prime.Document.Element instances');
    }

    var id = this.makeOptionID(option);

    // Check if the option has already been selected
    if (Prime.Document.queryByID(id) === null) {
      option.setAttribute('selected', 'selected');

      var li = Prime.Document.newElement('<li/>').
          addClass('prime-multiple-select-option').
          setAttribute('value', option.getValue()).
          setID(id).
          insertBefore(this.inputOption);
      Prime.Document.newElement('<span/>').
          setHTML(option.getHTML()).
          setAttribute('value', option.getValue()).
          appendTo(li);
      Prime.Document.newElement('<a/>').
          setAttribute('href', '#').
          setAttribute('value', option.getValue()).
          addClass('prime-multiple-select-remove-option').
          setHTML('X').
          addEventListener('click', this.handleClickEvent, this).
          appendTo(li);
    }

    // Remove the placeholder attribute on the input and resize it
    this.input.removeAttribute('placeholder');
    this.resizeInput();

    // Close the search results
    this.closeSearchResults();

    // Scroll the display to the bottom
    this.displayContainerSelectedOptionList.scrollToBottom();

    return this;
  },

  /**
   * Selects the option with the given value by setting the selected attribute on the option in the select box (the
   * object passed in is the option from the select box wrapped in a Prime.Document.Element) and adding it to the display
   * container. If the option is already in the display container, that step is skipped.
   * <p/>
   * If there isn't an option with the given value, this throws an exception.
   *
   * @param {String} value The value of the option to select.
   * @return {Prime.Widgets.MultipleSelect} This MultipleSelect.
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
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  unhighlightOptionForUnselect: function() {
    this.displayContainerSelectedOptionList.getChildren().each(function(element) {
      element.removeClass('prime-multiple-select-option-highlighted');
    });
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
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  handleBlurEvent: function() {
    window.setTimeout(Prime.Utils.proxy(function() {
      if (document.activeElement !== this.input.domElement) {
        this.closeSearchResults();
      }
    }, this), 300);
  },

  /**
   * Handles all click events sent to the MultipleSelect.
   *
   * @private
   * @param {Event} event The mouse event.
   */
  handleClickEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    if (this.displayContainer.domElement === target.domElement) {
      this.input.focus();
    } else if (target.hasClass('prime-multiple-select-add-custom')) {
      this.addCustomOption();
    } else if (target.hasClass('prime-multiple-select-search-result')) {
      var option = this.findOptionWithText(target.getAttribute('value'));
      this.selectOption(option);
    } else if (target.hasClass('prime-multiple-select-remove-option')) {
      this.removeOptionWithValue(target.getAttribute('value'));
    } else if (target.domElement === this.input.domElement) {
      this.search();
    } else {
      console.log('Clicked something else target=[' + event.target + '] currentTarget=[' + event.currentTarget + ']');
    }

    return true;
  },

  /**
   * Handles when the input field is focused by opening the search results.
   *
   * @private
   */
  handleFocusEvent: function() {
    this.search();
  },

  /**
   * Handles mouse clicks outside of this MultipleSelect. If they clicked anything that is not within this MultipleSelect,
   * it closes the search results.
   *
   * @private
   * @param {Event} event The event.
   * @returns {boolean} Always true so the event is bubbled.
   */
  handleGlobalClickEvent: function(event) {
    var target = new Prime.Document.Element(event.target);
    if (this.displayContainer.domElement !== target.domElement && !target.isChildOf(this.displayContainer)) {
      this.closeSearchResults();
    }

    return true;
  },

  /**
   * Handles the key down events that should not be propagated.
   *
   * @private
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the event is not an arrow key.
   */
  handleKeyDownEvent: function(event) {
    var key = event.keyCode;
    if (key === Prime.Events.Keys.BACKSPACE) {
      this.previousSearchString = this.input.getValue();
    } else if (key === Prime.Events.Keys.UP_ARROW) {
      this.highlightPreviousSearchResult();
      return false;
    } else if (key === Prime.Events.Keys.DOWN_ARROW) {
      if (this.isSearchResultsVisible()) {
        this.highlightNextSearchResult();
      } else {
        this.search();
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
    var key = event.keyCode;
    var value = this.input.getValue();

    if (key == Prime.Events.Keys.BACKSPACE) {
      if (this.isLastOptionHighlightedForUnselect()) {
        this.removeHighlightedOption();
        this.highlightOptionForUnselect();
      } else if (value === '' && this.previousSearchString === '') {
        this.highlightOptionForUnselect();
      } else {
        this.search();
      }
    } else if (key === Prime.Events.Keys.ENTER) {
      // If a search result is highlighted, add it
      if (this.getHighlightedSearchResult() !== null) {
        this.selectHighlightedSearchResult();
      } else if (this.isCustomAddVisible()) {
        // If the custom option is visible, add a custom option. Otherwise, if there is an option for the current value, select it
        this.addCustomOption();
      } else if (this.hasOptionWithValue(value)) {
        this.selectOptionWithValue(value);
      }

      return false;
    } else if (key === Prime.Events.Keys.ESCAPE) {
      this.searchResultsContainer.hide();
      this.unhighlightOptionForUnselect();
    } else if ((key >= 48 && key <= 90) || (key >= 96 && key <= 111) || (key >= 186 && key <= 192) || (key >= 219 && key <= 222)) {
      this.unhighlightOptionForUnselect();
      this.search();
    }

    return true;
  },

  /**
   * Handles mouseover events for the search results (only) by highlighting the event target.
   *
   * @private
   * @param {Event} event The mouseover event.
   */
  handleMouseOverEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    this.highlightSearchResult(target);
  },

  /**
   * Makes an ID for the option.
   *
   * @private
   * @param {Prime.Document.Element} option The option to make the ID for.
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
    Prime.Document.query('li', this.searchResultsContainer).removeAllFromDOM();
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
      var option = new Prime.Document.Element(options[i]);
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