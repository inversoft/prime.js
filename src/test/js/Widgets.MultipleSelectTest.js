/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
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

/*
 * Helper functions
 */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('MultipleSelect class tests', {
  setUp: function() {
    this.multipleSelect = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select'), 'Select One', true, 'Add New Value: ');
    this.multipleSelect.removeAllOptions();
    this.multipleSelect.addOption('one', 'One');
    this.multipleSelect.addOption('two', 'Two');
    this.multipleSelect.addOption('three', 'Three');
    this.multipleSelect.selectOptionWithValue('one');
    this.multipleSelect.selectOptionWithValue('three');
    this.multipleSelect.removeAllSearchResults();
    this.multipleSelect.closeSearchResults();

    this.multipleSelectCustomAddDisabled = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select-custom-add-disabled'), 'Choose:', false);
    this.multipleSelectCustomAddDisabled.removeAllOptions();
    this.multipleSelectCustomAddDisabled.addOption('one', 'One');
    this.multipleSelectCustomAddDisabled.addOption('two', 'Two');
    this.multipleSelectCustomAddDisabled.addOption('three', 'Three');
    this.multipleSelectCustomAddDisabled.addOption('twenty', 'Twenty');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('one');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('three');
    this.multipleSelectCustomAddDisabled.removeAllSearchResults();
    this.multipleSelectCustomAddDisabled.closeSearchResults();
  },

  'setup': function() {
    var display = Prime.Document.queryFirst('#multiple-select-display');
    refute.isNull(display);

    var children = display.getChildren();
    assert.equals(children.length, 2);
    assert.equals(children[0].getTagName(), 'UL');
    assert.equals(children[0].getChildren().length, 3);
    assert.equals(children[0].getChildren()[0].getID(), 'multiple-select-option-one');
    assert.equals(children[0].getChildren()[0].getChildren()[0].getHTML(), 'One');
    assert.equals(children[0].getChildren()[0].getChildren()[1].getAttribute('value'), 'one');
    assert.equals(children[0].getChildren()[0].getChildren()[1].getHTML(), 'X');
    assert.equals(children[0].getChildren()[1].getID(), 'multiple-select-option-three');
    assert.equals(children[0].getChildren()[1].getChildren()[0].getHTML(), 'Three');
    assert.equals(children[0].getChildren()[1].getChildren()[1].getAttribute('value'), 'three');
    assert.equals(children[0].getChildren()[1].getChildren()[1].getHTML(), 'X');
    assert.isTrue(children[0].getChildren()[2].hasClass('prime-multiple-select-input-option'));
    assert.equals(children[0].getChildren()[2].getChildren()[0].getTagName(), 'INPUT');
    assert.isTrue(children[0].getChildren()[2].getChildren()[0].hasClass('prime-multiple-select-input'));
    assert.equals(children[1].getTagName(), 'UL');
    assert.isTrue(children[1].hasClass('prime-multiple-select-search-result-list'));
    assert.equals(children[1].getChildren().length, 0);
  },

  'addOption': function() {
    // Add the option
    this.multipleSelect.addOption('four', 'Four');

    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 4);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equals(select.options[3].value, 'four');
    assert.isFalse(select.options[3].selected);

    // Ensure that the option didn't get added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[1].getAttribute('value'), 'three');
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  },

  'containsOptionWithValue': function() {
    assert.isTrue(this.multipleSelect.containsOptionWithValue('one'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('two'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('three'));
    assert.isFalse(this.multipleSelect.containsOptionWithValue('four'));
  },

  'deselectOptionWithValue': function() {
    // Deselect the option
    this.multipleSelect.deselectOptionWithValue('one');

    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isFalse(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[0].getAttribute('value'), 'three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));
  },

  'findOptionWithText': function() {
    var option = this.multipleSelect.findOptionWithText('One');
    assert.isTrue(option instanceof Prime.Document.Element);
    assert.isTrue(option.isSelected());
    assert.equals(option.getHTML(), 'One');
    assert.equals(option.getValue(), 'one');
  },

  'findOptionWithValue': function() {
    var option = this.multipleSelect.findOptionWithValue('one');
    assert.isTrue(option instanceof Prime.Document.Element);
    assert.isTrue(option.isSelected());
    assert.equals(option.getHTML(), 'One');
    assert.equals(option.getValue(), 'one');
  },

  'hasOptionWithValue': function() {
    assert.isTrue(this.multipleSelect.hasOptionWithValue('one'));
    assert.isTrue(this.multipleSelect.hasOptionWithValue('two'));
    assert.isTrue(this.multipleSelect.hasOptionWithValue('three'));
    assert.isFalse(this.multipleSelect.hasOptionWithValue('four'));
  },

  "highlightNextSearchResult": function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightNextSearchResult();

    // Highlight Two
    var searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight the custom add option
    this.multipleSelect.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelect.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Get rid of the custom add option and highlight Two
    this.multipleSelect.search('two');
    this.multipleSelect.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));

    // This should keep Two highlighted
    this.multipleSelect.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightNextSearchResult custom add disabled': function() {
    this.multipleSelectCustomAddDisabled.search('t'); // This will result in the search results having Two and Three shown

    // Highlight Two
    this.multipleSelectCustomAddDisabled.highlightNextSearchResult();
    var searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight Twenty
    this.multipleSelectCustomAddDisabled.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelectCustomAddDisabled.highlightNextSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightOptionForUnselect': function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());

    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-multiple-select-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-option-highlighted'));
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  },

  "highlightPreviousSearchResult": function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightPreviousSearchResult();

    // Highlight the custom add option
    var searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight Two
    this.multipleSelect.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelect.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Get rid of the custom add option and highlight Two
    this.multipleSelect.search('two');
    this.multipleSelect.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));

    // This should keep Two highlighted
    this.multipleSelect.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 1);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightPreviousSearchResult custom add disabled': function() {
    this.multipleSelectCustomAddDisabled.search('t'); // This will result in the search results having Two and Three shown

    // Highlight Twenty
    this.multipleSelectCustomAddDisabled.highlightPreviousSearchResult();
    var searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight Two
    this.multipleSelectCustomAddDisabled.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isTrue(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelectCustomAddDisabled.highlightPreviousSearchResult();
    searchResults = Prime.Document.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-result-list').getChildren();
    assert.equals(searchResults.length, 2);
    assert.isFalse(searchResults[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResults[1].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'removeHighlightedOption': function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());
    this.multipleSelect.removeHighlightedOption();

    // Verify the backing select is updated
    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-multiple-select-option-highlighted'));
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));
  },

  'removeOptionWithValue': function() {
    // Remove the option and retest
    this.multipleSelect.removeOptionWithValue('one');

    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 2);
    assert.equals(select.options[0].value, 'two');
    assert.equals(select.options[1].value, 'three');

    // Ensure that the option gets removed from the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));
  },

  "closeSearchResults": function() {
    this.multipleSelect.search();
    this.multipleSelect.closeSearchResults();

    searchResultList = Prime.Document.queryFirst('#multiple-select-display .prime-multiple-select-search-result-list');
    assert.isFalse(searchResultList.isVisible());
    assert.equals(this.multipleSelect.input.getValue(), '');
  },

  'search': function() {
    // Execute a search
    this.multipleSelect.search('t');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 't');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getClass(), 'prime-multiple-select-search-result prime-multiple-select-add-custom');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getHTML(), 'Add New Value: t');

    // Add a letter
    this.multipleSelect.search('tw');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'tw');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getClass(), 'prime-multiple-select-search-result prime-multiple-select-add-custom');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getHTML(), 'Add New Value: tw');

    // Make the custom add option go away
    this.multipleSelect.search('two');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'two');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');

    // Add a letter
    this.multipleSelect.search('twos');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'twos');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-search-result prime-multiple-select-add-custom');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Add New Value: twos');

    // Empty search
    this.multipleSelect.search('');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');

    // Whitespace search
    this.multipleSelect.search('   ');
    assert.isFalse(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '   ');
    assert.isFalse(this.multipleSelect.searchResultsContainer.isVisible());

    // Empty search with no options available
    this.multipleSelect.selectOptionWithValue('two');
    this.multipleSelect.search('');
    assert.isFalse(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '');
    assert.isFalse(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 0);
  },

  'search custom add disabled': function() {
    // Search with no results
    this.multipleSelectCustomAddDisabled.search('nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.isSearchResultsVisible());
    assert.isFalse(this.multipleSelectCustomAddDisabled.isCustomAddVisible());
    assert.equals(this.multipleSelectCustomAddDisabled.input.getValue(), 'nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren()[0].getClass(), 'prime-multiple-select-no-search-results');
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren()[0].getHTML(), 'No Matches For: nothing');
  },

  'selectHighlightedSearchResult': function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightNextSearchResult(); // Highlight Two
    this.multipleSelect.highlightNextSearchResult(); // Highlight the custom

    // Add the custom option
    this.multipleSelect.selectHighlightedSearchResult();

    // Verify the backing select box is updated
    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 4);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equals(select.options[3].value, 't');
    assert.isTrue(select.options[3].selected);

    // Verify the display is updated
    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 4);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[1].getAttribute('value'), 'three');
    assert.equals(displayOptions[2].getID(), 'multiple-select-option-t');
    assert.equals(displayOptions[2].getAttribute('value'), 't');
    assert.isTrue(displayOptions[3].hasClass('prime-multiple-select-input-option'));

    // Add a non-custom option
    this.multipleSelect.search('t');
    this.multipleSelect.highlightNextSearchResult(); // Highlight Two
    this.multipleSelect.selectHighlightedSearchResult();

    // Verify the backing select box is updated
    assert.equals(select.length, 4);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equals(select.options[3].value, 't');
    assert.isTrue(select.options[3].selected);

    // Verify the display is updated
    displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 5);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[1].getAttribute('value'), 'three');
    assert.equals(displayOptions[2].getID(), 'multiple-select-option-t');
    assert.equals(displayOptions[2].getAttribute('value'), 't');
    assert.equals(displayOptions[3].getID(), 'multiple-select-option-two');
    assert.equals(displayOptions[3].getAttribute('value'), 'two');
    assert.isTrue(displayOptions[4].hasClass('prime-multiple-select-input-option'));
  },

  'selectOptionWithValue': function() {
    // Select the option
    this.multipleSelect.selectOptionWithValue('two');

    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    // Ensure that the option is added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 4);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[1].getAttribute('value'), 'three');
    assert.equals(displayOptions[2].getID(), 'multiple-select-option-two');
    assert.equals(displayOptions[2].getAttribute('value'), 'two');
    assert.isTrue(displayOptions[3].hasClass('prime-multiple-select-input-option'));
  },

  'selectableOptionsForPrefix': function() {
    // Deselect the options and add some extras
    this.multipleSelect.deselectOptionWithValue('one');
    this.multipleSelect.deselectOptionWithValue('three');
    this.multipleSelect.addOption('one1', 'One1');
    this.multipleSelect.addOption('one2', 'One2');
    this.multipleSelect.addOption('two1', 'Two1');
    this.multipleSelect.addOption('two2', 'Two2');

    var options = this.multipleSelect.selectableOptionsForPrefix();
    assert.equals(options.length, 7);
    assert.equals(options[0], 'One');
    assert.equals(options[1], 'One1');
    assert.equals(options[2], 'One2');
    assert.equals(options[3], 'Three');
    assert.equals(options[4], 'Two');
    assert.equals(options[5], 'Two1');
    assert.equals(options[6], 'Two2');

    options = this.multipleSelect.selectableOptionsForPrefix('t');
    assert.equals(options.length, 4);
    assert.equals(options[0], 'Three');
    assert.equals(options[1], 'Two');
    assert.equals(options[2], 'Two1');
    assert.equals(options[3], 'Two2');
  },

  'setSelectedValues': function() {
    // Select one option
    this.multipleSelect.setSelectedValues('two');

    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isFalse(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    // Ensure that the option is added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-two');
    assert.equals(displayOptions[0].getAttribute('value'), 'two');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));

    // Select multiple options
    this.multipleSelect.setSelectedValues('one', 'two');

    select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    // Ensure that the option is added to the display
    displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-two');
    assert.equals(displayOptions[1].getAttribute('value'), 'two');
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  },

  'unhighlightOptionForUnselect': function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());
    this.multipleSelect.unhighlightOptionForUnselect();
    assert.isFalse(this.multipleSelect.isLastOptionHighlightedForUnselect());

    // Verify the backing select is correct
    var select = this.multipleSelect.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-multiple-select-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.isFalse(displayOptions[1].hasClass('prime-multiple-select-option-highlighted'));
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  }
});
