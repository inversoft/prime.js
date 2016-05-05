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
 * Constructs a PhraseBuilder object for the given element.
 *
 * The PhraseBuilder uses a callback function (and optional context) to build a set of search results. The user can then
 * select one of those search results and add it to their phrase. A fully rendered PhraseBuilder might look something
 * like this:
 *
 * <pre>
 * &lt;select id="foo">
 *   &lt;option value="one">One&lt;/option>
 *   &lt;option value="two">Two&lt;/option>
 *   &lt;option value="three">Three&lt;/option>
 * &lt;/select>
 * &lt;div id="foo-display" class="prime-phrase-builder-display">
 *   &lt;ul id="foo-option-list" class="prime-phrase-builder-option-list">
 *     &lt;li id="foo-option-one" class="prime-phrase-builder-option">&lt;span>One&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-two" class="prime-phrase-builder-option">&lt;span>Two&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li id="foo-option-three" class="prime-phrase-builder-option">&lt;span>Three&lt;/span>&lt;a href="#">X&lt;/a>&lt;/li>
 *     &lt;li class="prime-phrase-builder-input-option">&lt;input type="text" class="prime-phrase-builder-input" value="F"/>&lt;/li>
 *   &lt;/ul>
 *   &lt;ul class="prime-phrase-builder-search-result-list">
 *     &lt;li class="prime-phrase-builder-search-result">Four&lt;/li>
 *     &lt;li class="prime-phrase-builder-search-result">Five&lt;/li>
 *     &lt;li class="prime-phrase-builder-search-result">Fifteen&lt;/li>
 *     &lt;li class="prime-phrase-builder-add-custom">Add Custom Entry: F/li>
 *   &lt;/ul>
 * &lt;/div>
 * </pore>
 *
 * The with* methods can be used to setup the configuration for this PhraseBuilder, but here are some defaults:
 *
 * <ul>
 *   <li>placeholder = "Choose"</li>
 *   <li>customAddCallback = no-op</li>
 *   <li>customAddLabel = "Add Custom Value:"</li>
 *   <li>noSearchResultsLabel = "No Matches For:"</li>
 * </ul>
 *
 * @constructor
 * @param {Function} searchCallback The callback function used for searching.
 * @param {*} [callbackContext] THe optional context used when invoking the callback function.
 * @param {Prime.Document.Element} element The Prime Element for the PhraseBuilder.
 */
Prime.Widgets.PhraseBuilder = function(element, searchCallback, callbackContext) {
  this.customAddEnabled = false;
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widgets.PhraseBuilder with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widgets.PhraseBuilder must have the multiple="multiple" attribute set');
  }

  this.element.hide();

  var theContext = (arguments.length < 3) ? this : callbackContext;
  this.searchCallback = Prime.Utils.proxy(searchCallback, theContext);

  var id = this.element.getID();
  if (id === null || id === '') {
    id = 'prime-phrase-builder' + Prime.Widgets.PhraseBuilder.count++;
    this.element.setID(id);
  }

  this.placeholder = 'Type Words for Phrase Here';

  this.displayContainer = Prime.Document.queryByID(id + '-display');
  this.input = null;
  if (this.displayContainer === null) {
    this.displayContainer = Prime.Document.newElement('<div/>').
        setID(id + '-display').
        addClass('prime-phrase-builder-display').
        addEventListener('click', this._handleClickEvent, this).
        addEventListener('keyup', this._handleKeyUpEvent, this).
        insertAfter(this.element);

    this.displayContainerSelectedOptionList = Prime.Document.newElement('<ul/>').
        addClass('prime-phrase-builder-option-list').
        appendTo(this.displayContainer);

    this.searchResultsContainer = Prime.Document.newElement('<ul/>').
        addClass('prime-phrase-builder-search-result-list').
        hide().
        appendTo(this.displayContainer);
  } else {
    this.displayContainer.
        removeAllEventListeners().
        addEventListener('click', this._handleClickEvent, this).
        addEventListener('keyup', this._handleKeyUpEvent, this);
    this.displayContainerSelectedOptionList = Prime.Document.queryFirst('.prime-phrase-builder-option-list', this.displayContainer);
    this.searchResultsContainer = Prime.Document.queryFirst('.prime-phrase-builder-search-result-list', this.displayContainer);
  }

  Prime.Document.queryFirst('html').addEventListener('click', this._handleGlobalClickEvent, this);
};

/*
 * Statics
 */
Prime.Widgets.PhraseBuilder.count = 1;

Prime.Widgets.PhraseBuilder.prototype = {
  /**
   * Adds the given word to the phrase by adding an option to the backing select and adding the word to the display.
   * This also closes the search if it is open.
   *
   * @param {String} word The word to add.
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  addWord: function(word) {
    if (this.containsWord(word)) {
      return this;
    }

    var option = Prime.Document.newElement('<option/>').
        setValue(word).
        setHTML(word).
        setAttribute('selected', 'selected').
        setDataAttribute('display-id', '' + Math.random() + 1).
        appendTo(this.element);

    this._addSelectedOptionToDisplay(option);

    // Remove the placeholder attribute on the input
    this.input.removeAttribute('placeholder');

    // Close the search results
    this.searcher.closeSearchResults();

    // Scroll the display to the bottom
    this.displayContainerSelectedOptionList.scrollToBottom();

    return this;
  },

  /**
   * Determines if this PhraseBuilder contains the given word.
   *
   * @param {string} word The word to look for.
   */
  containsWord: function(word) {
    return this._findOptionForWord(word) !== null;
  },

  /**
   * @returns {string[]} The words in the phrase.
   */
  getWords: function() {
    return this.element.getSelectedValues();
  },

  /**
   * Highlights the last word in the phrase (if there is one) to indicate that it will be removed if the user clicks the
   * delete key again.
   *
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  highlightWordForRemoval: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    if (options.length > 1) {
      options[options.length - 2].addClass('prime-phrase-builder-option-highlighted');
    }

    return this;
  },

  /**
   * @returns {boolean} True if the last word is highlighted for removal.
   */
  isLastWordHighlightedForRemoval: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    return options.length > 1 && options[options.length - 2].hasClass('prime-phrase-builder-option-highlighted');
  },

  /**
   * Removes all of the words in the phrase.
   *
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  removeAllWords: function() {
    // Remove in reverse order because the options array is dynamically updated when elements are deleted from the DOM
    var options = this.element.domElement.options;
    for (var i = options.length - 1; i >= 0; i--) {
      this.removeWord(new Prime.Document.Element(options[i]).getTextContent());
    }

    return this;
  },

  /**
   * Removes the highlighted option.
   */
  removeHighlightedWord: function() {
    var options = this.displayContainerSelectedOptionList.getChildren();
    this.removeWord(options[options.length - 2].getAttribute('value'));
  },

  /**
   * Removes the given word from the phrase. This removes the option from the select and from the display.
   *
   * @param {string} word The word to remove.
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  removeWord: function(word) {
    var option = this._findOptionForWord(word);
    if (option === null) {
      return this;
    }

    option.removeFromDOM();

    var id = this._makeOptionID(option);
    var displayOption = Prime.Document.queryByID(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    // If there are no selected options left, add back the placeholder attribute to the input and resize it
    if (Prime.Document.query('.prime-phrase-builder-option', this.displayContainerSelectedOptionList).length === 0) {
      this.input.setAttribute('placeholder', this.placeholder);
      this.searcher.resizeInput();
    }

    return this;
  },

  /**
   * Rebuilds the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  render: function() {
    // Remove the currently displayed options
    this.displayContainerSelectedOptionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    this.inputOption = Prime.Document.newElement('<li/>').
        addClass('prime-phrase-builder-input-option').
        appendTo(this.displayContainerSelectedOptionList);
    this.input = Prime.Document.newElement('<input/>').
        addClass('prime-phrase-builder-input').
        setAttribute('type', 'text').
        appendTo(this.inputOption);
    this.searcher = new Prime.Widgets.Searcher(this.input, this.searchResultsContainer, this)
        .withCustomAddEnabled(this.customAddEnabled);
    if (this.customAddEnabled) {
      this.searcher.withCustomAddCallback(this.customAddCallback);
    }

    // Add the selected options
    for (var i = 0; i < this.element.domElement.length; i++) {
      var option = new Prime.Document.Element(this.element.domElement.options[i]).
          setAttribute('selected', 'selected');
      this._addSelectedOptionToDisplay(option);
    }

    // Put the placeholder attribute in if the PhraseBuilder has no selected options
    if (this.element.domElement.length === 0) {
      this.input.setAttribute('placeholder', this.placeholder);
    }

    // This closes the search results and resizes everything inside it
    this.searcher.closeSearchResults();

    return this;
  },

  /**
   * Unhighlights the last option if it is highlighted.
   *
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  unhighlightWordForRemoval: function() {
    this.displayContainerSelectedOptionList.getChildren().each(function(element) {
      element.removeClass('prime-phrase-builder-option-highlighted');
    });
    return this;
  },

  /**
   * Sets the placeholder text for this PhraseBuilder. This must be called before render is called.
   *
   * @param {string} placeholder The placeholder text.
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  withPlaceholder: function(placeholder) {
    this.placeholder = placeholder;
    return this;
  },

  /**
   * Sets whether or not this Searcher allows custom options to be added and, optionally, a callback function.
   *
   * @param {function} callback The function to call that will return true if the custom option can be added. Default: function(abc){return true;}
   * @param {object} theContext The context of the callback method, MUST be supplied if callback is supplied
   * @returns {Prime.Widgets.PhraseBuilder} This PhraseBuilder.
   */
  withCustomAdd: function(callback, theContext) {
    this.customAddEnabled = true;
    if (callback === 'undefined') {
      this.customAddCallback = function(abc) {
        return true;
      };
    } else {
      this.customAddCallback = Prime.Utils.proxy(callback, theContext);
    }
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
    if (this.isLastWordHighlightedForRemoval()) {
      this.removeHighlightedWord();
    }

    this.highlightWordForRemoval();
  },

  /**
   * Called when the Searcher is executing a search. This executes a search via the callback and returns the results.
   *
   * @param {string} [searchText] The text to search for.
   * @returns The SearchResults.
   */
  search: function(searchText) {
    this.unhighlightWordForRemoval();
    return this.searchCallback(searchText, this.getWords());
  },

  /**
   * Called when the Searcher gets an event that causes a search result to be selected. This adds the word.
   */
  selectSearchResult: function(value) {
    this.addWord(value);
  },


  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Adds the given selected option to the display.
   *
   * @param {Prime.Document.Element} option The option.
   * @private
   */
  _addSelectedOptionToDisplay: function(option) {
    var id = this._makeOptionID(option);

    // Check if the option has already been selected
    if (Prime.Document.queryByID(id) === null) {
      var li = Prime.Document.newElement('<li/>').
          addClass('prime-phrase-builder-option').
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
          addClass('prime-phrase-builder-remove-option').
          setHTML('X').
          addEventListener('click', this._handleClickEvent, this).
          appendTo(li);
    }
  },

  /**
   * Finds the HTMLSelectOption for the given word in the phrase and returns it wrapped in a Prime.Document.Element.
   *
   * @param {string} word The word to look for.
   * @returns {Prime.Document.Element} The option element or null.
   * @private
   */
  _findOptionForWord: function(word) {
    var options = this.element.getOptions();
    for (var i = 0; i < options.length; i++) {
      if (options[i].getTextContent() === word) {
        return options[i];
      }
    }

    return null;
  },

  /**
   * Handles all click events sent to the PhraseBuilder.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleClickEvent: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    if (this.displayContainer.domElement === target.domElement) {
      this.searcher.focus();
    } else if (target.hasClass('prime-phrase-builder-remove-option')) {
      this.removeWord(target.getAttribute('value'));
    } else {
      console.log('Clicked something else target=[' + event.target + '] currentTarget=[' + event.currentTarget + ']');
    }

    return false;
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
   * Handles mouse clicks outside of this PhraseBuilder. If they clicked anything that is not within this PhraseBuilder,
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

    return true;
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
      this.unhighlightWordForRemoval();
    }

    return true;
  },

  /**
   * Makes an ID for the option.
   *
   * @param {Prime.Document.Element} option The option to make the ID for.
   * @private
   */
  _makeOptionID: function(option) {
    var id = option.getDataAttribute('displayId');
    return id !== null ? id : this.element.getID() + '-option-' + option.getValue().replace(' ', '-');
  }
};