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
    this.timeout = 2000;
    this.multipleSelect = new Prime.Widgets.MultipleSelect(Prime.Dom.queryFirst('#multiple-select'));
  },

  'setup': function() {
    var display = Prime.Dom.queryFirst('#multiple-select-display');
    assert.isTrue(display != null);

    var children = display.getChildren();
    assert.equals(children.length, 2);
    assert.equals(children[0].domElement.tagName, 'INPUT');
    assert.equals(children[1].domElement.tagName, 'UL');
    assert.equals(children[1].getChildren().length, 2);
    assert.equals(children[1].getChildren()[0].getID(), 'prime-multiple-select-option-one');
    assert.equals(children[1].getChildren()[0].getChildren()[0].getHTML(), 'One');
    assert.equals(children[1].getChildren()[0].getChildren()[1].getAttribute('value'), 'one');
    assert.equals(children[1].getChildren()[0].getChildren()[1].getHTML(), 'X');
    assert.equals(children[1].getChildren()[1].getID(), 'prime-multiple-select-option-three');
    assert.equals(children[1].getChildren()[1].getChildren()[0].getHTML(), 'Three');
    assert.equals(children[1].getChildren()[1].getChildren()[1].getAttribute('value'), 'three');
    assert.equals(children[1].getChildren()[1].getChildren()[1].getHTML(), 'X');
  },

  'addOption, selectOption and removeOption': function() {
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
    var displayOptions = Prime.Dom.query('#multiple-select-display ul li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'prime-multiple-select-option-one');
    assert.equals(displayOptions[1].getID(), 'prime-multiple-select-option-three');

    // Select the option
    this.multipleSelect.selectOptionWithValue('four');

    assert.equals(select.length, 4);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equals(select.options[3].value, 'four');
    assert.isTrue(select.options[3].selected);

    // Ensure that the option is added to the display
    displayOptions = Prime.Dom.query('#multiple-select-display ul li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'prime-multiple-select-option-one');
    assert.equals(displayOptions[1].getID(), 'prime-multiple-select-option-three');
    assert.equals(displayOptions[2].getID(), 'prime-multiple-select-option-four');

    // Remove the option and retest
    this.multipleSelect.removeOptionWithValue('four');

    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.equals(select.options[1].value, 'two');
    assert.equals(select.options[2].value, 'three');

    // Ensure that the option gets removed from the display
    displayOptions = Prime.Dom.query('#multiple-select-display ul li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'prime-multiple-select-option-one');
    assert.equals(displayOptions[1].getID(), 'prime-multiple-select-option-three');
  },

  'containsOptionWithValue': function() {
    assert.isTrue(this.multipleSelect.containsOptionWithValue('one'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('two'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('three'));
    assert.isFalse(this.multipleSelect.containsOptionWithValue('four'));
  },

  'deselectOptionWithValue and selectOptionWithValue': function() {
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

    var displayOptions = Prime.Dom.query('#multiple-select-display ul li');
    assert.equals(displayOptions.length, 1);
    assert.equals(displayOptions[0].getID(), 'prime-multiple-select-option-three');

    // Re-select the option
    this.multipleSelect.selectOptionWithValue('one');

    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    displayOptions = Prime.Dom.query('#multiple-select-display ul li');
    assert.equals(displayOptions.length, 2);
    assert.equals(displayOptions[0].getID(), 'prime-multiple-select-option-three');
    assert.equals(displayOptions[1].getID(), 'prime-multiple-select-option-one');
  }
});
