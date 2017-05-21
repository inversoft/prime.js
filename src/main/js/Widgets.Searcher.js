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
 * @param {Prime.Document.Element|Element|EventTarget} inputElement The input element that is used to execute the search.
 * @param {Prime.Document.Element|Element|EventTarget} searchResultsContainer The element that is used to store the search results.
 * @param {*} callbackObject The object that is used to callback for searching and numerous other functions to help
 *            communicate state and determine how to draw the input and search results.
 */
Prime.Widgets.Searcher = function(inputElement, searchResultsContainer, callbackObject) {
  Prime.Utils.bindAll(this);

  this.searchResults = Prime.Document.Element.wrap(searchResultsContainer);
  this.inputElement = Prime.Document.Element.wrap(inputElement);
  if (this.inputElement.domElement.tagName !== 'INPUT') {
    throw new TypeError('You can only use Prime.Widgets.SearchResults with INPUT elements');
  }

  this._setInitialOptions(callbackObject);
};


Prime.Widgets.Searcher.prototype = {
  /**
   * Closes the search results display, unhighlights any options that are highlighted and resets the input's value to
   * empty string.
   */
  closeSearchResults: function() {
    this._removeAllSearchResults();
    this.inputElement.setValue('');
    this.searchResults.removeClass('open');
    setTimeout(function() {
      this.searchResults.hide();
      this.resizeInput();
    }.bind(this), this.options['closeTimeout']);
  },

  /**
   * Removes all of the event listeners from the input element.
   */
  destroy: function() {
    this.inputElement
        .removeEventListener('blur', this._handleBlurEvent)
        .removeEventListener('click', this._handleClickEvent)
        .removeEventListener('keyup', this._handleKeyUpEvent)
        .removeEventListener('keydown', this._handleKeyDownEvent)
        .removeEventListener('focus', this._handleFocusEvent);
  },

  focus: function() {
    this.inputElement.focus();
  },

  /**
   * @returns {Prime.Document.Element} The highlighted search result or null.
   */
  getHighlightedSearchResult: function() {
    return this.searchResults.queryFirst('.selected');
  },

  /**
   * Highlights the next search result if one is highlighted. If there isn't a highlighted search result, this
   * highlights the first one. This method handles wrapping.
   *
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  highlightNextSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
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
  },

  /**
   * Highlights the previous search result if one is highlighted. If there isn't a highlighted search result, this
   * selects the last one. This method handles wrapping.
   *
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  highlightPreviousSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
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
  },

  /**
   * Highlights the given search result.
   *
   * @param {Prime.Document.Element} searchResult The search result to highlight.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  highlightSearchResult: function(searchResult) {
    this.searchResults.getChildren().each(function(e) {
      e.removeClass('selected');
    });

    searchResult.addClass('selected');
    var scrollTop = this.searchResults.getScrollTop();
    var height = this.searchResults.getHeight();
    var searchResultOffset = searchResult.getOffsetTop();
    if (searchResultOffset + 1 >= scrollTop + height) {
      this.searchResults.scrollTo(searchResult.getOffsetTop() - this.searchResults.getHeight() + searchResult.getOuterHeight());
    } else if (searchResultOffset < scrollTop) {
      this.searchResults.scrollTo(searchResultOffset);
    }

    return this;
  },

  /**
   * Initializes the Searcher by setting up the event listeners and closing the search result element.
   *
   * @returns {Prime.Widgets.Searcher} This.
   */
  initialize: function() {
    this.inputElement
        .addEventListener('blur', this._handleBlurEvent)
        .addEventListener('click', this._handleClickEvent)
        .addEventListener('keyup', this._handleKeyUpEvent)
        .addEventListener('keydown', this._handleKeyDownEvent)
        .addEventListener('focus', this._handleFocusEvent);

    this.closeSearchResults();
    return this;
  },

  /**
   * @returns {boolean} True if the search results add custom option is being displayed currently.
   */
  isCustomAddVisible: function() {
    return this.searchResults.queryFirst('input') !== null;
  },

  /**
   * @returns {boolean} True if any search results are being displayed currently.
   */
  isSearchResultsVisible: function() {
    return this.searchResults.isVisible();
  },

  /**
   * Poor mans resizing of the input field as the user types into it.
   */
  resizeInput: function() {
    var text = this.inputElement.getValue() === '' ? this.inputElement.getAttribute('placeholder') : this.inputElement.getValue();
    var newLength = Prime.Utils.calculateTextLength(this.inputElement, text) + 35;
    this.inputElement.setWidth(newLength);
  },

  /**
   * Executes a search by optionally updating the input to the given value (if specified) and then rebuilding the search
   * results using the input's value. This method also puts focus on the input and shows the search results (in case
   * they are hidden for any reason).
   *
   * @param {string} [searchText] The text to search for (this value is also set into the input box). If this is not
   * specified then the search is run using the input's value.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  search: function(searchText) {
    // Set the search text into the input box if it is different and then lowercase it
    if (Prime.Utils.isDefined(searchText) && this.inputElement.getValue() !== searchText) {
      this.inputElement.setValue(searchText);
    }

    searchText = Prime.Utils.isDefined(searchText) ? searchText.toLowerCase() : this.inputElement.getValue();
    this.resizeInput();

    // Clear the search results (if there are any)
    this._removeAllSearchResults();

    // Call the callback
    var searchResults = this.options['callbackObject'].search(searchText);
    if (!searchResults.hasOwnProperty('results') || !searchResults.hasOwnProperty('tooManyResults')) {
      throw new TypeError('The callback must return an Object that contains the properties results[Array] and tooManyResults[boolean]');
    }

    var count = 0;
    var matchingSearchResultElement = null;
    for (var i = 0; i < searchResults.results.length; i++) {
      var searchResult = searchResults.results[i];
      var element = Prime.Document.newElement('<li/>')
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
    var trimmedLength = searchText.trim().length;
    if (this.options['customAddEnabled'] && trimmedLength !== 0 && matchingSearchResultElement === null
        && ( !('doesNotContainValue' in this.options['callbackObject']) || this.options['callbackObject'].doesNotContainValue(searchText))) {
      matchingSearchResultElement = Prime.Document.newElement('<li/>')
          .addClass('custom-add')
          .addEventListener('click', this._handleClickEvent)
          .addEventListener('mouseover', this._handleMouseOverEvent)
          .setHTML(this.options['customAddLabel'] + searchText)
          .appendTo(this.searchResults);
      count++;
    }

    if (count === 0 && trimmedLength !== 0) {
      Prime.Document.newElement('<li/>')
          .addClass('no-search-results')
          .setHTML(this.options['noSearchResultsLabel'] + searchText)
          .appendTo(this.searchResults);
      count++;
    }

    // Handle too many results
    if (searchResults.tooManyResults) {
      Prime.Document.newElement('<li/>')
          .addClass('too-many-search-results')
          .setHTML(this.options['tooManySearchResultsLabel'] + searchText)
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
  },

  /**
   * Selects the highlighted search result unless there isn't one highlighted, in which case, this does nothing.
   *
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  selectHighlightedSearchResult: function() {
    var searchResult = this.getHighlightedSearchResult();
    if (searchResult === null) {
      return this;
    }

    var custom = searchResult.hasClass('custom-add');
    var value = (custom) ? this.inputElement.getValue().trim() : searchResult.getHTML();
    if (custom) {
      // The client of this searcher needs to warn the user.
      if (!this.options['customAddCallback'](value)) {
        return this;
      }
    }

    this.options['callbackObject'].selectSearchResult(value);
    this.closeSearchResults();

    return this;
  },

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Prime.Widgets.Searcher} This.
   */
  withCloseTimeout: function(timeout) {
    this.options['closeTimeout'] = timeout;
    return this;
  },

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {boolean} enabled The flag.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddEnabled: function(enabled) {
    this.options['customAddEnabled'] = enabled;
    return this;
  },

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {Function} callback The function to call that will return true if the custom option can be added.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddCallback: function(callback) {
    this.options['customAddCallback'] = callback;
    return this;
  },

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddLabel: function(customAddLabel) {
    this.options['customAddLabel'] = customAddLabel;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.Searcher} This.
   */
  withOptions: function(options) {
    if (!Prime.Utils.isDefined(options)) {
      return this;
    }

    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
    return this;
  },

  /**
   * Sets the label that is printed when there are no search results.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withNoSearchResultsLabel: function(noSearchResultsLabel) {
    this.options['noSearchResultsLabel'] = noSearchResultsLabel;
    return this;
  },

  /**
   * Sets the label that is printed when there are too many search results.
   *
   * @param {string} tooManySearchResultsLabel The label text.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withTooManySearchResultsLabel: function(tooManySearchResultsLabel) {
    this.options['tooManySearchResultsLabel'] = tooManySearchResultsLabel;
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handles the blur event when the input goes out of focus.
   *
   * @private
   */
  _handleBlurEvent: function() {
    window.setTimeout((function() {
      if (document.activeElement !== this.inputElement.domElement) {
        this.closeSearchResults();
      }
    }).bind(this), 300);
  },

  /**
   * Handles all click events sent to the Searcher.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    if (target.hasClass('add-custom') || target.hasClass('search-result')) {
      this.selectHighlightedSearchResult();
    } else if (target.domElement === this.inputElement.domElement) {
      this.search();
    } else {
      console.log('Clicked something else target=[' + event.target + '] currentTarget=[' + event.currentTarget + ']');
    }
  },

  /**
   * Handles when the input field is focused by opening the search results.
   *
   * @private
   */
  _handleFocusEvent: function() {
    this.search();
  },

  /**
   * Handles the key down events that should not be propagated.
   *
   * @param {KeyboardEvent} event The keyboard event object.
   * @private
   */
  _handleKeyDownEvent: function(event) {
    var key = event.keyCode;
    if (key === Prime.Events.Keys.BACKSPACE) {
      this.previousSearchString = this.inputElement.getValue();
    } else if (key === Prime.Events.Keys.UP_ARROW) {
      this.highlightPreviousSearchResult();
      Prime.Utils.stopEvent(event);
    } else if (key === Prime.Events.Keys.DOWN_ARROW) {
      if (this.isSearchResultsVisible()) {
        this.highlightNextSearchResult();
      } else {
        this.search();
      }

      Prime.Utils.stopEvent(event);
    } else if (key === Prime.Events.Keys.ENTER) {
      Prime.Utils.stopEvent(event); // Don't bubble enter otherwise the form submits
    }
  },

  /**
   * Handles all key up events sent to the search results container.
   *
   * @param {KeyboardEvent} event The keyboard event object.
   *  @private
   */
  _handleKeyUpEvent: function(event) {
    var key = event.keyCode;
    var value = this.inputElement.getValue();

    if (key === Prime.Events.Keys.BACKSPACE) {
      if (value === '' && this.previousSearchString === '') {
        this.options['callbackObject'].deletedBeyondSearchInput();
      } else {
        this.search();
      }
    } else if (key === Prime.Events.Keys.ENTER) {
      // If a search result is highlighted, add it
      if (this.getHighlightedSearchResult() !== null) {
        this.selectHighlightedSearchResult();
      }

      Prime.Utils.stopEvent(event);
    } else if (key === Prime.Events.Keys.ESCAPE) {
      this.closeSearchResults();
    } else if (key === Prime.Events.Keys.SPACE || key === Prime.Events.Keys.DELETE ||
        (key >= 48 && key <= 90) || (key >= 96 && key <= 111) || (key >= 186 && key <= 192) || (key >= 219 && key <= 222)) {
      this.search();
    }
  },

  /**
   * Handles mouseover events for the search results (only) by highlighting the event target.
   *
   * @param {Event} event The mouseover event.
   * @private
   */
  _handleMouseOverEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    this.highlightSearchResult(target);
  },

  /**
   * Removes all of the search results.
   *
   * @private
   */
  _removeAllSearchResults: function() {
    this.searchResults.query('li').removeAllFromDOM();
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function(callbackObject) {
    // Defaults
    this.options = {
      'callbackObject': callbackObject,
      'closeTimeout': 200,
      'customAddEnabled': true,
      'customAddCallback': function() {
        return true;
      },
      'customAddLabel': 'Add Custom: ',
      'noSearchResultsLabel': 'No Matches For: ',
      'tooManySearchResultsLabel': 'Too Many Matches For: ',
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.inputElement);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};

/* ===================================================================================================================
 * Search function implementations.
 * ===================================================================================================================*/

/**
 * A search function that works on a select box.
 *
 * @param searchText {String} The search String.
 * @param select {HTMLSelectElement|Prime.Document.Element} The select box.
 * @returns {{results: Array, tooManyResults: boolean}}
 */
Prime.Widgets.Searcher.selectSearchFunction = function(searchText, select) {
  var options = Prime.Document.Element.unwrap(select).options;
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
};