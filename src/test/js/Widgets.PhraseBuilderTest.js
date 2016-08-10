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
'use strict';

/*
 * Helper functions
 */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('PhraseBuilder class tests', {
  setUp: function() {
    this.callbackFunction = function(searchText) {
    };

    this.phraseBuilder = new Prime.Widgets.PhraseBuilder(Prime.Document.queryFirst('#phrase-builder'), this.callbackFunction, this).
        withPlaceholder('Select One').
        render();
    this.phraseBuilder.removeAllWords();
    this.phraseBuilder.addWord('one');
    this.phraseBuilder.addWord('two');
    this.phraseBuilder.addWord('three');
    this.phraseBuilder.searcher.closeSearchResults();
  },

  'setup': function() {
    var display = Prime.Document.queryFirst('#phrase-builder-display');
    refute.isNull(display);

    var children = display.getChildren();
    assert.equals(children.length, 2);
    assert.equals(children[0].getTagName(), 'UL');
    assert.equals(children[0].getChildren().length, 4);
    assert.equals(children[0].getChildren()[0].getID(), 'phrase-builder-option-one');
    assert.equals(children[0].getChildren()[0].getChildren()[0].getHTML(), 'one');
    assert.equals(children[0].getChildren()[0].getChildren()[1].getAttribute('value'), 'one');
    assert.equals(children[0].getChildren()[0].getChildren()[1].getHTML(), 'X');
    assert.equals(children[0].getChildren()[1].getID(), 'phrase-builder-option-two');
    assert.equals(children[0].getChildren()[1].getChildren()[0].getHTML(), 'two');
    assert.equals(children[0].getChildren()[1].getChildren()[1].getAttribute('value'), 'two');
    assert.equals(children[0].getChildren()[1].getChildren()[1].getHTML(), 'X');
    assert.equals(children[0].getChildren()[2].getID(), 'phrase-builder-option-three');
    assert.equals(children[0].getChildren()[2].getChildren()[0].getHTML(), 'three');
    assert.equals(children[0].getChildren()[2].getChildren()[1].getAttribute('value'), 'three');
    assert.equals(children[0].getChildren()[2].getChildren()[1].getHTML(), 'X');
    assert.isTrue(children[0].getChildren()[3].hasClass('prime-phrase-builder-input-option'));
    assert.equals(children[0].getChildren()[3].getChildren()[0].getTagName(), 'INPUT');
    assert.isTrue(children[0].getChildren()[3].getChildren()[0].hasClass('prime-phrase-builder-input'));
    assert.equals(children[1].getTagName(), 'UL');
    assert.isTrue(children[1].hasClass('prime-phrase-builder-search-result-list'));
    assert.equals(children[1].getChildren().length, 0);
  },

  'addWord': function() {
    // Add the option
    this.phraseBuilder.addWord('four');

    var select = this.phraseBuilder.element.domElement;
    assert.equals(select.length, 4);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equals(select.options[3].value, 'four');
    assert.isTrue(select.options[3].selected);

    // Ensure that the option got added to the display
    var displayOptions = Prime.Document.query('#phrase-builder-display ul.prime-phrase-builder-option-list li');
    assert.equals(displayOptions.length, 5);
    assert.equals(displayOptions[0].getID(), 'phrase-builder-option-one');
    assert.equals(displayOptions[0].getAttribute('value'), 'one');
    assert.equals(displayOptions[1].getID(), 'phrase-builder-option-two');
    assert.equals(displayOptions[1].getAttribute('value'), 'two');
    assert.equals(displayOptions[2].getID(), 'phrase-builder-option-three');
    assert.equals(displayOptions[2].getAttribute('value'), 'three');
    assert.equals(displayOptions[3].getID(), 'phrase-builder-option-four');
    assert.equals(displayOptions[3].getAttribute('value'), 'four');
    assert.isTrue(displayOptions[4].hasClass('prime-phrase-builder-input-option'));
  },

  'containsWord': function() {
    assert.isTrue(this.phraseBuilder.containsWord('one'));
    assert.isTrue(this.phraseBuilder.containsWord('two'));
    assert.isTrue(this.phraseBuilder.containsWord('three'));
    assert.isFalse(this.phraseBuilder.containsWord('four'));
  },

  'removeWord': function() {
    // Deselect the option
    this.phraseBuilder.removeWord('one');

    var select = this.phraseBuilder.element.domElement;
    assert.equals(select.length, 2);
    assert.equals(select.options[0].value, 'two');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'three');
    assert.isTrue(select.options[1].selected);

    var displayOptions = Prime.Document.query('#phrase-builder-display ul.prime-phrase-builder-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'phrase-builder-option-two');
    assert.equals(displayOptions[0].getAttribute('value'), 'two');
    assert.equals(displayOptions[1].getID(), 'phrase-builder-option-three');
    assert.equals(displayOptions[1].getAttribute('value'), 'three');
    assert.isTrue(displayOptions[2].hasClass('prime-phrase-builder-input-option'));
  },

  'getWords': function() {
    var words = this.phraseBuilder.getWords();
    assert.equals(words.length, 3);
    assert.equals(words[0], 'one');
    assert.equals(words[1], 'two');
    assert.equals(words[2], 'three');
  },

  'highlightWordForRemoval': function() {
    this.phraseBuilder.highlightWordForRemoval(); // Highlight Three
    assert.isTrue(this.phraseBuilder.isLastWordHighlightedForRemoval());

    var displayOptions = Prime.Document.query('#phrase-builder-display ul.prime-phrase-builder-option-list li');
    assert.equals(displayOptions.length, 4);
    assert.equals(displayOptions[0].getID(), 'phrase-builder-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-phrase-builder-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'phrase-builder-option-two');
    assert.isFalse(displayOptions[1].hasClass('prime-phrase-builder-option-highlighted'));
    assert.equals(displayOptions[2].getID(), 'phrase-builder-option-three');
    assert.isTrue(displayOptions[2].hasClass('prime-phrase-builder-option-highlighted'));
    assert.isTrue(displayOptions[3].hasClass('prime-phrase-builder-input-option'));
  },

  'removeHighlightedWord': function() {
    this.phraseBuilder.highlightWordForRemoval(); // Highlight Three
    assert.isTrue(this.phraseBuilder.isLastWordHighlightedForRemoval());
    this.phraseBuilder.removeHighlightedWord();

    // Verify the backing select is updated
    var select = this.phraseBuilder.element.domElement;
    assert.equals(select.length, 2);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);

    var displayOptions = Prime.Document.query('#phrase-builder-display ul.prime-phrase-builder-option-list li');
    assert.equals(displayOptions.length, 3);
    assert.equals(displayOptions[0].getID(), 'phrase-builder-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-phrase-builder-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'phrase-builder-option-two');
    assert.isFalse(displayOptions[1].hasClass('prime-phrase-builder-option-highlighted'));
    assert.isTrue(displayOptions[2].hasClass('prime-phrase-builder-input-option'));
  },

  'unhighlightWordForRemoval': function() {
    this.phraseBuilder.highlightWordForRemoval(); // Highlight Three
    assert.isTrue(this.phraseBuilder.isLastWordHighlightedForRemoval());
    this.phraseBuilder.unhighlightWordForRemoval();
    assert.isFalse(this.phraseBuilder.isLastWordHighlightedForRemoval());

    // Verify the backing select is correct
    var select = this.phraseBuilder.element.domElement;
    assert.equals(select.length, 3);
    assert.equals(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equals(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equals(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    var displayOptions = Prime.Document.query('#phrase-builder-display ul.prime-phrase-builder-option-list li');
    assert.equals(displayOptions.length, 4);
    assert.equals(displayOptions[0].getID(), 'phrase-builder-option-one');
    assert.isFalse(displayOptions[0].hasClass('prime-phrase-builder-option-highlighted'));
    assert.equals(displayOptions[1].getID(), 'phrase-builder-option-two');
    assert.isFalse(displayOptions[1].hasClass('prime-phrase-builder-option-highlighted'));
    assert.equals(displayOptions[2].getID(), 'phrase-builder-option-three');
    assert.isFalse(displayOptions[2].hasClass('prime-phrase-builder-option-highlighted'));
    assert.isTrue(displayOptions[3].hasClass('prime-phrase-builder-input-option'));
  }
});
