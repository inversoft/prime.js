/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
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

import {Events} from "../Events.js";
import {PrimeDocument} from "../PrimeDocument.js";
import {PrimeElement} from "../Document/PrimeElement.js";
import {Utils} from "../Utils.js";
import {Searcher} from "./Searcher.js";

let count = 1;
let AddOptionEvent = 'MultipleSelect:addOption';
let DeselectOptionEvent = 'MultipleSelect:deselectOption';
let SelectOptionEvent = 'MultipleSelect:selectOption';

class MultipleSelect {
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
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the MultipleSelect.
   */
  constructor(element) {
    Utils.bindAll(this);
    this.initialized = false;

    this.element = PrimeElement.wrap(element);
    if (this.element.domElement.tagName !== 'SELECT') {
      throw new TypeError('You can only use MultipleSelect with select elements');
    }

    if (this.element.getAttribute('multiple') !== 'multiple') {
      throw new TypeError('The select box you are attempting to convert to a MultipleSelect must have the multiple="multiple" attribute set');
    }

    this._setInitialOptions();
  }

  /*
   * Statics
   */
  /**
   * @returns {number}
   */
  static get count() {
    return count;
  }

  /**
   * @param {number} value
   */
  static set count(value) {
    count = value;
  }

  /**
   * @returns {string}
   */
  static get AddOptionEvent() {
    return AddOptionEvent;
  }

  /**
   * @param {string} value
   */
  static set AddOptionEvent(value) {
    AddOptionEvent = value;
  }

  /**
   * @returns {string}
   */
  static get DeselectOptionEvent() {
    return DeselectOptionEvent;
  }

  /**
   * @param {string} value
   */
  static set DeselectOptionEvent(value) {
    DeselectOptionEvent = value;
  }

  /**
   * @returns {string}
   */
  static get SelectOptionEvent() {
    return SelectOptionEvent;
  }

  /**
   * @param {string} value
   */
  static set SelectOptionEvent(value) {
    SelectOptionEvent = value;
  }

  /**
   * Finds the HTMLSelectOption with the given id and returns it wrapped in a PrimeElement.
   *
   * @param {String} id
   * @returns {PrimeElement}
   */
  static findOptionWithId(id) {
    return PrimeDocument.queryFirst('[data-option-id="' + id + '"]');
  }

  /**
   * Pass through to add event listeners to This. The custom events that this MultipleSelect fires are:
   *
   *  'MultipleSelect:deselectOption'
   *  'MultipleSelect:selectOption'
   *  'MultipleSelect:addOption'
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The listener function.
   * @returns {MultipleSelect} This.
   */
  addEventListener(event, listener) {
    this.element.addEventListener(event, listener);
    return this;
  }

  /**
   * Determines if this MultipleSelect contains an option with the given value.
   *
   * @param {String} value The value to look for.
   */
  containsOptionWithValue(value) {
    return this.findOptionWithValue(value) !== null;
  }

  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @param {?String} [id] The id of the element. (Defaults to null)
   * @returns {MultipleSelect} This.
   */
  addOption(value, display, id) {
    if ((id === null || id === undefined) && this.containsOptionWithValue(value)) {
      return this;
    }

    let element = PrimeDocument.newElement('<option/>')
        .setValue(value)
        .setHTML(display)
        .appendTo(this.element);

    if (id) {
      element.setDataAttribute("optionId", id);
    }

    // Fire the custom event
    this.element.fireEvent(MultipleSelect.AddOptionEvent, value, this);

    return this;
  }

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container. If the MultipleSelect doesn't contain an option for the given value,
   * this method throws an exception.
   *
   * @param {String} value The value to look for.
   * @returns {MultipleSelect} This.
   */
  deselectOptionWithValue(value) {
    const option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.deselectOption(option);

    return this;
  }

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container.
   *
   * @param {PrimeElement} option The option to deselect.
   * @returns {MultipleSelect} This.
   */
  deselectOption(option) {
    option.setSelected(false);

    const id = option.getDataAttribute('optionId') || this._makeOptionID(option);
    const displayOption = PrimeDocument.queryById(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    // If there are no selected options left, add back the placeholder attribute to the input and resize it
    if (this.optionList.query('li').length === 1) {
      this.input.setAttribute('placeholder', this.options.placeholder);
      this.searcher.resizeInput();
    }

    // Fire the custom event
    this.element.fireEvent(MultipleSelect.DeselectOptionEvent, option.getValue(), this);

    return this;
  }

  /**
   * Destroys the widget completely.
   */
  destroy() {
    this.element.show();
    this.displayContainer.removeFromDOM();
  }

  /**
   * Finds the HTMLSelectOption with the given text and returns it wrapped in a PrimeElement.
   *
   * @param {String} text The text to look for.
   * @returns {PrimeElement} The option element or null.
   */
  findOptionWithText(text) {
    const options = this.element.getOptions();
    for (let i = 0; i < options.length; i++) {
      if (options[i].getTextContent() === text) {
        return options[i];
      }
    }

    return null;
  }

  deselectOptionWithId(id) {
    const option = MultipleSelect.findOptionWithId(id);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the id [' + id + ']');
    }

    this.deselectOption(option);

    return this;
  }

  /**
   * Finds the HTMLSelectOption with the given value and returns it wrapped in a PrimeElement.
   *
   * @param {String} value The value to look for.
   * @returns {PrimeElement} The option element or null.
   */
  findOptionWithValue(value) {
    for (let i = 0; i < this.element.domElement.length; i++) {
      const cur = this.element.domElement.options[i];
      if (cur.value === value) {
        return new PrimeElement(cur);
      }
    }

    return null;
  }

  /**
   * @returns {string[]} The currently selected options values.
   */
  getSelectedValues() {
    return this.element.getSelectedValues();
  }

  /**
   * Determines if the MultipleSelect contains an option with the given value.
   *
   * @param {string} value The value.
   * @returns {boolean} True if the MultipleSelect contains an option with the given value, false otherwise.
   */
  hasOptionWithValue(value) {
    return this.findOptionWithValue(value) !== null;
  }

  /**
   * Highlights the final selected option (if there is one) to indicate that it will be unselected if the user clicks
   * the delete key again.
   *
   * @returns {MultipleSelect} This.
   */
  highlightOptionForUnselect() {
    const options = this.optionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].addClass('selected');
    }

    return this;
  }

  /**
   * Initializes the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @returns {MultipleSelect} This.
   */
  initialize() {
    this.element.hide();

    let id = this.element.getId();
    if (id === null || id === '') {
      id = 'prime-multiple-select' + MultipleSelect.count++;
      this.element.setId(id);
    }

    this.displayContainer = PrimeDocument.queryById(id + '-display');
    this.input = null;
    if (this.displayContainer === null) {
      this.displayContainer = PrimeDocument.newElement('<div/>')
          .setId(id + '-display')
          .addClass(this.options.className)
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('keyup', this._handleKeyUpEvent)
          .insertAfter(this.element);

      this.optionList = PrimeDocument.newElement('<ul/>')
          .addClass('option-list')
          .appendTo(this.displayContainer);

      this.searchResults = PrimeDocument.newElement('<ul/>')
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

    PrimeDocument.queryFirst('html').addEventListener('click', this._handleGlobalClickEvent);

    // Close the search
    this.searchResults.hide();
    this._redraw();

    // When the caller specified a selected order, process all selected options to honor the requested order.
    // - Do this after redraw to ensure that we don't modify the order of the display container.
    // - Currently we only honor the requested order if the option is already selected.
    if (this.options.initialSelectedOrder.length > 0) {
      for (let i = 0; i < this.options.initialSelectedOrder.length; i++) {
        const actual = this.element.queryFirst('option[value=' + this.options.initialSelectedOrder[i] + ']');
        if (actual !== null && actual.isSelected()) {
          this.selectOption(actual);
        }
      }
    }

    this.initialized = true;
    return this;
  }

  /**
   * @returns {boolean} True if the last option is highlighted for unselect.
   */
  isLastOptionHighlightedForUnselect() {
    const options = this.optionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('selected');
  }

  /**
   * Removes all of the options from the MultipleSelect.
   *
   * @returns {MultipleSelect} This.
   */
  removeAllOptions() {
    // Remove in reverse order because the options array is dynamically updated when elements are deleted from the DOM
    const options = this.element.domElement.options;
    for (let i = options.length - 1; i >= 0; i--) {
      this.removeOption(new PrimeElement(options[i]));
    }

    return this;
  }

  /**
   * Removes the highlighted option.
   */
  removeHighlightedOption() {
    const options = this.optionList.getChildren();
    if (this.options.allowDuplicates) {
      this.deselectOptionWithId(options[options.length - 2].getId());
    } else {
      this.deselectOptionWithValue(options[options.length - 2].getAttribute('value'));
    }
    this.search();
  }

  /**
   * Removes the given option from the MultipleSelect by removing the option in the select box and the option in the
   * display container.
   *
   * @param {PrimeElement} option The option to remove.
   * @returns {MultipleSelect} This.
   */
  removeOption(option) {
    if (!(option instanceof PrimeElement)) {
      throw new TypeError('MultipleSelect#removeOption only takes PrimeElement instances');
    }

    option.removeFromDOM();

    let id, displayOption;
    if (this.options.allowDuplicates) {
      // The ids are random so we need to get the data attribute.
      id = option.getDataAttribute('optionId');
      displayOption = PrimeDocument.queryById(id);
    } else {
      // The ids aren't random and can be reproducably created.
      id = this._makeOptionID(option);
      displayOption = PrimeDocument.queryById(id);
    }

    // Check if the option has already been selected
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    return this;
  }

  /**
   * Removes the option with the given value from the MultipleSelect by removing the option in the select box and the
   * option in the display container. If the MultipleSelect doesn't contain an option with the given value, this throws
   * an exception.
   *
   * @param {string} value The value of the option to remove.
   * @returns {MultipleSelect} This.
   */
  removeOptionWithValue(value) {
    const option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.removeOption(option);

    return this;
  }

  /**
   * Selects the given option by setting the selected attribute on the option in the select box (the object passed in is
   * the option from the select box wrapped in a PrimeElement) and adding it to the display container. If the
   * option is already in the display container, that step is skipped.
   *
   * @param {PrimeElement} option The option object from the select box wrapped in a PrimeElement instance.
   * @returns {MultipleSelect} This.
   */
  selectOption(option) {
    if (!(option instanceof PrimeElement)) {
      throw new TypeError('MultipleSelect#selectOption only takes PrimeElement instances');
    }

    const id = this._makeOptionID(option);
    let displayOption = PrimeDocument.queryById(id);

    // Move the option if configured, and if already displayed remove it and add it again to get the correct order.
    if (this.options.preserveDisplayedSelectionOrder || !this.initialized) {
      const parent =  option.getParent();
      const lastOption = parent.getLastChild('option');
      if (option.getValue() !== lastOption.getValue()) {
        option.removeFromDOM();
        option.appendTo(parent);
        // If we moved the option, and we already have a display option, delete it so that we can rebuild it.
        if (displayOption !== null) {
          displayOption.removeFromDOM();
          displayOption = null;
        }
      }
    }

    // Check if the option has already been selected
    if (displayOption === null) {
      /*
      If we allow dupes, always duplicate the option and append it to the end or the order will be a problem. The default multiselect doesn't support order)
       */
      if (this.options.allowDuplicates) {
        this.addOption(option.getValue(), option.getHTML(), id);
        option = MultipleSelect.findOptionWithId(id);
      }
      option.setSelected(true);

      const li = PrimeDocument.newElement('<li/>')
          .setAttribute('value', option.getValue())
          .setId(id)
          .insertBefore(this.inputOption);
      PrimeDocument.newElement('<span/>')
          .setHTML(option.getHTML())
          .setAttribute('value', option.getValue())
          .appendTo(li);
      PrimeDocument.newElement('<a/>')
          .setAttribute('href', '#')
          .setAttribute('value', option.getValue())
          .setHTML(this.options.removeIcon)
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
    this.element.fireEvent(MultipleSelect.SelectOptionEvent, option.getValue(), this);

    return this;
  }

  /**
   * Selects the option with the given value by setting the selected attribute on the option in the select box (the
   * object passed in is the option from the select box wrapped in a PrimeElement) and adding it to the display
   * container. If the option is already in the display container, that step is skipped.
   * <p/>
   * If there isn't an option with the given value, this throws an exception.
   *
   * @param {String} value The value of the option to select.
   * @returns {MultipleSelect} This.
   */
  selectOptionWithValue(value) {
    const option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.selectOption(option);

    return this;
  }

  /**
   * Sets the selected options. This mimics the function on Element to provide consistency.
   *
   * @param {string[]} [arguments] The list of options to select based on their values.
   * @returns {MultipleSelect} This.
   */
  setSelectedValues() {
    this.element.setSelectedValues.apply(this.element, arguments);
    this._redraw();
    return this;
  }

  /**
   * Unhighlights the last option if it is highlighted.
   *
   * @returns {MultipleSelect} This.
   */
  unhighlightOptionForUnselect() {
    this.optionList.getChildren().each(function(element) {
      element.removeClass('selected');
    });
    return this;
  }

  withAllowDuplicates(value) {
    this.options.allowDuplicates = value;
    return this;
  }

  /**
   * Sets the class name for the MultipleSelect element.
   *
   * @param className {string} The class name.
   * @returns {MultipleSelect} This.
   */
  withClassName(className) {
    this.options.className = className;
    return this;
  }

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {MultipleSelect} This.
   */
  withCloseTimeout(timeout) {
    this.options.closeTimeout = timeout;
    return this;
  }

  /**
   * Sets whether or not this MultipleSelect allows custom options to be added.
   *
   * @param {boolean} enabled The flag.
   * @returns {MultipleSelect} This.
   */
  withCustomAddEnabled(enabled) {
    this.options.customAddEnabled = enabled;
    return this;
  }

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {MultipleSelect} This.
   */
  withCustomAddLabel(customAddLabel) {
    this.options.customAddLabel = customAddLabel;
    return this;
  }

  /**
   * Enable error class handling. When this option is used, if the specified error class is found on any element
   * in the tab content the same error class will be added to the tab to identify the tab contains errors.
   *
   * @returns {MultipleSelect} This.
   */
  withErrorClassHandling(errorClass) {
    this.options.errorClass = errorClass;
    return this;
  }

  /**
   * Sets the label that is printed when there are no search results. This must be called before render is called.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {MultipleSelect} This.
   */
  withNoSearchResultsLabel(noSearchResultsLabel) {
    this.options.noSearchResultsLabel = noSearchResultsLabel;
    return this;
  }

  /**
   * Sets the placeholder text for This. This must be called before render is called.
   *
   * @param {string} placeholder The placeholder text.
   * @returns {MultipleSelect} This.
   */
  withPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    return this;
  }

  /**
   * When set equal to true, the displayed selection in the widget will be reflected in the serialized form data.
   *
   * Default is 'false', and is the legacy behavior.
   *
   * @param value {boolean} The boolean value, true or false.
   * @returns {MultipleSelect} This.
   */
  withPreserveDisplayedSelectionOrder(value) {
    this.options.preserveDisplayedSelectionOrder = value;
    return this;
  }

  /**
   * Sets the remove icon value. This overrides the default value.
   *
   * @param {string} removeIcon The remove icon text.
   * @returns {MultipleSelect} This.
   */
  withRemoveIcon(removeIcon) {
    this.options.removeIcon = removeIcon;
    return this;
  }

  /**
   * Sets the search function that can be used to search other sources besides the select box that backs this widget.
   *
   * @param searchFunction {Function} The search function.
   * @returns {MultipleSelect} This.
   */
  withSearchFunction(searchFunction) {
    this.options.searchFunction = searchFunction;
    return this;
  }

  /**
   * Used during initialization to modify the order of selected options in the DOM.
   *
   * This does not affect the selected attribute, only the order in the DOM. It is not necessary to
   * provide a complete list of selected option values.
   *
   * If options 'en', 'fr' and 'du' are selected, and you only provide 'du' as input here, 'du'
   * will be moved to ensure it is first in the submitted form data, and the order of 'en' and 'fr'
   * will not be modified, but will come after 'du'.
   *
   * Example:
   *   A user who selected preferred languages in the order German, English, French would initialize the selected
   *   options as: ['du', 'en', 'fr']
   *
   * @param {string[]} selections The selected options values.
   * @returns {MultipleSelect} This.
   */
  withInitialSelectedOrder(selections) {
    this.options.initialSelectedOrder = selections;
    return this;
  }

  /* ===================================================================================================================
   * Searcher's callback interface methods.
   * ===================================================================================================================*/

  /**
   * Called when the Searcher gets a keyboard event that deletes beyond the search input. This highlights the last word
   * in the phrase for removal.
   */
  deletedBeyondSearchInput() {
    if (this.isLastOptionHighlightedForUnselect()) {
      this.removeHighlightedOption();
    }

    this.highlightOptionForUnselect();
  }

  /**
   * Called when the search needs to determine if the custom add option should be displayed. As long as this
   * MultipleSelect does not contain the given value, the custom add option should be displayed.
   *
   * @param {string} value The value.
   * @returns {boolean} True if this MultipleSelect does not contain the value, false otherwise.
   */
  doesNotContainValue(value) {
    return !this.containsOptionWithValue(value);
  }

  /**
   * Called when the Searcher is executing a search. This executes a search via the callback and returns the results.
   *
   * @param {string} [searchText] The text to search for.
   * @returns {Object} The SearchResults.
   */
  search(searchText) {
    this.unhighlightOptionForUnselect();
    return this.options.searchFunction.call(null, searchText, this.element);
  }

  /**
   * Called when the Searcher gets an event that causes a search result to be selected. This adds the word.
   */
  selectSearchResult(value) {

    value = Utils.unescapeHTML(value); // In case the string has html escapes in it.

    // Add the custom option if there is one
    let option = this.findOptionWithText(value);
    if (option === null) {
      this.addOption(value, Utils.escapeHTML(value));
      option = this.findOptionWithValue(value); // The value will still be unescaped
    }

    this.selectOption(option);
  }


  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  _handleBlurEvent() {
    window.setTimeout((function() {
      if (document.activeElement !== this.input.domElement) {
        this.searcher.closeSearchResults();
      }
    }).bind(this), 300);
    this.displayContainer.removeClass('focus');
  }

  /**
   * Handles all click events sent to the MultipleSelect.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent(event) {
    Utils.stopEvent(event);
    const target = new PrimeElement(event.target);
    if (target.is('a')) {
      if (this.options.allowDuplicates) {
        const id = target.getParent().getId();
        this.removeOption(MultipleSelect.findOptionWithId(id));
      } else {
        this.removeOptionWithValue(target.getAttribute('value'));
      }
    } else if (target.is('span')) {
      target.selectElementContents();
    } else {
      this.input.focus();
    }
  }

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  _handleFocusEvent() {
    this.displayContainer.addClass('focus');
  }

  /**
   * Handles mouse clicks outside of This. If they clicked anything that is not within this MultipleSelect,
   * it closes the search results.
   *
   * @param {Event} event The event.
   * @returns {boolean} Always true so the event is bubbled.
   * @private
   */
  _handleGlobalClickEvent(event) {
    const target = new PrimeElement(event.target);
    if (this.displayContainer.domElement !== target.domElement && !target.isChildOf(this.displayContainer)) {
      this.searcher.closeSearchResults();
    }
  }

  /**
   * Handles all key up events sent to the display container.
   *
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the search display is not open, false otherwise. This will prevent the event from continuing.
   * @private
   */
  _handleKeyUpEvent(event) {
    const key = event.keyCode;
    if (key === Events.Keys.ESCAPE) {
      this.unhighlightOptionForUnselect();
    }
  }

  /**
   * Makes an ID for the option.
   *
   * @param {PrimeElement} option The option to make the ID for.
   * @private
   */
  _makeOptionID(option) {
    if (this.options.allowDuplicates === true) {
      let d = new Date().getTime();
      // UUID ish
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    return this.element.getId() + '-option-' + option.getValue().replace(' ', '-');
  }

  /**
   * Redraws the widget.
   * @private
   */
  _redraw() {
    // Remove the currently displayed options
    this.optionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    this.inputOption = PrimeDocument.newElement('<li/>')
        .appendTo(this.optionList);
    this.input = PrimeDocument.newElement('<input/>')
        .addEventListener('click', this._handleClickEvent)
        .addEventListener('blur', this._handleBlurEvent)
        .addEventListener('focus', this._handleFocusEvent)
        .setAttribute('type', 'text')
        .appendTo(this.inputOption);
    this.searcher = new Searcher(this.input, this.searchResults, this)
        .withOptions(this.options)
        .initialize();

    // Add the selected options
    let hasSelectedOptions = false;
    const options = this.element.getOptions();
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.isSelected()) {
        this.selectOption(option);
        hasSelectedOptions = true;
      }
    }

    // Put the placeholder attribute in if the MultipleSelect has no selected options
    if (!hasSelectedOptions) {
      this.input.setAttribute('placeholder', this.options.placeholder);
    }

    this.searcher.resizeInput();

    // If error class handling was enabled and the select box has the error class, add it to the display
    if (this.options.errorClass && this.element.hasClass(this.options.errorClass)) {
      this.displayContainer.addClass(this.options.errorClass);
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      allowDuplicates: false,
      className: 'prime-multiple-select',
      closeTimeout: 200,
      customAddEnabled: true,
      customAddLabel: 'Add Custom Value: ',
      errorClass: null,
      initialSelectedOrder: [],
      noSearchResultsLabel: 'No Matches For: ',
      placeholder: 'Choose',
      preserveDisplayedSelectionOrder: false,
      searchFunction: Searcher.selectSearchFunction,
      removeIcon: 'X'
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {MultipleSelect};
