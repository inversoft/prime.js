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
 * The with* methods can be used to setup the configuration for this MultipleSelect, but here are some defaults:
 *
 * <ul>
 *   <li>placeholder = "Choose"</li>
 *   <li>customAddEnabled = true</li>
 *   <li>customAddLabel = "Add Custom Value:"</li>
 *   <li>noSearchResultsLabel = "No Matches For:"</li>
 * </ul>
 *
 * @constructor
 * @param {Prime.Document.Element} element The Prime Element for the MultipleSelect.
 */
Prime.Widgets.MultipleSelect = function(element) {
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widgets.MultipleSelect with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widgets.MultipleSelect must have the multiple="multiple" attribute set');
  }

  this.element.hide();
  this.placeholder = 'Choose';
  this.noSearchResultsLabel = 'No Matches For: ';
  this.customAddEnabled = true;
  this.customAddLabel = 'Add Custom Value: ';

  var id = this.element.getID();
  if (id === null || id === '') {
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
        addEventListener('keyup', this.handleKeyUpEvent, this);
    this.displayContainerSelectedOptionList = Prime.Document.queryFirst('.prime-multiple-select-option-list', this.displayContainer);
    this.searchResultsContainer = Prime.Document.queryFirst('.prime-multiple-select-search-result-list', this.displayContainer);
  }

  Prime.Document.queryFirst('html').addEventListener('click', this.handleGlobalClickEvent, this);
};

/*
 * Statics
 */
Prime.Widgets.MultipleSelect.count = 1;
Prime.Widgets.MultipleSelect.AddOptionEvent = 'Prime:Widgets:MultipleSelect:addOption';
Prime.Widgets.MultipleSelect.DeselectOptionEvent = 'Prime:Widgets:MultipleSelect:deselectOption';
Prime.Widgets.MultipleSelect.SelectOptionEvent = 'Prime:Widgets:MultipleSelect:selectOption';

Prime.Widgets.MultipleSelect.prototype = {
  /**
   * Pass through to add event listeners to this MultipleSelect. The custom events that this MultipleSelect fires are:
   *
   *  'Prime:Widgets:MultipleSelect:deselectOption'
   *  'Prime:Widgets:MultipleSelect:selectOption'
   *  'Prime:Widgets:MultipleSelect:addOption'
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The listener function.
   * @param {*} [context] The context.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  addEventListener: function(event, listener, context) {
    this.element.addEventListener(event, listener, context);
    return this;
  },

  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  addOption: function(value, display) {
    if (this.containsOptionWithValue(value)) {
      return this;
    }

    Prime.Document.newElement('<option/>').
        setValue(value).
        setHTML(display).
        appendTo(this.element);

    // Fire the custom event
    this.element.fireEvent(Prime.Widgets.MultipleSelect.AddOptionEvent, value, this);

    return this;
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
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  deselectOption: function(option) {
    option.setSelected(false);

    var id = this.makeOptionID(option);
    var displayOption = Prime.Document.queryByID(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    // If there are no selected options left, add back the placeholder attribute to the input and resize it
    if (Prime.Document.query('.prime-multiple-select-option', this.displayContainerSelectedOptionList).length === 0) {
      this.input.setAttribute('placeholder', this.placeholder);
      this.searcher.resizeInput();
    }

    // Fire the custom event
    this.element.fireEvent(Prime.Widgets.MultipleSelect.DeselectOptionEvent, option.getValue(), this);

    return this;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container. If the MultipleSelect doesn't contain an option for the given value,
   * this method throws an exception.
   *
   * @param {String} value The value to look for.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
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
   * @returns {Prime.Document.Element} The option element or null.
   */
  findOptionWithText: function(text) {
    var options = this.element.getOptions();
    for (var i = 0; i < options.length; i++) {
      if (options[i].getTextContent() === text) {
        return options[i];
      }
    }

    return null;
  },

  /**
   * Finds the HTMLSelectOption with the given value and returns it wrapped in a Prime.Document.Element.
   *
   * @param {String} value The value to look for.
   * @returns {Prime.Document.Element} The option element or null.
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
   * @returns {string[]} The currently selected options values.
   */
  getSelectedValues: function() {
    return this.element.getSelectedValues();
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
   * @returns {boolean} True if the last option is highlighted for unselect.
   */
  isLastOptionHighlightedForUnselect: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('prime-multiple-select-option-highlighted');
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
    this.search(null);
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
   * Rebuilds the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  render: function() {
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
        addEventListener('blur', this.handleBlurEvent, this).
        setAttribute('type', 'text').
        appendTo(this.inputOption);
    this.searcher = new Prime.Widgets.Searcher(this.input, this.searchResultsContainer, this).
        withCustomAddEnabled(this.customAddEnabled).
        withCustomAddLabel(this.customAddLabel).
        withNoSearchResultsLabel(this.noSearchResultsLabel);

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

    this.searcher.resizeInput();

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

    // Close the search results and resize the input
    this.searcher.closeSearchResults();

    // Scroll the display to the bottom
    this.displayContainerSelectedOptionList.scrollToBottom();

    // Fire the custom event
    this.element.fireEvent(Prime.Widgets.MultipleSelect.SelectOptionEvent, option.getValue(), this);

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
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
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
   * Sets the selected options. This mimics the function on Element to provide consistency.
   *
   * @param {string[]} [arguments] The list of options to select based on their values.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  setSelectedValues: function() {
    this.element.setSelectedValues.apply(this.element, arguments);
    this.render();
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

  /**
   * Sets whether or not this MultipleSelect allows custom options to be added.
   *
   * @param {string} enabled The flag.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  withCustomAddEnabled: function(enabled) {
    this.customAddEnabled = enabled;
    return this;
  },

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  withCustomAddLabel: function(customAddLabel) {
    this.customAddLabel = customAddLabel;
    return this;
  },

  /**
   * Sets the label that is printed when there are no search results. This must be called before render is called.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  withNoSearchResultsLabel: function(noSearchResultsLabel) {
    this.noSearchResultsLabel = noSearchResultsLabel;
    return this;
  },

  /**
   * Sets the placeholder text for this MultipleSelect. This must be called before render is called.
   *
   * @param {string} placeholder The placeholder text.
   * @returns {Prime.Widgets.MultipleSelect} This MultipleSelect.
   */
  withPlaceholder: function(placeholder) {
    this.placeholder = placeholder;
    return this;
  },


  /* ===================================================================================================================
   * Searcher's callback interface methods.
   * ===================================================================================================================*/

  /**
   * Called when the Searcher gets a keyboard event that deletes beyond the search input. This highlights the last word
   * in the phrase for removal.
   */
  deletedBeyondSearchInput: function() {
    if (this.isLastOptionHighlightedForUnselect()) {
      this.removeHighlightedOption();
    }

    this.highlightOptionForUnselect();
  },

  /**
   * Called when the search needs to determine if the custom add option should be displayed. As long as this
   * MultipleSelect does not contain the given value, the custom add option should be displayed.
   *
   * @param {string} value The value.
   * @returns {boolean} True if this MultipleSelect does not contain the value, false otherwise.
   */
  doesNotContainValue: function(value) {
    return !this.containsOptionWithValue(value);
  },

  /**
   * Called when the Searcher is executing a search. This executes a search via the callback and returns the results.
   *
   * @param {string} [searchText] The text to search for.
   * @returns The SearchResults.
   */
  search: function(searchText) {
    this.unhighlightOptionForUnselect();

    var options = this.element.domElement.options;
    var selectableOptions = [];
    for (var i = 0; i < options.length; i++) {
      var option = new Prime.Document.Element(options[i]);
      if (option.isSelected()) {
        continue;
      }

      var html = option.getHTML();
      if (searchText === null || searchText === '' || html.toLowerCase().indexOf(searchText.toLowerCase()) === 0) {
        selectableOptions.push(html);
      }
    }

    // Alphabetize the options
    if (selectableOptions.length > 0) {
      selectableOptions.sort();
    }

    return {results: selectableOptions, tooManyResults: false};
  },

  /**
   * Called when the Searcher gets an event that causes a search result to be selected. This adds the word.
   */
  selectSearchResult: function(value) {
    // Add the custom option if there is one
    var option = this.findOptionWithText(value);
    if (option === null) {
      this.addOption(value, value);
      option = this.findOptionWithText(value)
    }

    this.selectOption(option);
  },


  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  handleBlurEvent: function() {
    window.setTimeout(Prime.Utils.proxy(function() {
      if (document.activeElement !== this.input.domElement) {
        this.searcher.closeSearchResults();
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
    } else if (target.hasClass('prime-multiple-select-remove-option')) {
      this.removeOptionWithValue(target.getAttribute('value'));
    } else if (this.input.domElement !== target.currentTarget) {
      console.log('Clicked something else target=[' + event.target + '] currentTarget=[' + event.currentTarget + ']');
    }

    return true;
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
      this.searcher.closeSearchResults();
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
    if (key === Prime.Events.Keys.ESCAPE) {
      this.unhighlightOptionForUnselect();
    }

    return true;
  },

  /**
   * Makes an ID for the option.
   *
   * @private
   * @param {Prime.Document.Element} option The option to make the ID for.
   */
  makeOptionID: function(option) {
    return this.element.getID() + '-option-' + option.getValue().replace(' ', '-');
  }
};