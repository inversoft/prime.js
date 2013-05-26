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
function findPreviousElementSibling(element) {
  var sibling = element.previousSibling;
  while (sibling && sibling.nodeType != 1) {
    sibling = sibling.previousSibling;
  }

  return sibling;
}

function findNextElementSibling(element) {
  var sibling = element.nextSibling;
  while (sibling && sibling.nodeType != 1) {
    sibling = sibling.nextSibling;
  }

  return sibling;
}


var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.assertions.add('hasNextElementSiblings', {
  assert: function(element, number) {
    this.actualCount = 0;
    var sibling = element.nextSibling;
    while (sibling) {
      if (sibling.nodeType === 1) {
        this.actualCount++;
      }
      sibling = sibling.nextSibling;
    }

    return (this.actualCount === number);
  },
  assertMessage: 'Expected ${1} next sibling elements but there were ${actualCount}',
  refuteMessage: 'Expected there not be ${1} next sibling elements but there were'
});

buster.assertions.add('hasPreviousElementSiblings', {
  assert: function(element, number) {
    this.actualCount = 0;
    var sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === 1) {
        this.actualCount++;
      }
      sibling = sibling.previousSibling;
    }

    return (this.actualCount === number);
  },
  assertMessage: 'Expected ${1} previous sibling elements but there were ${actualCount}',
  refuteMessage: 'Expected there not be ${1} previous sibling elements but there were'
});


buster.testCase('Window tests', {
  'getInnerHeight': function() {
    assert.isTrue(Prime.Window.getInnerHeight() > 400);
  },

  'getInnerWidth': function() {
    assert.isTrue(Prime.Window.getInnerWidth() > 400);
  },

  'getScrollTop': function() {
    assert.isTrue(Prime.Window.getScrollTop() >= 0);
  }
});

buster.testCase('Dom namespace tests', {
  'documentReady': function() {
    assert.equals(documentReadyCount, 1);
    assert.equals(drc.count, 1);
  }
});

buster.testCase('ElementList namespace tests', {
  'query': function() {
    var list = Prime.Dom.query('p.test');
    assert.equals(list.length, 3);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');

    var parent = Prime.Dom.queryByID('query');
    list = Prime.Dom.query('p.test', parent);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');

    list = Prime.Dom.query('p.test', parent.domElement);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');
  }
});

buster.testCase('ElementList class tests', {
  'each': function() {
    var count = 0;
    Prime.Dom.query('p.test').each(function(element, index) {
      assert.equals(index, count++);
      assert(this instanceof Array);
      assert(element instanceof Prime.Dom.Element);
      assert.equals(element.domElement.tagName, 'P');
    }, []);

    assert.equals(count, 3);
  }
});

buster.testCase('ElementList indexOf tests', {
  'indexOf Prime Element': function() {
    var container = Prime.Dom.queryByID("query");
    var list = Prime.Dom.query("p", container);

    var one = Prime.Dom.queryByID("queryOne");
    var two = Prime.Dom.queryByID("queryTwo");
    var outside = Prime.Dom.queryByID("insertSingle");

    assert.equals(list.indexOf(one), 0);
    assert.equals(list.indexOf(one.domElement), 0);
    assert.equals(list.indexOf(two), 1);
    assert.equals(list.indexOf(two.domElement), 1);
    assert.equals(list.indexOf(outside), -1);
    assert.equals(list.indexOf(outside.domElement), -1);
  }
});


buster.testCase('Element namespace tests', {
  /**
   * Tests selecting one element.
   */
  'queryFirst': function() {
    var element = Prime.Dom.queryFirst('p');
    refute.isNull(element);
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('p#queryOne');
    refute.isNull(element);
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('#queryOne');
    refute.isNull(element);
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('#invalid');
    assert.isNull(element);
  },

  'queryFirst with Element': function() {
    var child = Prime.Dom.queryFirst('.test', Prime.Dom.queryByID('query'));
    refute.isNull(child);
  },

  /**
   * Tests selecting by ID.
   */
  'queryByID': function() {
    var element = Prime.Dom.queryByID('queryOne');
    refute.isNull(element);
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('invalid');
    assert.isNull(element);
  },

  /**
   * Tests creating a new element.
   */
  'newElement': function() {
    var element = Prime.Dom.newElement('<a/>');
    assert.equals(element.domElement.tagName, 'A');

    element = Prime.Dom.newElement('<div/>');
    assert.equals(element.domElement.tagName, 'DIV');

    element = Prime.Dom.newElement('<span></span>');
    assert.equals(element.domElement.tagName, 'SPAN');

    element = Prime.Dom.newElement('<span>foo</span>');
    assert.equals(element.domElement.tagName, 'SPAN');

    element = Prime.Dom.newElement('<div/>', {'id': '1'});
    assert.equals(element.domElement.id, '1');
    assert.equals(element.getID(), '1');

    element = Prime.Dom.newElement('<div/>', {'id': 'id', 'style': 'width:200px;float:left'});
    assert.equals(element.domElement.id, 'id');
    assert.equals(element.getID(), 'id');
    assert.equals(element.domElement.style['width'], '200px');
    assert.equals(element.domElement.style['float'], 'left');
  },

  'queryUp': {
    setUp: function() {
      this.child = Prime.Dom.queryByID('child');
      this.parent = Prime.Dom.queryByID('parent');
      this.ancestor = Prime.Dom.queryFirst('div.ancestor');
    },

    'find parent by id': function() {
      assert.equals(Prime.Dom.queryUp('#parent', this.child), this.parent);
    },

    'find parent by type + id': function() {
      assert.equals(Prime.Dom.queryUp('div#parent', this.child), this.parent);
    },

    'find parent by type only': function() {
      assert.equals(Prime.Dom.queryUp('div', this.child), this.parent);
    },

    'find ancestor': function() {
      assert.equals(Prime.Dom.queryUp('.ancestor', this.child), this.ancestor);
    },

    'throws error on bad selector': function() {
      try {
        Prime.Dom.queryUp('div div#parent', this.child);
        assert(false);
      } catch (err) {
        assert(err != null);
      }
    }
  }
});

buster.testCase('Element class tests', {
  setUp: function() {
    this.timeout = 1000;
  },

  'addClass': {
    setUp: function() {
      this.classEmpty = document.getElementById('classEmpty').className;
      this.classSingleExisting = document.getElementById('classSingleExisting').className;
      this.classMultipleExisting = document.getElementById('classMultipleExisting').className;
    },

    tearDown: function() {
      document.getElementById('classEmpty').className = this.classEmpty;
      document.getElementById('classSingleExisting').className = this.classSingleExisting;
      document.getElementById('classMultipleExisting').className = this.classMultipleExisting;
    },

    'addClassEmptyAddSingle': function() {
      Prime.Dom.queryFirst('#classEmpty').
          addClass('new-class');

      var elem = document.getElementById('classEmpty');
      assert.equals(elem.className, 'new-class');
    },

    'addClassEmptyAddMultiple': function() {
      Prime.Dom.queryFirst('#classEmpty').
          addClass('new-class1 new-class2');

      var elem = document.getElementById('classEmpty');
      assert.equals(elem.className, 'new-class1 new-class2');
    },

    'addClassSingleExistingAddOne': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          addClass('existing');

      var elem = document.getElementById('classSingleExisting');
      assert.equals(elem.className, 'existing');
    },

    'addClassSingleExistingAddMultiple': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          addClass('existing new-class');

      var elem = document.getElementById('classSingleExisting');
      assert.equals(elem.className, 'existing new-class');
    },

    'addClassSingleExistingAddMultipleNew': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          addClass('new-class1 new-class2');

      var elem = document.getElementById('classSingleExisting');
      assert.equals(elem.className, 'existing new-class1 new-class2');
    },

    'addClassMultipleExistingAddOne': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('existing1');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3');
    },

    'addClassMultipleExistingAddMultiple': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('existing1 existing2');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3');
    },

    'addClassMultipleExistingAddOneNew': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('existing1 new-class1');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3 new-class1');
    },

    'addClassMultipleExistingAddMultipleNew': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('existing1 new-class1 new-class2');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3 new-class1 new-class2');
    },

    'addClassMultipleExistingAddOnlyOneNew': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('new-class1');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3 new-class1');
    },

    'addClassMultipleExistingAddOnlyMultipleNew': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          addClass('new-class1 new-class2');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2 existing3 new-class1 new-class2');
    }
  },

  'appendTo': {
    tearDown: function() {
      Prime.Dom.query('#appendToSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#appendToMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('appendToSingleElementNew'));
      refute(document.getElementById('appendToMultipleElementNew'));
    },

    'appendToSingleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('appendToSingleElementNew').
          appendTo(document.getElementById('insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    },

    'appendToSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('appendToSingleElementNew').
          appendTo(Prime.Dom.queryFirst('#insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    },

    'appendToMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('appendToMultipleElementNew').
          appendTo(document.getElementById('insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    },

    'appendToMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('appendToMultipleElementNew').
          appendTo(Prime.Dom.queryFirst('#insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    }
  },

  "getAttribute": function() {
    assert.equals(Prime.Dom.queryFirst('#attributes').getAttribute('attr1'), 'value1');
    assert.equals(Prime.Dom.queryFirst('#attributes').getAttribute('attr2'), 'value2');
  },

  'set remove attribute': function() {
    assert.isTrue(Prime.Dom.queryFirst('#attributes').getAttribute('foo') == null);

    Prime.Dom.queryFirst('#attributes').setAttribute('foo', 'bar');
    assert.equals(Prime.Dom.queryFirst('#attributes').getAttribute('foo'), 'bar');

    Prime.Dom.queryFirst('#attributes').removeAttribute('foo');
    assert.isTrue(Prime.Dom.queryFirst('#attributes').getAttribute('foo') == null);
  },

  "getChildren": function() {
    var element = Prime.Dom.queryFirst('#children');
    assert.equals(element.getChildren().length, 4);
  },

  "getClass": function() {
    var element = Prime.Dom.queryByID('getClass');
    assert.equals(element.getClass(), 'class1 class2');
  },

  'getHTML': function() {
    var element = document.getElementById('html');
    element.innerHTML = 'Get test';

    assert.equals(Prime.Dom.queryFirst('#html').getHTML(), 'Get test');
  },

  'getSelectedValues': function() {
    assert.equals(Prime.Dom.queryFirst('#one-checkbox').getSelectedValues(), ['one', 'three']);
    assert.equals(Prime.Dom.queryFirst('#one-radio').getSelectedValues(), ['one']);
    assert.equals(Prime.Dom.queryFirst('#select').getSelectedValues(), ['one', 'three']);
    assert.equals(Prime.Dom.queryFirst('#text').getSelectedValues(), null);
    assert.equals(Prime.Dom.queryFirst('#textarea').getSelectedValues(), null);
  },

  'getStyle': function() {
    assert.equals(Prime.Dom.queryFirst('#style').getStyle('text-align'), 'center');
  },

  'getTagName': function() {
    assert.equals(Prime.Dom.queryFirst('#textContent').getTagName(), 'DIV');
  },

  'getTextContent': function() {
    assert.equals(Prime.Dom.queryFirst('#textContent').getTextContent().trim(), 'Some text with elements.');
  },

  'getValue': function() {
    assert.equals(Prime.Dom.queryFirst('#one-checkbox').getValue(), 'one');
    assert.equals(Prime.Dom.queryFirst('#two-radio').getValue(), 'two');
    assert.equals(Prime.Dom.queryFirst('#select option[value=one]').getValue(), 'one');
    assert.equals(Prime.Dom.queryFirst('#text').getValue(), 'Text value');
    assert.equals(Prime.Dom.queryFirst('#textarea').getValue(), 'Textarea value');
  },

  'hasClass': function() {
    assert.isFalse(Prime.Dom.queryFirst('#hasClassEmpty').hasClass('new-class'));
    assert.isTrue(Prime.Dom.queryFirst('#hasClassSingleExisting').hasClass('existing'));
    assert.isFalse(Prime.Dom.queryFirst('#hasClassSingleExisting').hasClass('not-existing'));
    assert.isTrue(Prime.Dom.queryFirst('#hasClassMultipleExisting').hasClass('existing1 existing2 existing3'));
    assert.isFalse(Prime.Dom.queryFirst('#hasClassMultipleExisting').hasClass('existing')); // This should fail because it isn't a match
    assert.isFalse(Prime.Dom.queryFirst('#hasClassMultipleExisting').hasClass('existing1 fake-class'));
  },

  'hide': function() {
    Prime.Dom.queryFirst('#hide').hide();

    var element = document.getElementById('hide');
    assert.equals(element.style.display, 'none');
  },

  /**
   * Tests inserting a new Element into the DOM after other elements.
   */
  'insertBefore': {
    setUp: function() {
      this.verifyInsertBefore = function(newElement, nextSiblingID, tagName, previousSiblingCount) {
        assert(newElement);
        assert(newElement.nextSibling);
        assert.equals(newElement.nextSibling.id, nextSiblingID);
        assert.equals(newElement.tagName, tagName);
        assert.hasPreviousElementSiblings(newElement, previousSiblingCount);
      };

      this.verifyInsertBeforeFirst = function(newElement, nextSiblingID, tagName) {
        assert(newElement);
        assert(newElement.nextSibling);
        assert.equals(newElement.nextSibling.id, nextSiblingID);
        assert.equals(newElement.tagName, tagName);
        assert.hasPreviousElementSiblings(newElement, 0);
      };
    },

    tearDown: function() {
      Prime.Dom.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#insertMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('insertSingleElementNew'));
      refute(document.getElementById('insertMultipleElementNew'));
    },

    'insertBeforeSingleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertSingleElementNew').
          insertBefore(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertSingleElementNew').
          insertBefore(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    'insertBeforeFirstMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    'insertBeforeFirstMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    'insertBeforeMiddleMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertBeforeMiddleMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertBeforeLastMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    },

    'insertBeforeLastMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertBefore(Prime.Dom.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    },

    'insertBeforeExisting': function() {
      var target = Prime.Dom.queryByID("insertBefore");
      var mover = Prime.Dom.queryByID("insertBeforeMove");

      mover.insertBefore(target);
      var parent = document.getElementById("insertBeforeExisting");
      assert.equals(parent.children[0].id, "insertBeforeMove");
      assert.equals(parent.children[1].id, "insertBefore");
    }
  },

  /**
   * Tests inserting a new Element into the DOM before other elements.
   */
  'insertAfter': {
    setUp: function() {
      this.verifyInsertAfter = function(newElement, previousSiblingID, tagName, nextSiblingCount) {
        assert(newElement);
        assert(newElement.previousSibling);
        assert.equals(newElement.previousSibling.id, previousSiblingID);
        assert.equals(newElement.tagName, tagName);
        assert.hasNextElementSiblings(newElement, nextSiblingCount);
      };

      this.verifyInsertAfterEnd = function(newElement, previousSiblingID, tagName) {
        assert(newElement);
        assert(newElement.previousSibling);
        assert.equals(newElement.previousSibling.id, previousSiblingID);
        assert.equals(newElement.tagName, tagName);
        assert.hasNextElementSiblings(newElement, 0);
      };
    },

    tearDown: function() {
      Prime.Dom.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#insertMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('insertSingleElementNew'));
      refute(document.getElementById('insertMultipleElementNew'));
    },

    'insertAfterSingleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertSingleElementNew').
          insertAfter(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertSingleElementNew').
          insertAfter(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterFirstMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    'insertAfterFirstMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    'insertAfterMiddleMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertAfterMiddleMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertAfterLastMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    },

    'insertAfterLastMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('insertMultipleElementNew').
          insertAfter(Prime.Dom.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    },

    'insertAfterExisting': function() {
      var target = Prime.Dom.queryByID("insertAfter");
      var mover = Prime.Dom.queryByID("insertAfterMove");

      mover.insertAfter(target);
      var parent = document.getElementById("insertAfterExisting");
      assert.equals(parent.children[0].id, "insertAfter");
      assert.equals(parent.children[1].id, "insertAfterMove");
    }
  },

  'insertTextAfter': function() {
    var div = Prime.Dom.queryFirst('#insertTextAfter');
    var a = Prime.Dom.queryFirst('#insertTextAfter a');
    a.insertTextAfter(' foo');
    assert.equals(div.getTextContent().trim(), 'To insert after foo');
  },

  'insertTextBefore': function() {
    var div = Prime.Dom.queryFirst('#insertTextBefore');
    var a = Prime.Dom.queryFirst('#insertTextBefore a');
    a.insertTextBefore('foo ');
    assert.equals(div.getTextContent().trim(), 'foo To insert before');
  },

  isVisible: function() {
    assert.isFalse(Prime.Dom.queryByID('hidden').isVisible());
    assert.isFalse(Prime.Dom.queryByID('display-none').isVisible());
    assert.isTrue(Prime.Dom.queryByID('query').isVisible());
  },

  'prependTo': {
    tearDown: function() {
      Prime.Dom.query('#prependToSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#prependToMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('prependToSingleElementNew'));
      refute(document.getElementById('prependToMultipleElementNew'));
    },

    'prependToSingleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('prependToSingleElementNew').
          prependTo(document.getElementById('insertSingle'));

      var newElement = document.getElementById('prependToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 1);
      assert.equals(findNextElementSibling(newElement).id, 'insertSingleElement');
    },

    'prependToSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('prependToSingleElementNew').
          prependTo(Prime.Dom.queryFirst('#insertSingle'));

      var newElement = document.getElementById('prependToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 1);
      assert.equals(findNextElementSibling(newElement).id, 'insertSingleElement');
    },

    'prependToMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('prependToMultipleElementNew').
          prependTo(document.getElementById('insertMultiple'));

      var newElement = document.getElementById('prependToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 3);
      assert.equals(findNextElementSibling(newElement).id, 'insertMultipleOne');
    },

    'prependToMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
          setID('prependToMultipleElementNew').
          prependTo(Prime.Dom.queryFirst('#insertMultiple'));

      var newElement = document.getElementById('prependToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 3);
      assert.equals(findNextElementSibling(newElement).id, 'insertMultipleOne');
    }
  },

  'removeClass': {
    setUp: function() {
      this.classEmpty = document.getElementById('classEmpty').className;
      this.classSingleExisting = document.getElementById('classSingleExisting').className;
      this.classMultipleExisting = document.getElementById('classMultipleExisting').className;
    },

    tearDown: function() {
      document.getElementById('classEmpty').className = this.classEmpty;
      document.getElementById('classSingleExisting').className = this.classSingleExisting;
      document.getElementById('classMultipleExisting').className = this.classMultipleExisting;
    },

    'removeClassEmptyRemoveSingle': function() {
      Prime.Dom.queryFirst('#classEmpty').
          removeClass('new-class');

      var elem = document.getElementById('classEmpty');
      refute(elem.className);
    },

    'removeClassEmptyRemoveMultiple': function() {
      Prime.Dom.queryFirst('#classEmpty').
          removeClass('new-class1 new-class2');

      var elem = document.getElementById('classEmpty');
      refute(elem.className);
    },

    'removeClassSingleExistingRemoveOne': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          removeClass('existing');

      var elem = document.getElementById('classSingleExisting');
      refute(elem.className);
    },

    'removeClassSingleExistingRemoveMultiple': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          removeClass('existing new-class');

      var elem = document.getElementById('classSingleExisting');
      refute(elem.className);
    },

    'removeClassMultipleExistingRemoveOneFirst': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing1');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing2 existing3');
    },

    'removeClassMultipleExistingRemoveOneMiddle': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing2');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing3');
    },

    'removeClassMultipleExistingRemoveOneLast': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing3');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1 existing2');
    },

    'removeClassMultipleExistingRemoveMultipleFirstMiddle': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing1 existing2');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing3');
    },

    'removeClassMultipleExistingRemoveMultipleMiddleLast': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing2 existing3');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing1');
    },

    'removeClassMultipleExistingRemoveMultipleFirstLast': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing1 existing3');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing2');
    },

    'removeClassMultipleExistingRemoveMultipleLastFirst': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing3 existing1');

      var elem = document.getElementById('classMultipleExisting');
      assert.equals(elem.className, 'existing2');
    },

    'removeClassMultipleExistingRemoveMultipleAll': function() {
      Prime.Dom.queryFirst('#classMultipleExisting').
          removeClass('existing2 existing3 existing1');

      var elem = document.getElementById('classMultipleExisting');
      refute(elem.className);
    },

    'removeClassNonExistingSingle': function() {
      Prime.Dom.queryFirst('#classSingleExisting').
          removeClass('non-existing');

      var elem = document.getElementById('classSingleExisting');
      assert.equals(elem.className, 'existing');
    }

  },

  'setHTML': function() {
    Prime.Dom.queryFirst('#html').setHTML('Changed');

    var element = document.getElementById('html');
    assert.equals(element.innerHTML, 'Changed');
  },

  'setHTMLByElement': function() {
    Prime.Dom.queryFirst('#htmlByElement').setHTML(Prime.Dom.queryByID("htmlByElementTarget"));

    var element = document.getElementById('htmlByElement');
    assert.equals(element.innerHTML, 'By Element Target');
  },

  'setAttributes': function() {
    Prime.Dom.queryByID('set-attributes').setAttributes({'rel': 'foo', 'width': '10%'});

    var element = document.getElementById('set-attributes');
    assert(element != null);
    assert.equals(element.attributes.getNamedItem('rel').value, 'foo');
    assert.equals(element.attributes.getNamedItem('width').value, '10%');
  },

  'setHeight': function() {
    var element = Prime.Dom.queryByID('set-styles').setHeight(10);
    assert.equals(element.getStyle('height'), '10px');
    assert.equals(element.getHeight(), 10);

    element.setHeight('10em');
    assert.equals(element.getStyle('height'), '10em');
    assert.isTrue(element.getHeight() > 0); // Just make sure it doesn't throw since the computed style is always in pixels
  },

  'setLeft': function() {
    var element = Prime.Dom.queryByID('set-styles').setLeft(10);
    assert.equals(element.getStyle('left'), '10px');

    element.setLeft('10em');
    assert.equals(element.getStyle('left'), '10em');
  },

  'setStyles': function() {
    Prime.Dom.queryByID('set-styles').setStyles({'text-align': 'right', 'width': '10%'});

    var element = document.getElementById('set-styles');
    assert(element != null);
    assert.equals(element.style['text-align'], 'right');
    assert.equals(element.style['width'], '10%');
  },

  'setTop': function() {
    var element = Prime.Dom.queryByID('set-styles').setTop(10);
    assert.equals(element.getStyle('top'), '10px');

    element = element.setTop('10em');
    assert.equals(element.getStyle('top'), '10em');
  },

  'setWidth': function() {
    var element = Prime.Dom.queryByID('set-styles').setWidth(10);
    assert.equals(element.getStyle('width'), '10px');
    assert.equals(element.getWidth(), 10);

    element.setWidth('10em');
    assert.equals(element.getStyle('width'), '10em');
    assert.isTrue(element.getWidth() > 0); // Just make sure it doesn't throw since the computed style is always in pixels
  },

  'show': function() {
    // Test inline styles with show. This should end up empty string
    Prime.Dom.queryFirst('#show').show();

    var element = document.getElementById('show');
    assert.equals(element.style.display, '');

    // Test computed style is block, so this should also end up empty string.
    Prime.Dom.queryFirst('#hide').hide();
    Prime.Dom.queryFirst('#hide').show();

    element = document.getElementById('hide');
    assert.equals(element.style.display, '');

    // Test a stylesheet display: none and guessing it is a block element
    Prime.Dom.queryFirst('#showCSSBlock').hide();
    Prime.Dom.queryFirst('#showCSSBlock').show();

    element = document.getElementById('showCSSBlock');
    assert.equals(element.style.display, 'block');

    // Test a stylesheet display: none and guessing it is a inline element
    Prime.Dom.queryFirst('#showCSSInline').hide();
    Prime.Dom.queryFirst('#showCSSInline').show();

    element = document.getElementById('showCSSInline');
    assert.equals(element.style.display, 'inline');

    // Test a stylesheet display: none and then forcing it to be inline-block via the parameter
    Prime.Dom.queryFirst('#showCSSInline').hide();
    Prime.Dom.queryFirst('#showCSSInline').show('table-cell');

    element = document.getElementById('showCSSInline');
    assert.equals(element.style.display, 'table-cell');
  },

  'eventsUsingFunction': function() {
    var called = false;
    var called2 = false;
    var memo = null;
    var memo2 = null;
    var handler = function(event) {
      called = true;
      memo = event.memo;
    };
    var handler2 = function(event) {
      called2 = true;
      memo2 = event.memo;
    };

    // Single handlers
    var element = Prime.Dom.queryFirst('#event').
        addEventListener('click', handler).
        fireEvent('click', 'memo');

    assert.isTrue(called);
    assert.isFalse(called2);
    assert.equals(memo, 'memo');
    assert.equals(memo2, null);

    called = false;
    memo = null;
    element.
        removeEventListener('click', handler).
        fireEvent('click', 'memo');

    assert.isFalse(called);
    assert.isFalse(called2);
    assert.equals(memo, null);
    assert.equals(memo2, null);

    // Multiple handlers
    element.
        addEventListener('click', handler).
        addEventListener('click', handler2).
        fireEvent('click', 'memo');

    assert.isTrue(called);
    assert.isTrue(called2);
    assert.equals(memo, 'memo');
    assert.equals(memo2, 'memo');

    // Remove all
    called = false;
    called2 = false;
    memo = null;
    memo2 = null;
    element.
        removeAllEventListeners().
        fireEvent('click', 'memo');

    assert.isFalse(called);
    assert.isFalse(called2);
    assert.equals(memo, null);
    assert.equals(memo2, null);
  },

  'eventsUsingObject': function() {
    var MyEventListener = function() {
      this.called = false;
      this.memo = null;
    };
    MyEventListener.prototype = {
      handle: function(event) {
        this.called = true;
        this.memo = event.memo;
      }
    };

    var instance = new MyEventListener();
    Prime.Dom.queryFirst('#event').
        addEventListener('click', instance.handle, instance).
        fireEvent('click', 'memo');

    assert.isTrue(instance.called);
    assert.equals(instance.memo, 'memo');

    instance.called = false;
    instance.memo = null;
    Prime.Dom.queryFirst('#event').
        removeEventListener('click', instance.handle).
        fireEvent('click', 'memo');

    assert.isFalse(instance.called);
    assert.equals(instance.memo, null);
  },

  'customEvents': function() {
    var MyEventListener = function() {
      this.called = false;
      this.memo = null;
      this.event = null;
    };
    MyEventListener.prototype = {
      handle: function(evt) {
        this.called = true;
        this.memo = evt.memo;
        this.event = evt.event;
      }
    };

    var instance = new MyEventListener();
    Prime.Dom.queryFirst('#event').
        addEventListener('custom:pop', instance.handle, instance).
        fireEvent('custom:pop', 'foo');

    assert.isTrue(instance.called);
    assert.equals(instance.event, 'custom:pop');
    assert.equals(instance.memo, 'foo');

    instance.called = false;
    instance.memo = null;
    instance.event = null;
    Prime.Dom.queryFirst('#event').
        removeEventListener('custom:pop', instance.handle).
        fireEvent('custom:pop', 'foo');

    assert.isFalse(instance.called);
    assert.equals(instance.event, null);
    assert.equals(instance.memo, null);
  },

  'opacity': function() {
    var element = Prime.Dom.queryFirst('#html');
    console.log("Test");
    console.log(element.getOpacity());
    assert.equals(element.getOpacity(), 1.0);

    element.setOpacity(0.5);
    assert.equals(element.getOpacity(), 0.5);
  }
});

buster.testCase('Prime.Dom.Document', {
  'addEventListener': function() {
    var MyEventListener = function() {
      this.called = false;
      this.memo = null;
    };
    MyEventListener.prototype = {
      handle: function(evt) {
        this.called = true;
        this.memo = evt.memo;
        this.event = evt.type;
      }
    };

    var instance = new MyEventListener();
    Prime.Dom.Document.addEventListener('click', instance.handle, instance);

    Prime.Dom.queryFirst('#html').fireEvent('click', 'foo');
    assert(instance.called);
    assert.equals(instance.event, 'click');
    assert.equals(instance.memo, 'foo');
  },

  'getHeight': function() {
    var height = Prime.Dom.Document.getHeight();
    assert.isTrue(height > 400);
    assert.isTrue(height > Prime.Window.getInnerHeight());
  },

  'getWidth': function() {
    var width = Prime.Dom.Document.getWidth();
    assert.isTrue(width > 400);
//    console.log('Document width is ' + width + ' and window inner width is ' + Prime.Window.getInnerWidth());
//    assert.isTrue(width >= Prime.Window.getInnerWidth());
  },

  'removeEventListener': function() {
    var MyEventListener = function() {
      this.called = false;
      this.memo = null;
      this.event = null;
    };
    MyEventListener.prototype = {
      handle: function(evt) {
        this.called = true;
        this.memo = evt.memo;
        this.event = evt.type;
      }
    };

    var instance = new MyEventListener();
    var proxy = Prime.Dom.Document.addEventListener('click', instance.handle, instance);

    Prime.Dom.queryFirst('#html').fireEvent('click', 'foo');
    assert(instance.called);
    assert.equals(instance.event, 'click');
    assert.equals(instance.memo, 'foo');

    instance.called = false;
    instance.memo = null;
    instance.event = null;

    Prime.Dom.Document.removeEventListener('click', proxy);
    Prime.Dom.queryFirst('#html').fireEvent('click', 'foo');
    assert(!instance.called);
    assert.equals(instance.event, null);
    assert.equals(instance.memo, null);
  }
});


buster.testCase('Prime.Dom.Template', {
  'generate with no replaces': function() {
    var template = new Prime.Dom.Template("<span>foo</span>");
    var string = template.generate();
    assert.equals(string, '<span>foo</span>');
  },

  'generate with simple key replacement': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var string = template.generate({'foo': 'bar'});
    assert.equals(string, '<span>bar</span>');
  },

  'generate with simple function replacement': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var string = template.generate({'foo': function() {
      return 'baz'
    }});
    assert.equals(string, '<span>baz</span>');
  },

  'generate with multiple times replacement': function() {
    var template = new Prime.Dom.Template("<span>#{foo}#{foo}</span>");
    var string = template.generate({'foo': 'waldo'});
    assert.equals(string, '<span>waldowaldo</span>');
  },

  'generate with multiple key replacement': function() {
    var template = new Prime.Dom.Template("<span>#{foo} #{bar}</span>");
    var string = template.generate({'foo': 'where\'s', 'bar': 'waldo?' });
    assert.equals(string, '<span>where\'s waldo?</span>');
  },

  'generate with regex key': function() {
    var template = new Prime.Dom.Template("<span>69!</span>");
    var string = template.generate({"/\\d+/": "number blocked"});
    assert.equals(string, '<span>number blocked!</span>');
  },

  'append': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var container = Prime.Dom.newElement("<div/>");
    template.appendTo(container, {'foo': 'bar'});
    assert.equals(container.getHTML(), '<span>bar</span>');
  },

  'appendMultiple': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var container = Prime.Dom.newElement("<div/>");
    template.appendTo(container, {'foo': 'bar'});
    template.appendTo(container, {'foo': 'baz'});
    assert.equals(container.getHTML(), '<span>bar</span><span>baz</span>');
  },

  'insertBefore': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var target = Prime.Dom.queryByID("templateInsertBefore");

    template.insertBefore(target, {'foo': 'bar'});
    assert.equals(target.domElement.parentNode.children[0].innerText, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerText, '');
  },

  'insertBeforeMultiple': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var target = Prime.Dom.queryByID("templateInsertBeforeMultiple");

    template.insertBefore(target, {'foo': 'bar'});
    template.insertBefore(target, {'foo': 'baz'});
    assert.equals(target.domElement.parentNode.children[0].innerText, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerText, 'baz');
    assert.equals(target.domElement.parentNode.children[2].innerText, '');
  },

  'insertAfter': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var target = Prime.Dom.queryByID("templateInsertAfter");

    template.insertAfter(target, {'foo': 'bar'});
    assert.equals(target.domElement.parentNode.children[0].innerText, '');
    assert.equals(target.domElement.parentNode.children[1].innerText, 'bar');
  },

  'insertAfterMultiple': function() {
    var template = new Prime.Dom.Template("<span>#{foo}</span>");
    var target = Prime.Dom.queryByID("templateInsertBeforeAfter");

    template.insertAfter(target, {'foo': 'bar'});
    template.insertAfter(target, {'foo': 'baz'});
    assert.equals(target.domElement.parentNode.children[2].innerText, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerText, 'baz');
    assert.equals(target.domElement.parentNode.children[0].innerText, '');
  }

});
