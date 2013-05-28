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
    this.multipleSelect = new Prime.Widget.MultipleSelect(Prime.Dom.queryFirst('#multiple-select'), true, 'Add New Value: ');
    this.multipleSelect.removeAllOptions();
    this.multipleSelect.addOption('one', 'One');
    this.multipleSelect.addOption('two', 'Two');
    this.multipleSelect.addOption('three', 'Three');
    this.multipleSelect.selectOptionWithValue('one');
    this.multipleSelect.selectOptionWithValue('three');
    this.multipleSelect.closeSearch();

    this.multipleSelectCustomAddDisabled = new Prime.Widget.MultipleSelect(Prime.Dom.queryFirst('#multiple-select-custom-add-disabled'), false);
    this.multipleSelectCustomAddDisabled.removeAllOptions();
    this.multipleSelectCustomAddDisabled.addOption('one', 'One');
    this.multipleSelectCustomAddDisabled.addOption('two', 'Two');
    this.multipleSelectCustomAddDisabled.addOption('three', 'Three');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('one');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('three');
    this.multipleSelectCustomAddDisabled.closeSearch();
  },

  'setup': function() {
    var display = Prime.Dom.queryFirst('#multiple-select-display');
    assert.isTrue(display !== null);

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
    assert.isTrue(children[1].hasClass('prime-multiple-select-search-results'));
    assert.equals(children[1].getChildren().length, 1);
    assert.isTrue(children[1].getChildren()[0].hasClass('prime-multiple-select-search-results-add-custom'));
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
    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
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

    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-three');
    assert.equals(displayOptions[0].getAttribute('value'), 'three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));
  },

  'findOptionWithText': function() {
    var option = this.multipleSelect.findOptionWithText('One');
    assert.isTrue(option instanceof Prime.Dom.Element);
    assert.isTrue(option.isSelected());
    assert.equals(option.getHTML(), 'One');
    assert.equals(option.getValue(), 'one');
  },

  'findOptionWithValue': function() {
    var option = this.multipleSelect.findOptionWithValue('one');
    assert.isTrue(option instanceof Prime.Dom.Element);
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

  'highlightNextOptionInSearchResults': function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightNextOptionInSearchResults();

    // Highlight Two
    var searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight the custom add option
    this.multipleSelect.highlightNextOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isFalse(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelect.highlightNextOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Get rid of the custom add option and highlight Two
    this.multipleSelect.search('two');
    this.multipleSelect.highlightNextOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // This should keep Two highlighted
    this.multipleSelect.highlightNextOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightNextOptionInSearchResults custom add disabled': function() {
    this.multipleSelectCustomAddDisabled.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelectCustomAddDisabled.highlightNextOptionInSearchResults();

    // Highlight Two
    var searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-results').getChildren();
    assert.equals(searchResultsOptions.length, 2);
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Ensure that the custom add does not get highlighted
    this.multipleSelectCustomAddDisabled.highlightNextOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightOptionForUnselect': function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());

    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-multiple-select-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-option-highlighted'));
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  },

  'highlightPreviousOptionInSearchResults': function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightPreviousOptionInSearchResults();

    // Highlight the custom add option
    var searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isFalse(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Highlight Two
    this.multipleSelect.highlightPreviousOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Wrap
    this.multipleSelect.highlightPreviousOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isFalse(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isTrue(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // Get rid of the custom add option and highlight Two
    this.multipleSelect.search('two');
    this.multipleSelect.highlightPreviousOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));

    // This should keep Two highlighted
    this.multipleSelect.highlightPreviousOptionInSearchResults();
    searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results').getChildren();
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result'));
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result'));
  },

  'highlightPreviousOptionInSearchResults custom add disabled': function() {
    this.multipleSelectCustomAddDisabled.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelectCustomAddDisabled.highlightPreviousOptionInSearchResults();

    // Ensure that the custom add doesn't get highlighted
    var searchResultsOptions = Prime.Dom.queryFirst('#multiple-select-custom-add-disabled-display .prime-multiple-select-search-results').getChildren();
    assert.equals(searchResultsOptions.length, 2);
    assert.isTrue(searchResultsOptions[0].hasClass('prime-multiple-select-highlighted-search-result')); // Two
    assert.isFalse(searchResultsOptions[1].hasClass('prime-multiple-select-highlighted-search-result')); // Custom add
  },

  'open and close search': function() {
    this.multipleSelect.openSearch();

    // Ensure the select uses the browser default for inputs. This will ensure that it also uses the CSS style in
    // production. The default in most browsers for input is inline-block
    var display = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-input-option');
    assert.equals(display.getComputedStyle()['display'], 'list-item');
    assert.isTrue(this.multipleSelect.isSearchInputVisible());

    this.multipleSelect.closeSearch();

    display = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-input-option');
    assert.equals(display.getStyle('display'), 'none');
    assert.isFalse(this.multipleSelect.isSearchInputVisible());
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

    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
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
    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-three');
    assert.isTrue(displayOptions[1].hasClass('prime-multiple-select-input-option'));
  },

  'search': function() {
    // Execute a search
    this.multipleSelect.search('t');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());

    var input = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-input');
    assert.equals(input.getValue(), 't');

    var searchDisplay = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results');
    assert.isTrue(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-option');
    assert.equals(searchDisplay.getChildren()[0].getHTML(), 'Two');
    assert.equals(searchDisplay.getChildren()[1].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.equals(searchDisplay.getChildren()[1].getHTML(), 'Add New Value: t');

    var customOption = Prime.Dom.queryFirst('#multiple-select-display .prime-multiple-select-search-results-add-custom');
    assert.isTrue(customOption.isVisible());

    // Add a letter
    this.multipleSelect.search('tw');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());
    assert.equals(input.getValue(), 'tw');
    assert.isTrue(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-option');
    assert.equals(searchDisplay.getChildren()[0].getHTML(), 'Two');
    assert.equals(searchDisplay.getChildren()[1].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.equals(searchDisplay.getChildren()[1].getHTML(), 'Add New Value: tw');
    assert.isTrue(customOption.isVisible());

    // Add a letter
    this.multipleSelect.search('two');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(input.getValue(), 'two');
    assert.isTrue(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-option');
    assert.equals(searchDisplay.getChildren()[0].getHTML(), 'Two');
    assert.equals(searchDisplay.getChildren()[1].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.isFalse(customOption.isVisible());

    // Add a letter
    this.multipleSelect.search('twos');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.isCustomAddVisible());
    assert.equals(input.getValue(), 'twos');
    assert.isTrue(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 1); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.equals(searchDisplay.getChildren()[0].getHTML(), 'Add New Value: twos');
    assert.isTrue(customOption.isVisible());

    // Empty search
    this.multipleSelect.search('');
    assert.isTrue(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(input.getValue(), '');
    assert.isTrue(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-option');
    assert.equals(searchDisplay.getChildren()[0].getHTML(), 'Two');
    assert.equals(searchDisplay.getChildren()[1].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.isFalse(customOption.isVisible());

    // Empty search with no options available
    this.multipleSelect.selectOptionWithValue('two');
    this.multipleSelect.search('');
    assert.isFalse(this.multipleSelect.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.isCustomAddVisible());
    assert.equals(input.getValue(), '');
    assert.isFalse(searchDisplay.isVisible());
    assert.equals(searchDisplay.getChildren().length, 1); // The option for Two and the add custom option
    assert.equals(searchDisplay.getChildren()[0].getClass(), 'prime-multiple-select-search-results-add-custom');
    assert.isFalse(customOption.isVisible());
  },

  'selectHighlightedSearchResult': function() {
    this.multipleSelect.search('t'); // This will result in the search results having Two and the custom option shown
    this.multipleSelect.highlightNextOptionInSearchResults(); // Highlight Two
    this.multipleSelect.highlightNextOptionInSearchResults(); // Highlight the custom

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
    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
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
    this.multipleSelect.highlightNextOptionInSearchResults(); // Highlight Two
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
    displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
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
    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
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

    var displayOptions = Prime.Dom.query('#multiple-select-display ul.prime-multiple-select-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-multiple-select-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'multiple-select-option-three');
    assert.isFalse(displayOptions[1].hasClass('prime-multiple-select-option-highlighted'));
    assert.isTrue(displayOptions[2].hasClass('prime-multiple-select-input-option'));
  }
});
