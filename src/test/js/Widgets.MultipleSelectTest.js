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
    this.multipleSelect = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select')).
        withPlaceholder('Select One').
        withCustomAddEnabled(true).
        withCustomAddLabel('Add New Value: ').
        render();
    this.multipleSelect.removeAllOptions();
    this.multipleSelect.addOption('one', 'One');
    this.multipleSelect.addOption('two', 'Two');
    this.multipleSelect.addOption('three', 'Three');
    this.multipleSelect.selectOptionWithValue('one');
    this.multipleSelect.selectOptionWithValue('three');
    this.multipleSelect.searcher.closeSearchResults();

    this.multipleSelectCustomAddDisabled = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select-custom-add-disabled')).
        withPlaceholder('Choose:').
        withCustomAddEnabled(false).
        render();
    this.multipleSelectCustomAddDisabled.removeAllOptions();
    this.multipleSelectCustomAddDisabled.addOption('one', 'One');
    this.multipleSelectCustomAddDisabled.addOption('two', 'Two');
    this.multipleSelectCustomAddDisabled.addOption('three', 'Three');
    this.multipleSelectCustomAddDisabled.addOption('twenty', 'Twenty');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('one');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('three');
    this.multipleSelectCustomAddDisabled.searcher.closeSearchResults();
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
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equals(event.event, Prime.Widgets.MultipleSelect.AddOptionEvent);
      assert.equals(event.memo, 'four');
      assert.equals(event.target, ms);
    };

    // Add the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.AddOptionEvent, listener);
    this.multipleSelect.addOption('four', 'Four');
    assert.isTrue(called);

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
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equals(event.event, Prime.Widgets.MultipleSelect.DeselectOptionEvent);
      assert.equals(event.memo, 'one');
      assert.equals(event.target, ms);
    };

    // Deselect the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.DeselectOptionEvent, listener);
    this.multipleSelect.deselectOptionWithValue('one');
    assert.isTrue(called);

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

  'search': function() {
    // Execute a search
    this.multipleSelect.searcher.search('t');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 't');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getClass(), 'prime-searcher-search-result prime-searcher-add-custom prime-searcher-highlighted-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getHTML(), 'Add New Value: t');

    // Add a letter
    this.multipleSelect.searcher.search('tw');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'tw');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 2); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getClass(), 'prime-searcher-search-result prime-searcher-add-custom prime-searcher-highlighted-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[1].getHTML(), 'Add New Value: tw');

    // Make the custom add option go away
    this.multipleSelect.searcher.search('two');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'two');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-search-result prime-searcher-highlighted-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');

    // Add a letter
    this.multipleSelect.searcher.search('twos');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), 'twos');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1); // The option for Two and the add custom option
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-search-result prime-searcher-add-custom prime-searcher-highlighted-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Add New Value: twos');

    // Empty search
    this.multipleSelect.searcher.search('');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '');
    assert.isTrue(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-search-result');
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren()[0].getHTML(), 'Two');

    // Whitespace search
    this.multipleSelect.searcher.search('   ');
    assert.isFalse(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '   ');
    assert.isFalse(this.multipleSelect.searchResultsContainer.isVisible());

    // Empty search with no options available
    this.multipleSelect.selectOptionWithValue('two');
    this.multipleSelect.searcher.search('');
    assert.isFalse(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelect.input.getValue(), '');
    assert.isFalse(this.multipleSelect.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelect.searchResultsContainer.getChildren().length, 0);
  },

  'search custom add disabled': function() {
    // Search with no results
    this.multipleSelectCustomAddDisabled.searcher.search('nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelectCustomAddDisabled.searcher.isCustomAddVisible());
    assert.equals(this.multipleSelectCustomAddDisabled.input.getValue(), 'nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.searchResultsContainer.isVisible());
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren().length, 1);
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren()[0].getClass(), 'prime-searcher-no-search-results');
    assert.equals(this.multipleSelectCustomAddDisabled.searchResultsContainer.getChildren()[0].getHTML(), 'No Matches For: nothing');
  },

  'MultipleSelect.search': function() {
    // Deselect the options and add some extras
    this.multipleSelect.deselectOptionWithValue('one');
    this.multipleSelect.deselectOptionWithValue('three');
    this.multipleSelect.addOption('one1', 'One1');
    this.multipleSelect.addOption('one2', 'One2');
    this.multipleSelect.addOption('two1', 'Two1');
    this.multipleSelect.addOption('two2', 'Two2');

    var options = this.multipleSelect.search(null);
    assert.equals(options.results.length, 7);
    assert.equals(options.results[0], 'One');
    assert.equals(options.results[1], 'One1');
    assert.equals(options.results[2], 'One2');
    assert.equals(options.results[3], 'Three');
    assert.equals(options.results[4], 'Two');
    assert.equals(options.results[5], 'Two1');
    assert.equals(options.results[6], 'Two2');

    options = this.multipleSelect.search('t');
    assert.equals(options.results.length, 4);
    assert.equals(options.results[0], 'Three');
    assert.equals(options.results[1], 'Two');
    assert.equals(options.results[2], 'Two1');
    assert.equals(options.results[3], 'Two2');
  },

  'selectHighlightedSearchResult': function() {
    // This will result in the search results having Two and the custom option shown and the custom option will be selected
    this.multipleSelect.searcher.search('t');

    // Add the custom option
    this.multipleSelect.searcher.selectHighlightedSearchResult();

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
    this.multipleSelect.searcher.search('t');
    this.multipleSelect.searcher.highlightNextSearchResult(); // Highlight Two
    this.multipleSelect.searcher.selectHighlightedSearchResult();

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
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equals(event.event, Prime.Widgets.MultipleSelect.SelectOptionEvent);
      assert.equals(event.memo, 'two');
      assert.equals(event.target, ms);
    };

    // Select the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.SelectOptionEvent, listener);
    this.multipleSelect.selectOptionWithValue('two');
    assert.isTrue(called);

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

  'setSelectedValues': function() {
    // Select one option
    this.multipleSelect.setSelectedValues('two');
    assert.equals(this.multipleSelect.getSelectedValues(), ['two']);

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
    assert.equals(this.multipleSelect.getSelectedValues(), ['one', 'two']);

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
