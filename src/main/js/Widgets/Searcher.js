/*
 * Copyright (c) 2014-2018, Inversoft Inc., All Rights Reserved
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

class Searcher {
  /**
   * Constructs a Searcher object for the given text input.
   *
   * The Searcher object can be attached and used in conjunction with any other widgets in a generic manner. It
   * provides search capabilities and manages the search results. This is useful for MultipleSelects, IntelliSense and
   * other widgets. Here's the HTML for the search results.
   *
   * <pre>
   *   &lt;input type="text" class="prime-search-result-input" value="F"/>
   *   &lt;ul>
   *     &lt;li>Four&lt;/li>
   *     &lt;li>Five&lt;/li>
   *     &lt;li>Fifteen&lt;/li>
   *     &lt;li>Add Custom Entry: F/li>
   *   &lt;/ul>
   * &lt;/div>
   * </pre>
   *
   * The with* methods can be used to setup the configuration for this SearchResults, but here are some defaults:
   *
   * <ul>
   *   <li>closeTimeout = 200</li>
   *   <li>customAddEnabled = true</li>
   *   <li>customAddCallback = function(customValue){return true;}</li>
   *   <li>customAddLabel = "Add Custom:"</li>
   *   <li>tooManySearchResultsLabel = "Too Many Matches For:"</li>
   *   <li>noSearchResultsLabel = "No Matches For:"</li>
   * </ul>
   *
   * The callback object must conform to this interface:
   *
   * <pre>
   *   CallbackObject {
 *     void deletedBeyondSearchInput()
 *     void doesNotContainValue()
 *     object{results:Array, tooManyResults:boolean} search(_searchString:string),
 *     void selectSearchResult(selectedSearchResult:string),
 *   }
   * </pre>
   *
   * @constructor
   * @param {PrimeElement|Element|EventTarget} inputElement The input element that is used to execute the search.
   * @param {PrimeElement|Element|EventTarget} searchResultsContainer The element that is used to store the search results.
   * @param {*} callbackObject The object that is used to callback for searching and numerous other functions to help
   *            communicate state and determine how to draw the input and search results.
   */
  constructor(inputElement, searchResultsContainer, callbackObject) {
    Utils.bindAll(this);

    this.searchResults = PrimeElement.wrap(searchResultsContainer);
    this.inputElement = PrimeElement.wrap(inputElement);
    if (this.inputElement.domElement.tagName !== 'INPUT') {
      throw new TypeError('You can only use Prime.Widgets.SearchResults with INPUT elements');
    }

    this._setInitialOptions(callbackObject);
  }

  /**
   * A search function that works on a select box.
   *
   * @param searchText {String} The search String.
   * @param select {HTMLSelectElement|PrimeElement} The select box.
   * @returns {{results: Array, tooManyResults: boolean}}
   */
  static selectSearchFunction(searchText, select) {
    const options = PrimeElement.unwrap(select).options;
    const selectableOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = new PrimeElement(options[i]);
      if (option.isSelected()) {
        continue;
      }

      const html = option.getHTML();
      if (searchText === null || searchText === undefined || searchText === '' || html.toLowerCase().indexOf(searchText.toLowerCase()) === 0) {
        selectableOptions.push(html);
      }
    }

    // Alphabetize the options
    if (selectableOptions.length > 0) {
      selectableOptions.sort();
    }

    return {results: selectableOptions, tooManyResults: false};
  }

  /**
   * Closes the search results display, unhighlights any options that are highlighted and resets the input's value to
   * empty string.
   */
  closeSearchResults() {
    this._removeAllSearchResults();
    this.inputElement.setValue('');
    this.searchResults.removeClass('open');
    setTimeout(function() {
      this.searchResults.hide();
      this.resizeInput();
    }.bind(this), this.options.closeTimeout);
  }

  /**
   * Removes all of the event listeners from the input element.
   */
  destroy() {
    this.inputElement
        .removeEventListener('blur', this._handleBlurEvent)
        .removeEventListener('click', this._handleClickEvent)
        .removeEventListener('keyup', this._handleKeyUpEvent)
        .removeEventListener('keydown', this._handleKeyDownEvent)
        .removeEventListener('focus', this._handleFocusEvent);
  }

  focus() {
    this.inputElement.focus();
  }

  /**
   * @returns {PrimeElement} The highlighted search result or null.
   */
  getHighlightedSearchResult() {
    return this.searchResults.queryFirst('.selected');
  }

  /**
   * Highlights the next search result if one is highlighted. If there isn't a highlighted search result, this
   * highlights the first one. This method handles wrapping.
   *
   * @returns {Searcher} This Searcher.
   */
  highlightNextSearchResult() {
    let searchResult = this.getHighlightedSearchResult();
    if (searchResult !== null) {
      searchResult = searchResult.getNextSibling();
    }

    // Grab the first search result in the list if there isn't a next sibling
    if (searchResult === null) {
      searchResult = this.searchResults.queryFirst('.search-result');
    }

    if (searchResult !== null) {
      this.highlightSearchResult(searchResult);
    }

    return this;
  }

  /**
   * Highlights the previous search result if one is highlighted. If there isn't a highlighted search result, this
   * selects the last one. This method handles wrapping.
   *
   * @returns {Searcher} This Searcher.
   */
  highlightPreviousSearchResult() {
    let searchResult = this.getHighlightedSearchResult();
    if (searchResult !== null) {
      searchResult = searchResult.getPreviousSibling();
    }

    if (searchResult === null) {
      searchResult = this.searchResults.queryFirst('.search-result');
    }

    if (searchResult !== null) {
      this.highlightSearchResult(searchResult);
    }

    return this;
  }

  /**
   * Highlights the given search result.
   *
   * @param {PrimeElement} searchResult The search result to highlight.
   * @returns {Searcher} This Searcher.
   */
  highlightSearchResult(searchResult) {
    this.searchResults.getChildren().removeClass('selected');

    searchResult.addClass('selected');
    const scrollTop = this.searchResults.getScrollTop();
    const height = this.searchResults.getHeight();
    const searchResultOffset = searchResult.getOffsetTop();
    if (searchResultOffset + 1 >= scrollTop + height) {
      this.searchResults.scrollTo(searchResult.getOffsetTop() - this.searchResults.getHeight() + searchResult.getOuterHeight());
    } else if (searchResultOffset < scrollTop) {
      this.searchResults.scrollTo(searchResultOffset);
    }

    return this;
  }

  /**
   * Initializes the Searcher by setting up the event listeners and closing the search result element.
   *
   * @returns {Searcher} This.
   */
  initialize() {
    this.inputElement
        .addEventListener('blur', this._handleBlurEvent)
        .addEventListener('click', this._handleClickEvent)
        .addEventListener('input', this._handleInputEvent)
        .addEventListener('keyup', this._handleKeyUpEvent)
        .addEventListener('keydown', this._handleKeyDownEvent)
        .addEventListener('focus', this._handleFocusEvent);

    this.closeSearchResults();
    return this;
  }

  /**
   * @returns {boolean} True if the search results add custom option is being displayed currently.
   */
  isCustomAddVisible() {
    return this.searchResults.queryFirst('.custom-add') !== null;
  }

  /**
   * @returns {boolean} True if any search results are being displayed currently.
   */
  isSearchResultsVisible() {
    return this.searchResults.hasClass('open');
  }

  /**
   * Poor mans resizing of the input field as the user types into it.
   */
  resizeInput() {
    const text = this.inputElement.getValue() === '' ? this.inputElement.getAttribute('placeholder') : this.inputElement.getValue();
    const newLength = Utils.calculateTextLength(this.inputElement, text) + 35;
    this.inputElement.setWidth(newLength);
  }

  /**
   * Executes a search by optionally updating the input to the given value (if specified) and then rebuilding the search
   * results using the input's value. This method also puts focus on the input and shows the search results (in case
   * they are hidden for any reason).
   *
   * @param {string} [searchText] The text to search for (this value is also set into the input box). If this is not
   * specified then the search is run using the input's value.
   * @returns {Searcher} This Searcher.
   */
  search(searchText) {
    // Set the search text into the input box if it is different and then lowercase it
    if (Utils.isDefined(searchText) && this.inputElement.getValue() !== searchText) {
      this.inputElement.setValue(searchText);
    }

    searchText = Utils.isDefined(searchText) ? searchText.toLowerCase() : this.inputElement.getValue();
    this.resizeInput();

    // Clear the search results (if there are any)
    this._removeAllSearchResults();

    // Call the callback
    const searchResults = this.options.callbackObject.search(searchText);
    if (!searchResults.hasOwnProperty('results') || !searchResults.hasOwnProperty('tooManyResults')) {
      throw new TypeError('The callback must return an Object that contains the properties results[Array] and tooManyResults[boolean]');
    }

    let count = 0;
    let matchingSearchResultElement = null;
    for (let i = 0; i < searchResults.results.length; i++) {
      const searchResult = searchResults.results[i];
      const element = PrimeDocument.newElement('<li/>')
          .addClass('search-result')
          .setAttribute('value', searchResult)
          .setHTML(searchResult)
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('mouseover', this._handleMouseOverEvent)
          .appendTo(this.searchResults);
      if (searchResult.toLowerCase().trim() === searchText.toLowerCase().trim()) {
        matchingSearchResultElement = element;
      }

      count++;
    }

    // Show the custom add option if necessary
    const trimmedLength = searchText.trim().length;
    if (this.options.customAddEnabled && trimmedLength !== 0 && matchingSearchResultElement === null
        && (!('doesNotContainValue' in this.options.callbackObject) || this.options.callbackObject.doesNotContainValue(searchText))) {
      matchingSearchResultElement = PrimeDocument.newElement('<li/>')
          .addClass('custom-add')
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('mouseover', this._handleMouseOverEvent)
          .setHTML(this.options.customAddLabel + Utils.escapeHTML(searchText))
          .appendTo(this.searchResults);
      count++;
    }

    if (count === 0 && trimmedLength !== 0) {
      PrimeDocument.newElement('<li/>')
          .addClass('no-search-results')
          .setHTML(this.options.noSearchResultsLabel + Utils.escapeHTML(searchText))
          .appendTo(this.searchResults);
      count++;
    }

    // Handle too many results
    if (searchResults.tooManyResults) {
      PrimeDocument.newElement('<li/>')
          .addClass('too-many-search-results')
          .setHTML(this.options.tooManySearchResultsLabel + Utils.escapeHTML(searchText))
          .appendTo(this.searchResults);
      count++;
    }

    if (count !== 0) {
      this.searchResults.show();
      this.searchResults.addClass('open');

      if (count >= 10) {
        this.searchResults.setHeight(this.searchResults.getChildren()[0].getOuterHeight() * 10 + 1);
      } else {
        this.searchResults.setHeight(this.searchResults.getChildren()[0].getOuterHeight() * count + 1);
      }
    } else {
      this.closeSearchResults();
    }

    if (matchingSearchResultElement !== null) {
      this.highlightSearchResult(matchingSearchResultElement);
    }

    return this;
  }

  /**
   * Selects the highlighted search result unless there isn't one highlighted, in which case, this does nothing.
   *
   * @returns {Searcher} This Searcher.
   */
  selectHighlightedSearchResult() {
    const searchResult = this.getHighlightedSearchResult();
    if (searchResult === null) {
      return this;
    }

    const custom = searchResult.hasClass('custom-add');
    const value = (custom) ? this.inputElement.getValue().trim() : searchResult.getHTML();
    if (custom) {
      // The client of this searcher needs to warn the user.
      if (!this.options.customAddCallback(value)) {
        return this;
      }
    }

    this.options.callbackObject.selectSearchResult(value);
    this.closeSearchResults();

    return this;
  }

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Searcher} This.
   */
  withCloseTimeout(timeout) {
    this.options.closeTimeout = timeout;
    return this;
  }

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {boolean} enabled The flag.
   * @returns {Searcher} This Searcher.
   */
  withCustomAddEnabled(enabled) {
    this.options.customAddEnabled = enabled;
    return this;
  }

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {Function} callback The function to call that will return true if the custom option can be added.
   * @returns {Searcher} This Searcher.
   */
  withCustomAddCallback(callback) {
    this.options.customAddCallback = callback;
    return this;
  }

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {Searcher} This Searcher.
   */
  withCustomAddLabel(customAddLabel) {
    this.options.customAddLabel = customAddLabel;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Searcher} This.
   */
  withOptions(options) {
    if (!Utils.isDefined(options)) {
      return this;
    }

    for (let option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
    return this;
  }

  /**
   * Sets the label that is printed when there are no search results.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {Searcher} This Searcher.
   */
  withNoSearchResultsLabel(noSearchResultsLabel) {
    this.options.noSearchResultsLabel = noSearchResultsLabel;
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Sets the label that is printed when there are too many search results.
   *
   * @param {string} tooManySearchResultsLabel The label text.
   * @returns {Searcher} This Searcher.
   */
  withTooManySearchResultsLabel(tooManySearchResultsLabel) {
    this.options.tooManySearchResultsLabel = tooManySearchResultsLabel;
    return this;
  }

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  _handleBlurEvent() {
    window.setTimeout((function() {
      if (document.activeElement !== this.inputElement.domElement) {
        this.closeSearchResults();
      }
    }).bind(this), 300);
  }

  /**
   * Handles all click events sent to the Searcher.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent(event) {
    const target = new PrimeElement(event.currentTarget);
    if (target.hasClass('custom-add') || target.hasClass('search-result')) {
      this.selectHighlightedSearchResult();
    } else if (target.domElement === this.inputElement.domElement) {
      this.search();
    } else {
      console.log('Clicked something else target=[' + event.target + '] currentTarget=[' + event.currentTarget + ']');
    }
  }

  /**
   * Handles when the input field is focused by opening the search results.
   *
   * @private
   */
  _handleFocusEvent() {
    this.search();
  }

  /**
   * Handle when we get new input in the field
   *
   * @private
   */
  _handleInputEvent() {
    this.search();
  }

  /**
   * Handles the key down events that should not be propagated.
   *
   * @param {KeyboardEvent} event The keyboard event object.
   * @private
   */
  _handleKeyDownEvent(event) {
    const key = event.keyCode;
    if (key === Events.Keys.BACKSPACE) {
      this.previousSearchString = this.inputElement.getValue();
    } else if (key === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      this.highlightPreviousSearchResult();
    } else if (key === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      if (this.isSearchResultsVisible()) {
        this.highlightNextSearchResult();
      } else {
        this.search();
      }
    } else if (key === Events.Keys.ENTER) {
      Utils.stopEvent(event); // Don't bubble enter otherwise the form submits
    } else if (key === Events.Keys.TAB && this.isSearchResultsVisible()) {
      Utils.stopEvent(event); // Don't bubble tab otherwise value lost on tab focus
    }
  }

  /**
   * Handles all key up events sent to the search results container.
   *
   * @param {KeyboardEvent} event The keyboard event object.
   *  @private
   */
  _handleKeyUpEvent(event) {
    const key = event.keyCode;
    const value = this.inputElement.getValue();

    if (key === Events.Keys.BACKSPACE) {
      if (value === '' && this.previousSearchString === '') {
        this.options.callbackObject.deletedBeyondSearchInput();
      } else {
        this.search();
      }
    } else if (key === Events.Keys.ENTER) {
      Utils.stopEvent(event);
      // If a search result is highlighted, add it
      if (this.getHighlightedSearchResult() !== null) {
        this.selectHighlightedSearchResult();
      }
    } else if (key === Events.Keys.ESCAPE) {
      this.closeSearchResults();
    } else if (key === Events.Keys.TAB && this.getHighlightedSearchResult() !== null) {
      // don't advance form field focus and add search result
      Utils.stopEvent(event);
      this.selectHighlightedSearchResult();
    }
  }

  /**
   * Handles mouseover events for the search results (only) by highlighting the event target.
   *
   * @param {Event} event The mouseover event.
   * @private
   */
  _handleMouseOverEvent(event) {
    const target = new PrimeElement(event.currentTarget);
    this.highlightSearchResult(target);
  }

  /**
   * Removes all of the search results.
   *
   * @private
   */
  _removeAllSearchResults() {
    this.searchResults.query('li').removeAllFromDOM();
  }

  /* ===================================================================================================================
   * Search function implementations.
   * ===================================================================================================================*/

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions(callbackObject) {
    // Defaults
    this.options = {
      callbackObject: callbackObject,
      closeTimeout: 200,
      customAddEnabled: true,
      'customAddCallback'() {
        return true;
      },
      customAddLabel: 'Add Custom: ',
      noSearchResultsLabel: 'No Matches For: ',
      tooManySearchResultsLabel: 'Too Many Matches For: ',
    };

    const userOptions = Utils.dataSetToOptions(this.inputElement);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {Searcher};