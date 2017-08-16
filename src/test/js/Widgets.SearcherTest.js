/*
 * Copyright (c) 2012-2017, Inversoft Inc., All Rights Reserved
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

/*
 * Helper functions
 */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('Searcher class tests', {
  setUp: function() {
    // Define the callback interface
    this.searchResults = [];
    this.tooManyResults = false;
    this._searchString = null;
    this.selectedSearchResult = null;
    this.deletedBeyondSearchInput = false;
    this.search = function(searchString) {
      this._searchString = searchString;
      return {
        'results': this.searchResults,
        'tooManyResults': this.tooManyResults
      };
    };
    this.selectSearchResult = function(value) {
      this.selectedSearchResult = value;
    };
    this.deletedBeyondSearchInput = function() {
      this.deletedBeyondSearchInput = true;
    };
    this.doesNotContainValue = function(value) {
      return true;
    };

    this.searcherInput = Prime.Document.queryFirst('#searcher');
    this.searcherSearchResults = Prime.Document.queryFirst('#searcher-results');
    this.searcher = new Prime.Widgets.Searcher(this.searcherInput, this.searcherSearchResults, this).
        withCustomAddEnabled(true).
        withCustomAddLabel('Add New Value: ').
        withNoSearchResultsLabel('No Results: ').
        withTooManySearchResultsLabel('Too Much: ');

    this.searcherCustomAddDisabledInput = Prime.Document.queryFirst('#searcher-custom-add-disabled');
    this.searcherCustomAddDisabledSearchResults = Prime.Document.queryFirst('#searcher-custom-add-disabled-results');
    this.searcherCustomAddDisabled = new Prime.Widgets.Searcher(this.searcherCustomAddDisabledInput, this.searcherCustomAddDisabledSearchResults, this).
        withCustomAddEnabled(false).
        withNoSearchResultsLabel('No Results: ').
        withTooManySearchResultsLabel('Too Much: ');
  },

  'closeSearchResults': function() {
    // Execute a search
    this.searchResults.push('one');
    this.searchResults.push('two');
    this.searcher.search();
    this.searcher.closeSearchResults();

    var searchResultList = Prime.Document.queryFirst('#searcher-results');
    assert.isFalse(searchResultList.hasClass('open'));
    assert.equals(this.searcher.inputElement.getValue(), '');
  },

  "highlightNextSearchResult": function() {
    this.searchResults.push('one');
    this.searcher.search('o');
    this.searcher.highlightNextSearchResult();

    // Highlight one
    var searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('selected'));
    assert.isFalse(searchResults[1].hasClass('selected'));

    // Highlight the custom add option
    this.searcher.highlightNextSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('selected'));
    assert.isTrue(searchResults[1].hasClass('selected'));

    // Wrap
    this.searcher.highlightNextSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('selected'));
    assert.isFalse(searchResults[1].hasClass('selected'));

    // Get rid of the custom add option and highlight Two
    this.searcher.search('one');
    this.searcher.highlightNextSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('selected'));

    // This should keep Two highlighted
    this.searcher.highlightNextSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('selected'));
  },

  'highlightNextSearchResult custom add disabled': function() {
    this.searchResults.push('one');
    this.searchResults.push('open');
    this.searcherCustomAddDisabled.search('o'); // This will result in the search results having Two and Three shown

    // Highlight one
    this.searcherCustomAddDisabled.highlightNextSearchResult();
    var searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('selected'));
    assert.isFalse(searchResults[1].hasClass('selected'));

    // Highlight open
    this.searcherCustomAddDisabled.highlightNextSearchResult();
    searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('selected'));
    assert.isTrue(searchResults[1].hasClass('selected'));

    // Wrap
    this.searcherCustomAddDisabled.highlightNextSearchResult();
    searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('selected'));
    assert.isFalse(searchResults[1].hasClass('selected'));
  },

  "highlightPreviousSearchResult": function() {
    this.searchResults.push('one');
    this.searcher.search('o'); // Auto highlights the Add Custom option

    var searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('selected'));
    assert.isTrue(searchResults[1].hasClass('selected'));

    // Highlight one
    this.searcher.highlightPreviousSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('selected'));
    assert.isFalse(searchResults[1].hasClass('selected'));

    // Wrap
    this.searcher.highlightPreviousSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.equals(searchResults[0].getClass(), 'search-result selected');
    assert.equals(searchResults[1].getClass(), 'custom-add');

    // Get rid of the custom add option and highlight Two
    this.searcher.search('one');
    this.searcher.highlightPreviousSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 1);
    assert.equals(searchResults[0].getClass(), 'search-result selected');

    // This should keep Two highlighted
    this.searcher.highlightPreviousSearchResult();
    searchResults = this.searcherSearchResults.getChildren();
    assert.equals(searchResults.length, 1);
    assert.equals(searchResults[0].getClass(), 'search-result selected');
  },

  'highlightPreviousSearchResult custom add disabled': function() {
    this.searchResults.push('one');
    this.searchResults.push('open');
    this.searcherCustomAddDisabled.search('o');

    // Highlight one
    this.searcherCustomAddDisabled.highlightPreviousSearchResult();
    var searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.equals(searchResults[0].getClass(), 'search-result selected');
    assert.equals(searchResults[1].getClass(), 'search-result');

    // Highlight open
    this.searcherCustomAddDisabled.highlightPreviousSearchResult();
    searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.equals(searchResults[0].getClass(), 'search-result selected');
    assert.equals(searchResults[1].getClass(), 'search-result');

    // Wrap
    this.searcherCustomAddDisabled.highlightPreviousSearchResult();
    searchResults = this.searcherCustomAddDisabledSearchResults.getChildren();
    assert.equals(searchResults.length, 2);
    assert.equals(searchResults[0].getClass(), 'search-result selected');
    assert.equals(searchResults[1].getClass(), 'search-result');
  },

  'search': function() {
    // Execute a search
    this.searchResults.push('one');
    this.searcher.search('o');
    assert.isTrue(this.searcher.isSearchResultsVisible());
    assert.isTrue(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue(), 'o');
    assert.isTrue(this.searcherSearchResults.hasClass('open'));
    assert.equals(this.searcherSearchResults.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.searcherSearchResults.getChildren()[0].getClass(), 'search-result');
    assert.equals(this.searcherSearchResults.getChildren()[0].getHTML(), 'one');
    assert.equals(this.searcherSearchResults.getChildren()[1].getClass(), 'custom-add selected');
    assert.equals(this.searcherSearchResults.getChildren()[1].getHTML(), 'Add New Value: o');

    // Add a letter
    this.searcher.search('on');
    assert.isTrue(this.searcher.isSearchResultsVisible());
    assert.isTrue(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue(), 'on');
    assert.isTrue(this.searcherSearchResults.hasClass('open'));
    assert.equals(this.searcherSearchResults.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.searcherSearchResults.getChildren()[0].getClass(), 'search-result');
    assert.equals(this.searcherSearchResults.getChildren()[0].getHTML(), 'one');
    assert.equals(this.searcherSearchResults.getChildren()[1].getClass(), 'custom-add selected');
    assert.equals(this.searcherSearchResults.getChildren()[1].getHTML(), 'Add New Value: on');

    // Make the custom add option go away
    this.searcher.search('one');
    assert.isTrue(this.searcher.isSearchResultsVisible());
    assert.isFalse(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue(), 'one');
    assert.isTrue(this.searcherSearchResults.hasClass('open'));
    assert.equals(this.searcherSearchResults.getChildren().length, 1);
    assert.equals(this.searcherSearchResults.getChildren()[0].getClass(), 'search-result selected');
    assert.equals(this.searcherSearchResults.getChildren()[0].getHTML(), 'one');

    // Add a letter and simulate no search results
    this.searchResults = [];
    this.searcher.search('ones');
    assert.isTrue(this.searcher.isSearchResultsVisible());
    assert.isTrue(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue(), 'ones');
    assert.isTrue(this.searcherSearchResults.hasClass('open'));
    assert.equals(this.searcherSearchResults.getChildren().length, 1);
    assert.equals(this.searcherSearchResults.getChildren()[0].getClass(), 'custom-add selected');
    assert.equals(this.searcherSearchResults.getChildren()[0].getHTML(), 'Add New Value: ones');

    // Empty search
    this.searchResults.push('one');
    this.searcher.search('');
    assert.isTrue(this.searcher.isSearchResultsVisible());
    assert.isFalse(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue(), '');
    assert.isTrue(this.searcherSearchResults.hasClass('open'));
    assert.equals(this.searcherSearchResults.getChildren().length, 1);
    assert.equals(this.searcherSearchResults.getChildren()[0].getClass(), 'search-result');
    assert.equals(this.searcherSearchResults.getChildren()[0].getHTML(), 'one');

    // Whitespace search
    this.searchResults = [];
    this.searcher.search('   ');
    assert.isFalse(this.searcher.isSearchResultsVisible());
    assert.isFalse(this.searcher.isCustomAddVisible());
    assert.equals(this.searcherInput.getValue().length, 0);
    assert.equals(this.searcherInput.getValue(), '');
    assert.isFalse(this.searcherSearchResults.hasClass('open'));
  },

  'search custom add disabled': function() {
    // Search with no results
    this.searcherCustomAddDisabled.search('nothing');
    assert.isTrue(this.searcherCustomAddDisabled.isSearchResultsVisible());
    assert.isFalse(this.searcherCustomAddDisabled.isCustomAddVisible());
    assert.equals(this.searcherCustomAddDisabledInput.getValue(), 'nothing');
    assert.isTrue(this.searcherCustomAddDisabledSearchResults.isVisible());
    assert.equals(this.searcherCustomAddDisabledSearchResults.getChildren().length, 1);
    assert.equals(this.searcherCustomAddDisabledSearchResults.getChildren()[0].getClass(), 'no-search-results');
    assert.equals(this.searcherCustomAddDisabledSearchResults.getChildren()[0].getHTML(), 'No Results: nothing');
  },

  'selectHighlightedSearchResult': function() {
    this.searchResults.push('one');
    this.searcher.search('o');
    this.searcher.highlightNextSearchResult(); // Highlight one
    this.searcher.highlightNextSearchResult(); // Highlight the custom add

    // Add the custom option
    this.searcher.selectHighlightedSearchResult();
    assert.equals(this.selectedSearchResult, 'o');

    // Add a non-custom option
    this.searcher.search('o');
    this.searcher.highlightNextSearchResult(); // Highlight one
    this.searcher.selectHighlightedSearchResult();
    assert.equals(this.selectedSearchResult, 'one');
  }
});
