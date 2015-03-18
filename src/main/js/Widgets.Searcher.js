/*
 * Copyright (c) 2014-2015, Inversoft Inc., All Rights Reserved
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
 *   &lt;ul class="prime-search-result-list">
 *     &lt;li class="prime-search-result">Four&lt;/li>
 *     &lt;li class="prime-search-result">Five&lt;/li>
 *     &lt;li class="prime-search-result">Fifteen&lt;/li>
 *     &lt;li class="prime-add-custom">Add Custom Entry: F/li>
 *   &lt;/ul>
 * &lt;/div>
 * </pre>
 *
 * The with* methods can be used to setup the configuration for this SearchResults, but here are some defaults:
 *
 * <ul>
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
 *     object{results:Array, tooManyResults:boolean} search(_searchString:string),
 *     void selectSearchResult(selectedSearchResult:string),
 *     void deletedBeyondSearchInput()
 *   }
 * </pre>
 *
 * @constructor
 * @param {Prime.Document.Element} inputElement The input element that is used to execute the search.
 * @param {Prime.Document.Element} searchResultsContainer The element that is used to store the search results.
 * @param {*} callbackObject The object that is used to callback for searching and numerous other functions to help
 *            communicate state and determine how to draw the input and search results.
 */
Prime.Widgets.Searcher = function(inputElement, searchResultsContainer, callbackObject) {
  this.inputElement = (inputElement instanceof Prime.Document.Element) ? inputElement : new Prime.Document.Element(inputElement);
  if (this.inputElement.domElement.tagName !== 'INPUT') {
    throw new TypeError('You can only use Prime.Widgets.SearchResults with INPUT elements');
  }
  this.inputElement.
      addClass('prime-searcher-input').
      addEventListener('blur', this._handleBlurEvent, this).
      addEventListener('click', this._handleClickEvent, this).
      addEventListener('keyup', this._handleKeyUpEvent, this).
      addEventListener('keydown', this._handleKeyDownEvent, this).
      addEventListener('focus', this._handleFocusEvent, this);

  this.searchResultsContainer = (searchResultsContainer instanceof Prime.Document.Element) ? searchResultsContainer : new Prime.Document.Element(searchResultsContainer);
  this.searchResultsContainer.addClass('prime-searcher-search-results-list');

  this.noSearchResultsLabel = 'No Matches For: ';
  this.tooManySearchResultsLabel = 'Too Many Matches For: ';
  this.customAddEnabled = true;
  this.customAddCallback = function(customValue) {return true;};
  this.customAddLabel = 'Add Custom: ';
  this.callbackObject = callbackObject;

  this.closeSearchResults();
};


Prime.Widgets.Searcher.prototype = {
  /**
   * Closes the search results display, unhighlights any options that are highlighted and resets the input's value to
   * empty string.
   */
  closeSearchResults: function() {
    this._removeAllSearchResults();
    this.searchResultsContainer.hide();
    this.inputElement.setValue('');
    this.resizeInput();
  },

  focus: function() {
    this.inputElement.focus();
  },

  /**
   * @returns {Prime.Document.Element} The highlighted search result or null.
   */
  getHighlightedSearchResult: function() {
    return Prime.Document.queryFirst('.prime-searcher-highlighted-search-result', this.searchResultsContainer);
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
      searchResult = Prime.Document.queryFirst('.prime-searcher-search-result', this.searchResultsContainer);
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
      searchResult = Prime.Document.queryLast('.prime-searcher-search-result', this.searchResultsContainer);
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
    this.searchResultsContainer.getChildren().each(function(element) {
      element.removeClass('prime-searcher-highlighted-search-result');
    });

    searchResult.addClass('prime-searcher-highlighted-search-result');
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
    return Prime.Document.queryFirst('.prime-searcher-add-custom', this.searchResultsContainer) !== null;
  },

  /**
   * @returns {boolean} True if any search results are being displayed currently.
   */
  isSearchResultsVisible: function() {
    return this.searchResultsContainer.isVisible();
  },

  /**
   * Poor mans resizing of the input field as the user types into it.
   */
  resizeInput: function() {
    var text = this.inputElement.getValue() === '' ? this.inputElement.getAttribute('placeholder') : this.inputElement.getValue();
    var newLength = Prime.Utils.calculateTextLength(this.inputElement, text) + 10;
    if (newLength < 25) {
      newLength = 25;
    }

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
    if (typeof(searchText) !== 'undefined' && this.inputElement.getValue() !== searchText) {
      this.inputElement.setValue(searchText);
    }

    searchText = typeof(searchText) !== 'undefined' ? searchText.toLowerCase() : this.inputElement.getValue();
    this.resizeInput();

    // Clear the search results (if there are any)
    this._removeAllSearchResults();

    // Call the callback
    var searchResults = this.callbackObject.search(searchText);
    if (!searchResults.hasOwnProperty('results') || !searchResults.hasOwnProperty('tooManyResults')) {
      throw new TypeError('The callback must return an Object that contains the properties results[Array] and tooManyResults[boolean]');
    }

    var count = 0;
    var matchingSearchResultElement = null;
    for (var i = 0; i < searchResults.results.length; i++) {
      var searchResult = searchResults.results[i];
      var element  = Prime.Document.newElement('<li/>').
          addClass('prime-searcher-search-result').
          setAttribute('value', searchResult).
          setHTML(searchResult).
          addEventListener('click', this._handleClickEvent, this).
          addEventListener('mouseover', this._handleMouseOverEvent, this).
          appendTo(this.searchResultsContainer);
      if (searchResult.toLowerCase().trim() === searchText.toLowerCase().trim()) {
        matchingSearchResultElement = element;
      }

      count++;
    }

    // Show the custom add option if necessary
    var trimmedLength = searchText.trim().length;
    if (this.customAddEnabled && trimmedLength !== 0 && matchingSearchResultElement === null
        && ( !('doesNotContainValue' in this.callbackObject) || this.callbackObject.doesNotContainValue(searchText))) {
      matchingSearchResultElement = Prime.Document.newElement('<li/>').
          addClass('prime-searcher-search-result prime-searcher-add-custom').
          addEventListener('click', this._handleClickEvent, this).
          addEventListener('mouseover', this._handleMouseOverEvent, this).
          setHTML(this.customAddLabel + searchText).
          appendTo(this.searchResultsContainer);
      count++;
    }

    if (count === 0 && trimmedLength !== 0) {
      Prime.Document.newElement('<li/>').
          addClass('prime-searcher-no-search-results').
          setHTML(this.noSearchResultsLabel + searchText).
          appendTo(this.searchResultsContainer);
      count++;
    }

    // Handle too many results
    if (searchResults.tooManyResults) {
      Prime.Document.newElement('<li/>').
          addClass('prime-searcher-too-many-search-results').
          setHTML(this.tooManySearchResultsLabel + searchText).
          appendTo(this.searchResultsContainer);
      count++;
    }

    if (count !== 0) {
      this.searchResultsContainer.show();

      if (count >= 10) {
        this.searchResultsContainer.setHeight(this.searchResultsContainer.getChildren()[0].getOuterHeight() * 10 + 1);
      } else {
        this.searchResultsContainer.setHeight(this.searchResultsContainer.getChildren()[0].getOuterHeight() * count + 1);
      }
    } else {
      this.searchResultsContainer.hide();
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

    var custom = searchResult.hasClass('prime-searcher-add-custom');
    var value = (custom) ? this.inputElement.getValue().trim() : searchResult.getHTML();
    if(custom) {
      // The client of this searcher needs to warn the user.
      if(!this.customAddCallback(value)) {
        return this;
      }
    }

    this.callbackObject.selectSearchResult(value);
    this.closeSearchResults();

    return this;
  },

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {string} enabled The flag.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddEnabled: function(enabled) {
    this.customAddEnabled = enabled;
    return this;
  },

  /**
   * Sets whether or not this Searcher allows custom options to be added.
   *
   * @param {function} callback The function to call that will return true if the custom option can be added.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddCallback: function(callback) {
    this.customAddCallback = callback;
    return this;
  },

  /**
   * Sets the label used when custom options are added.
   *
   * @param {string} customAddLabel The label.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withCustomAddLabel: function(customAddLabel) {
    this.customAddLabel = customAddLabel;
    return this;
  },

  /**
   * Sets the label that is printed when there are too many search results.
   *
   * @param {string} tooManySearchResultsLabel The label text.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withTooManySearchResultsLabel: function(tooManySearchResultsLabel) {
    this.tooManySearchResultsLabel = tooManySearchResultsLabel;
    return this;
  },

  /**
   * Sets the label that is printed when there are no search results.
   *
   * @param {string} noSearchResultsLabel The label text.
   * @returns {Prime.Widgets.Searcher} This Searcher.
   */
  withNoSearchResultsLabel: function(noSearchResultsLabel) {
    this.noSearchResultsLabel = noSearchResultsLabel;
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
    window.setTimeout(Prime.Utils.proxy(function() {
      if (document.activeElement !== this.inputElement.domElement) {
        this.closeSearchResults();
      }
    }, this), 300);
  },

  /**
   * Handles all click events sent to the Searcher.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    if (target.hasClass('prime-searcher-add-custom') || target.hasClass('prime-searcher-search-result')) {
      this.selectHighlightedSearchResult();
    } else if (target.domElement === this.inputElement.domElement) {
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
  _handleFocusEvent: function() {
    this.search();
  },

  /**
   * Handles the key down events that should not be propagated.
   *
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the event is not an arrow key.
   * @private
   */
  _handleKeyDownEvent: function(event) {
    var key = event.keyCode;
    if (key === Prime.Events.Keys.BACKSPACE) {
      this.previousSearchString = this.inputElement.getValue();
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
    } else if (key === Prime.Events.Keys.ENTER) {
      return false; // Don't bubble enter otherwise the form submits
    }

    return true;
  },

  /**
   * Handles all key up events sent to the search results container.
   *
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the search display is not open, false otherwise. This will prevent the event from continuing.
   *  @private
   */
  _handleKeyUpEvent: function(event) {
    var key = event.keyCode;
    var value = this.inputElement.getValue();

    if (key == Prime.Events.Keys.BACKSPACE) {
      if (value === '' && this.previousSearchString === '') {
        this.callbackObject.deletedBeyondSearchInput();
      } else {
        this.search();
      }
    } else if (key === Prime.Events.Keys.ENTER) {
      // If a search result is highlighted, add it
      if (this.getHighlightedSearchResult() !== null) {
        this.selectHighlightedSearchResult();
      }

      return false;
    } else if (key === Prime.Events.Keys.ESCAPE) {
      this.searchResultsContainer.hide();
    } else if (key === Prime.Events.Keys.SPACE || key === Prime.Events.Keys.DELETE ||
        (key >= 48 && key <= 90) || (key >= 96 && key <= 111) || (key >= 186 && key <= 192) || (key >= 219 && key <= 222)) {
      this.search();
    }

    return true;
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
    Prime.Document.query('li', this.searchResultsContainer).removeAllFromDOM();
  }
};
