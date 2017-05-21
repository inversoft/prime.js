/*
 * Copyright (c) 2014-2016, Inversoft Inc., All Rights Reserved
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
'use strict';

var Prime = Prime || {};

/**
 * The Prime.Widgets namespace.
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
 * &lt;div id="foo-display" class="prime-multiple-select">
 *   &lt;ul id="foo-option-list" class="option-list">
 *     &lt;li id="foo-option-one">&lt;span>One&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-two">&lt;span>Two&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-three">&lt;span>Three&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li>&lt;input type="text" value="aaa"/>&lt;/li>
 *   &lt;/ul>
 *   &lt;ul class="search-results">
 *     &lt;li>One&lt;/li>
 *     &lt;li>Two&lt;/li>
 *     &lt;li>Three&lt;/li>
 *     &lt;li>Add Custom Entry: aaa/li>
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
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the MultipleSelect.
 */
Prime.Widgets.MultipleSelect = function(element) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widgets.MultipleSelect with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widgets.MultipleSelect must have the multiple="multiple" attribute set');
  }

  this._setInitialOptions();
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
   * Pass through to add event listeners to This. The custom events that this MultipleSelect fires are:
   *
   *  'Prime:Widgets:MultipleSelect:deselectOption'
   *  'Prime:Widgets:MultipleSelect:selectOption'
   *  'Prime:Widgets:MultipleSelect:addOption'
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The listener function.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  addEventListener: function(event, listener) {
    this.element.addEventListener(event, listener);
    return this;
  },

  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  addOption: function(value, display) {
    if (this.containsOptionWithValue(value)) {
      return this;
    }

    Prime.Document.newElement('<option/>')
        .setValue(value)
        .setHTML(display)
        .appendTo(this.element);

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
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  deselectOption: function(option) {
    option.setSelected(false);

    var id = this._makeOptionID(option);
    var displayOption = Prime.Document.queryById(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    // If there are no selected options left, add back the placeholder attribute to the input and resize it
    if (this.optionList.query('li').length === 1) {
      this.input.setAttribute('placeholder', this.options['placeholder']);
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
   * @returns {Prime.Widgets.MultipleSelect} This.
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
   * Destroys the widget completely.
   */
  destroy: function() {
    this.element.show();
    this.displayContainer.removeFromDOM();
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
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  highlightOptionForUnselect: function() {
    var options = this.optionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].addClass('selected');
    }

    return this;
  },

  /**
   * Initializes the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  initialize: function() {
    this.element.hide();

    var id = this.element.getId();
    if (id === null || id === '') {
      id = 'prime-multiple-select' + Prime.Widgets.MultipleSelect.count++;
      this.element.setId(id);
    }

    this.displayContainer = Prime.Document.queryById(id + '-display');
    this.input = null;
    if (this.displayContainer === null) {
      this.displayContainer = Prime.Document.newElement('<div/>')
          .setId(id + '-display')
          .addClass(this.options['className'])
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('keyup', this._handleKeyUpEvent)
          .insertAfter(this.element);

      this.optionList = Prime.Document.newElement('<ul/>')
          .addClass('option-list')
          .appendTo(this.displayContainer);

      this.searchResults = Prime.Document.newElement('<ul/>')
          .addClass('search-results')
          .hide()
          .appendTo(this.displayContainer);
    } else {
      this.displayContainer
          .removeAllEventListeners()
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('keyup', this._handleKeyUpEvent);
      this.optionList = this.displayContainer.queryFirst('.option-list');
      this.searchResults = this.displayContainer.queryFirst('.search-results');
    }

    Prime.Document.queryFirst('html').addEventListener('click', this._handleGlobalClickEvent);

    // Close the search
    this.searchResults.hide();

    this._redraw();

    return this;
  },

  /**
   * @returns {boolean} True if the last option is highlighted for unselect.
   */
  isLastOptionHighlightedForUnselect: function() {
    var options = this.optionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('selected');
  },

  /**
   * Removes all of the options from the MultipleSelect.
   *
   * @returns {Prime.Widgets.MultipleSelect} This.
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
    var options = this.optionList.getChildren();
    this.deselectOptionWithValue(options[options.length - 2].getAttribute('value'));
    this.search(null);
  },

  /**
   * Removes the given option from the MultipleSelect by removing the option in the select box and the option in the
   * display container.
   *
   * @param {Prime.Document.Element} option The option to remove.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  removeOption: function(option) {
    if (!(option instanceof Prime.Document.Element)) {
      throw new TypeError('MultipleSelect#removeOption only takes Prime.Document.Element instances');
    }

    option.removeFromDOM();

    var id = this._makeOptionID(option);
    var displayOption = Prime.Document.queryById(id);

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
   * @returns {Prime.Widgets.MultipleSelect} This.
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
   * Selects the given option by setting the selected attribute on the option in the select box (the object passed in is
   * the option from the select box wrapped in a Prime.Document.Element) and adding it to the display container. If the
   * option is already in the display container, that step is skipped.
   *
   * @param {Prime.Document.Element} option The option object from the select box wrapped in a Prime.Document.Element instance.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  selectOption: function(option) {
    if (!(option instanceof Prime.Document.Element)) {
      throw new TypeError('MultipleSelect#selectOption only takes Prime.Document.Element instances');
    }

    var id = this._makeOptionID(option);

    // Check if the option has already been selected
    if (Prime.Document.queryById(id) === null) {
      option.setSelected(true);

      var li = Prime.Document.newElement('<li/>')
          .setAttribute('value', option.getValue())
          .setId(id)
          .insertBefore(this.inputOption);
      Prime.Document.newElement('<span/>')
          .setHTML(option.getHTML())
          .setAttribute('value', option.getValue())
          .appendTo(li);
      Prime.Document.newElement('<a/>')
          .setAttribute('href', '#')
          .setAttribute('value', option.getValue())
          .setHTML(this.options['removeIcon'])
          .addEventListener('click', this._handleClickEvent)
          .appendTo(li);
    }

    // Remove the placeholder attribute on the input and resize it
    this.input.removeAttribute('placeholder');

    // Close the search results and resize the input
    this.searcher.closeSearchResults();

    // Scroll the display to the bottom
    this.optionList.scrollToBottom();

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
   * @returns {Prime.Widgets.MultipleSelect} This.
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
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  setSelectedValues: function() {
    this.element.setSelectedValues.apply(this.element, arguments);
    this._redraw();
    return this;
  },

  /**
   * Unhighlights the last option if it is highlighted.
   *
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  unhighlightOptionForUnselect: function() {
    this.optionList.getChildren().each(function(element) {
      element.removeClass('selected');
    });
    return this;
  },

  /**
   * Sets the class name for the MultipleSelect element.
   *
   * @param className {string} The class name.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withClassName: function(className) {
    this.options['className'] = className;
    return this;
  },

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withCloseTimeout: function(timeout) {
    this.options['closeTimeout'] = timeout;
    return this;
  },

  /**
   * Sets whether or not this MultipleSelect allows custom options to be added.
   *
   * @param {boolean} enabled The flag.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withCustomAddEnabled: function(enabled) {
    this.options['customAddEnabled'] = enabled;
    return this;
  },

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withCustomAddLabel: function(customAddLabel) {
    this.options['customAddLabel'] = customAddLabel;
    return this;
  },

  /**
   * Enable error class handling. When this option is used, if the specified error class is found on any element
   * in the tab content the same error class will be added to the tab to identify the tab contains errors.
   *
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withErrorClassHandling: function(errorClass) {
    this.options['errorClass'] = errorClass;
    return this;
  },

  /**
   * Sets the label that is printed when there are no search results. This must be called before render is called.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withNoSearchResultsLabel: function(noSearchResultsLabel) {
    this.options['noSearchResultsLabel'] = noSearchResultsLabel;
    return this;
  },

  /**
   * Sets the placeholder text for This. This must be called before render is called.
   *
   * @param {string} placeholder The placeholder text.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withPlaceholder: function(placeholder) {
    this.options['placeholder'] = placeholder;
    return this;
  },

  /**
   * Sets the remove icon value. This overrides the default value.
   *
   * @param {string} removeIcon The remove icon text.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withRemoveIcon: function(removeIcon) {
    this.options['removeIcon'] = removeIcon;
    return this;
  },

  /**
   * Sets the search function that can be used to search other sources besides the select box that backs this widget.
   *
   * @param searchFunction {Function} The search function.
   * @returns {Prime.Widgets.MultipleSelect} This.
   */
  withSearchFunction: function(searchFunction) {
    this.options['searchFunction'] = searchFunction;
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
   * @returns {Object} The SearchResults.
   */
  search: function(searchText) {
    this.unhighlightOptionForUnselect();
    return this.options['searchFunction'](searchText, this.element);
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
  _handleBlurEvent: function() {
    window.setTimeout((function() {
      if (document.activeElement !== this.input.domElement) {
        this.searcher.closeSearchResults();
      }
    }).bind(this), 300);
    this.displayContainer.removeClass('focus');
  },

  /**
   * Handles all click events sent to the MultipleSelect.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent: function(event) {
    var target = new Prime.Document.Element(event.target);
    if (target.is('a')) {
      this.removeOptionWithValue(target.getAttribute('value'));
    } else if (target.is('span')) {
      target.selectElementContents();
    } else {
      this.input.focus();
    }

    Prime.Utils.stopEvent(event);
  },

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  _handleFocusEvent: function() {
    this.displayContainer.addClass('focus');
  },

  /**
   * Handles mouse clicks outside of This. If they clicked anything that is not within this MultipleSelect,
   * it closes the search results.
   *
   * @param {Event} event The event.
   * @returns {boolean} Always true so the event is bubbled.
   * @private
   */
  _handleGlobalClickEvent: function(event) {
    var target = new Prime.Document.Element(event.target);
    if (this.displayContainer.domElement !== target.domElement && !target.isChildOf(this.displayContainer)) {
      this.searcher.closeSearchResults();
    }
  },

  /**
   * Handles all key up events sent to the display container.
   *
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the search display is not open, false otherwise. This will prevent the event from continuing.
   * @private
   */
  _handleKeyUpEvent: function(event) {
    var key = event.keyCode;
    if (key === Prime.Events.Keys.ESCAPE) {
      this.unhighlightOptionForUnselect();
    }
  },

  /**
   * Makes an ID for the option.
   *
   * @param {Prime.Document.Element} option The option to make the ID for.
   * @private
   */
  _makeOptionID: function(option) {
    return this.element.getId() + '-option-' + option.getValue().replace(' ', '-');
  },

  /**
   * Redraws the widget.
   * @private
   */
  _redraw: function() {
    // Remove the currently displayed options
    this.optionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    this.inputOption = Prime.Document.newElement('<li/>')
        .appendTo(this.optionList);
    this.input = Prime.Document.newElement('<input/>')
        .addEventListener('click', this._handleClickEvent)
        .addEventListener('blur', this._handleBlurEvent)
        .addEventListener('focus', this._handleFocusEvent)
        .setAttribute('type', 'text')
        .appendTo(this.inputOption);
    this.searcher = new Prime.Widgets.Searcher(this.input, this.searchResults, this)
        .withOptions(this.options)
        .initialize();

    // Add the selected options
    var hasSelectedOptions = false;
    var options = this.element.getOptions();
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      if (option.isSelected()) {
        this.selectOption(option);
        hasSelectedOptions = true;
      }
    }

    // Put the placeholder attribute in if the MultipleSelect has no selected options
    if (!hasSelectedOptions) {
      this.input.setAttribute('placeholder', this.options['placeholder']);
    }

    this.searcher.resizeInput();

    // If error class handling was enabled and the select box has the error class, add it to the display
    if (this.options.errorClass && this.element.hasClass(this.options['errorClass'])) {
      this.displayContainer.addClass(this.options['errorClass']);
    }
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'className': 'prime-multiple-select',
      'closeTimeout': 200,
      'customAddEnabled': true,
      'customAddLabel': 'Add Custom Value: ',
      'errorClass': null,
      'noSearchResultsLabel': 'No Matches For: ',
      'placeholder': 'Choose',
      'removeIcon': 'X',
      'searchFunction': Prime.Widgets.Searcher.selectSearchFunction
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};