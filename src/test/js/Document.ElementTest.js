/*
 * Copyright (c) 2012-2015, Inversoft Inc., All Rights Reserved
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
function findPreviousElementSibling(element) {
  var sibling = element.previousSibling;
  while (sibling && sibling.nodeType !== 1) {
    sibling = sibling.previousSibling;
  }

  return sibling;
}

function findNextElementSibling(element) {
  var sibling = element.nextSibling;
  while (sibling && sibling.nodeType !== 1) {
    sibling = sibling.nextSibling;
  }

  return sibling;
}

chai.util.addMethod(assert, 'hasNextElementSiblings',
    function(element, number) {
      this.actualCount = 0;
      var sibling = element.nextSibling;
      while (sibling) {
        if (sibling.nodeType === 1) {
          this.actualCount++;
        }
        sibling = sibling.nextSibling;
      }

      assert.strictEqual(this.actualCount, number, 'Expected sibling count was not equal to actual count.');
    });

chai.util.addMethod(assert, 'hasPreviousElementSiblings',
    function(element, number) {
      this.actualCount = 0;
      var sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === 1) {
          this.actualCount++;
        }
        sibling = sibling.previousSibling;
      }

      assert.strictEqual(this.actualCount, number, 'Expected previous sibling count was not equal to actual count.');
    });


describe('Element class tests', function() {
  describe('addClass', function() {

    beforeEach(function() {
      this.classEmpty = document.getElementById('classEmpty').className;
      this.classSingleExisting = document.getElementById('classSingleExisting').className;
      this.classMultipleExisting = document.getElementById('classMultipleExisting').className;
    });


    afterEach(function() {
      document.getElementById('classEmpty').className = this.classEmpty;
      document.getElementById('classSingleExisting').className = this.classSingleExisting;
      document.getElementById('classMultipleExisting').className = this.classMultipleExisting;
    });

    it('addClassEmptyAddSingle', function() {
      var elem = document.getElementById('classEmpty');
      Prime.Document.queryFirst('#classEmpty').addClass('new-class');
      assert.equal(elem.className, 'new-class');
    });

    it('addClassEmptyAddMultiple', function() {
      var elem = document.getElementById('classEmpty');
      Prime.Document.queryFirst('#classEmpty').addClass('new-class1 new-class2');
      assert.equal(elem.className, 'new-class1 new-class2');
    });

    it('addClassSingleExistingAddOne', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').addClass('existing');
      assert.equal(elem.className, 'existing');
    });

    it('addClassSingleExistingAddMultiple', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').addClass('existing new-class');
      assert.equal(elem.className, 'existing new-class');
    });

    it('addClassSingleExistingAddMultipleNew', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').addClass('new-class1 new-class2');
      assert.equal(elem.className, 'existing new-class1 new-class2');
    });

    it('addClassMultipleExistingAddOneAlreadyExists', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing1');
      assert.equal(elem.className, 'existing1 existing2 existing3');
    });

    it('addClassMultipleExistingAddOneSubstring', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing');
      assert.equal(elem.className, 'existing1 existing2 existing3 existing');
    });

    it('addClassMultipleExistingAddOneSuperstring', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing11');
      assert.equal(elem.className, 'existing1 existing2 existing3 existing11');
    });

    it('addClassMultipleExistingAddMultiple', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing1 existing2');
      assert.equal(elem.className, 'existing1 existing2 existing3');
    });

    it('addClassMultipleExistingAddOneNew', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing1 new-class1');
      assert.equal(elem.className, 'existing1 existing2 existing3 new-class1');
    });

    it('addClassMultipleExistingAddMultipleNew', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('existing1 new-class1 new-class2');
      assert.equal(elem.className, 'existing1 existing2 existing3 new-class1 new-class2');
    });

    it('addClassMultipleExistingAddOnlyOneNew', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('new-class1');
      assert.equal(elem.className, 'existing1 existing2 existing3 new-class1');
    });

    it('addClassMultipleExistingAddOnlyMultipleNew', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').addClass('new-class1 new-class2');
      assert.equal(elem.className, 'existing1 existing2 existing3 new-class1 new-class2');
    });
  });

  describe('appendElement', function() {
    before(function() {
      var element = Prime.Document.newElement('<p/>')
          .setId('appendElementNew')
          .appendTo(document.body);
      element.setHTML('Hello world<strong>!</strong>');
    });

    after(function() {
      Prime.Document.queryById('appendElementNew').removeFromDOM();
    });

    it('appendElementPrimeElement', function() {
      var newElement = Prime.Document.queryById('appendElementNew');
      Prime.Document.queryById('insertSingle').appendElement(newElement);

      var element = Prime.Document.queryById('insertSingle');
      assert.equal(element.getTagName(), 'DIV');
      assert.equal(element.getChildren().length, 2);
      assert.equal(element.getChildren()[0].getId(), 'insertSingleElement');
      assert.equal(element.getChildren()[0].getTagName(), 'DIV');
      assert.equal(element.getChildren()[1].getId(), 'appendElementNew');
      assert.equal(element.getChildren()[1].getTagName(), 'P');
      assert.equal(element.getChildren()[1].getTextContent(), 'Hello world!');
      assert.equal(element.getChildren()[1].getChildren().length, 1);
      assert.equal(element.getChildren()[1].getChildren()[0].getTagName(), 'STRONG');
      assert.equal(element.getChildren()[1].getChildren()[0].getTextContent(), '!');
    });

    it('appendElementNode', function() {
      Prime.Document.queryById('insertSingle').appendElement(document.getElementById('appendElementNew'));

      var element = Prime.Document.queryById('insertSingle');
      assert.equal(element.getTagName(), 'DIV');
      assert.equal(element.getChildren().length, 2);
      assert.equal(element.getChildren()[0].getId(), 'insertSingleElement');
      assert.equal(element.getChildren()[0].getTagName(), 'DIV');
      assert.equal(element.getChildren()[1].getId(), 'appendElementNew');
      assert.equal(element.getChildren()[1].getTagName(), 'P');
      assert.equal(element.getChildren()[1].getTextContent(), 'Hello world!');
      assert.equal(element.getChildren()[1].getChildren().length, 1);
      assert.equal(element.getChildren()[1].getChildren()[0].getTagName(), 'STRONG');
      assert.equal(element.getChildren()[1].getChildren()[0].getTextContent(), '!');
    });
  });

  describe('appendHTML', function() {
    after(function() {
      Prime.Document.query('#appendHTMLNew').removeAllFromDOM();
    });

    it('appendHTML', function() {
      Prime.Document.queryById('insertSingle').appendHTML('<p id="appendHTMLNew">Hello world<strong>!</strong></p>');

      var element = Prime.Document.queryById('insertSingle');
      assert.equal(element.getTagName(), 'DIV');
      assert.equal(element.getChildren().length, 2);
      assert.equal(element.getChildren()[0].getId(), 'insertSingleElement');
      assert.equal(element.getChildren()[0].getTagName(), 'DIV');
      assert.equal(element.getChildren()[1].getTagName(), 'P');
      assert.equal(element.getChildren()[1].getTextContent(), 'Hello world!');
      assert.equal(element.getChildren()[1].getChildren().length, 1);
      assert.equal(element.getChildren()[1].getChildren()[0].getTagName(), 'STRONG');
      assert.equal(element.getChildren()[1].getChildren()[0].getTextContent(), '!');
    });
  });

  describe('appendTo', function() {
    afterEach(function() {
      Prime.Document.query('#appendToSingleElementNew').removeAllFromDOM();
      Prime.Document.query('#appendToMultipleElementNew').removeAllFromDOM();
      assert.notExists(document.getElementById('appendToSingleElementNew'));
      assert.notExists(document.getElementById('appendToMultipleElementNew'));
    });

    it('appendToSingleDOMElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('appendToSingleElementNew')
          .appendTo(document.getElementById('insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equal(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    });

    it('appendToSinglePrimeElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('appendToSingleElementNew')
          .appendTo(Prime.Document.queryFirst('#insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equal(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    });

    it('appendToMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('appendToMultipleElementNew')
          .appendTo(document.getElementById('insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equal(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    });

    it('appendToMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('appendToMultipleElementNew')
          .appendTo(Prime.Document.queryFirst('#insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equal(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    });
  });

  it('getAbsoluteElement', function() {
    assert.exists(Prime.Document.queryById('absolute-top-element').getAbsoluteTop() > 0);
  });

  it('getAttribute', function() {
    assert.equal(Prime.Document.queryFirst('#attributes').getAttribute('attr1'), 'value1');
    assert.equal(Prime.Document.queryFirst('#attributes').getAttribute('attr2'), 'value2');
  });

  it('getAttributes', function() {
    assert.deepEqual(Prime.Document.queryFirst('#attributes').getAttributes(), {
      attr1: 'value1',
      attr2: 'value2',
      id: 'attributes'
    });
  });

  it('set remove attribute', function() {
    assert.isNull(Prime.Document.queryFirst('#attributes').getAttribute('foo'));

    Prime.Document.queryFirst('#attributes').setAttribute('foo', 'bar');
    assert.equal(Prime.Document.queryFirst('#attributes').getAttribute('foo'), 'bar');

    Prime.Document.queryFirst('#attributes').removeAttribute('foo');
    assert.isNull(Prime.Document.queryFirst('#attributes').getAttribute('foo'));
  });

  it('getChildren', function() {
    var element = Prime.Document.queryFirst('#children');
    assert.equal(element.getChildren().length, 4);
  });

  it('getChildren with selector', function() {
    var element = Prime.Document.queryFirst('#children');
    assert.equal(element.getChildren('.foo').length, 2);
  });

  it('getClass', function() {
    var element = Prime.Document.queryById('getClass');
    assert.equal(element.getClass(), 'class1 class2');
  });

  it('getCoordinates', function() {
    var coordinates = Prime.Document.queryById("getCoordinates-absolute").getCoordinates();
    // We can't assume left is positive if the left is -15px and the margin is undefined. (Relative left coord could be anything)
    // assert.isTrue(coordinates.left > 0);
    assert.isTrue(coordinates.top > 0);

    coordinates = Prime.Document.queryById("getCoordinates-fixed").getCoordinates();
    assert.equal(coordinates.left, -15);
    assert.equal(coordinates.top, -15);
  });

  it('getDataAttribute', function() {
    assert.equal(Prime.Document.queryFirst('#dataset').getDataAttribute('attr1'), 'value1');
    assert.equal(Prime.Document.queryFirst('#dataset').getDataAttribute('attr2'), 'value2');
    assert.equal(Prime.Document.queryFirst('#dataset').getDataAttribute('camelCase'), 'valueCamelCase');
    assert.equal(Prime.Document.queryFirst('#dataset').getDataAttribute('portato'), null);
  });

  it('getDataSet', function() {
    assert.equal(Prime.Document.queryFirst('#dataset').getDataSet().attr1, 'value1');
    assert.equal(Prime.Document.queryFirst('#dataset').getDataSet().attr2, 'value2');
    assert.equal(Prime.Document.queryFirst('#dataset').getDataSet().camelCase, 'valueCamelCase');
  });

  it('getFirstChild', function() {
    var element = Prime.Document.queryFirst('#children');
    assert.isTrue(element.getFirstChild().is('div.child-one'));
    assert.isTrue(element.getFirstChild('.foo').is('div.foo'));
    assert.isNull(element.getFirstChild('.no-match'));
    assert.isNull(element.getFirstChild().getFirstChild());
  });

  it('getHTML', function() {
    var element = document.getElementById('html');
    element.innerHTML = 'Get test';

    assert.equal(Prime.Document.queryFirst('#html').getHTML(), 'Get test');
  });

  it('getLastChild', function() {
    var element = Prime.Document.queryFirst('#children');
    assert.isTrue(element.getLastChild().is('div.foo'));
    assert.isTrue(element.getLastChild('.child-one').is('div.child-one'));
    assert.isNull(element.getLastChild('.no-match'));
    assert.isNull(element.getLastChild().getLastChild());
  });

  it('getNextSibling', function() {
    assert.equal(Prime.Document.queryFirst('#queryOne').getNextSibling().getId(), 'queryTwo');
    assert.equal(Prime.Document.queryFirst('#queryTwo').getNextSibling().getId(), 'queryThree');
    assert.isNull(Prime.Document.queryFirst('#queryThree').getNextSibling());
  });

  it('getOptions', function() {
    var options = Prime.Document.queryById('select-single-select').getOptions();
    assert.equal(options.length, 3);
    assert.equal(options[0].getValue(), 'one');
    assert.equal(options[1].getValue(), 'two');
    assert.equal(options[2].getValue(), 'three');
  });

  it('getOuterHTML', function() {
    var element = Prime.Document.newElement('<div>').setId('getOuterHTML');
    var body = new Prime.Document.Element(document.body);
    body.appendElement(element);

    element = Prime.Document.queryById('getOuterHTML');
    element.setHTML('these pretzels are making me thirsty.');

    assert.equal(element.getOuterHTML(), '<div id="getOuterHTML">these pretzels are making me thirsty.</div>');
    assert.equal(element.getOuterHTML(), element.domElement.outerHTML);
  });

  it('getPreviousSibling', function() {
    assert.isNull(Prime.Document.queryFirst('#queryOne').getPreviousSibling());
    assert.equal(Prime.Document.queryFirst('#queryTwo').getPreviousSibling().getId(), 'queryOne');
    assert.equal(Prime.Document.queryFirst('#queryThree').getPreviousSibling().getId(), 'queryTwo');
  });

  it('getSelectedTexts', function() {
    assert.isNull(Prime.Document.queryFirst('#one-checkbox').getSelectedTexts());
    assert.isNull(Prime.Document.queryFirst('#one-radio').getSelectedTexts());
    assert.isNull(Prime.Document.queryFirst('#text').getSelectedTexts());
    assert.isNull(Prime.Document.queryFirst('#textarea').getSelectedTexts());
    assert.deepEqual(Prime.Document.queryFirst('#select').getSelectedTexts(), ['One', 'Three']);
  });

  it('getSelectedValues', function() {
    assert.deepEqual(Prime.Document.queryFirst('#one-checkbox').getSelectedValues(), ['one', 'three']);
    assert.deepEqual(Prime.Document.queryFirst('#one-checkbox-special-char').getSelectedValues(), ['one', 'three']);
    assert.deepEqual(Prime.Document.queryFirst('#one-radio').getSelectedValues(), ['one']);
    assert.deepEqual(Prime.Document.queryFirst('#select').getSelectedValues(), ['one', 'three']);
    assert.isNull(Prime.Document.queryFirst('#text').getSelectedValues());
    assert.isNull(Prime.Document.queryFirst('#textarea').getSelectedValues());
  });

  it('getStyle', function() {
    assert.equal(Prime.Document.queryFirst('#style').getStyle('text-align'), 'center');
  });

  it('getTagName', function() {
    assert.equal(Prime.Document.queryFirst('#textContent').getTagName(), 'DIV');
  });

  it('getTextContent', function() {
    assert.equal(Prime.Document.queryFirst('#textContent').getTextContent().trim(), 'Some text with elements.');
  });

  it('getValue', function() {
    assert.equal(Prime.Document.queryFirst('#one-checkbox').getValue(), 'one');
    assert.equal(Prime.Document.queryFirst('#two-radio').getValue(), 'two');
    assert.equal(Prime.Document.queryFirst('#select option[value=one]').getValue(), 'one');
    assert.equal(Prime.Document.queryFirst('#text').getValue(), 'Text value');
    assert.equal(Prime.Document.queryFirst('#textarea').getValue(), 'Textarea value');
  });

  it('hasClass', function() {
    assert.isFalse(Prime.Document.queryFirst('#hasClassEmpty').hasClass('new-class'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassSingleExisting').hasClass('existing'));
    assert.isFalse(Prime.Document.queryFirst('#hasClassSingleExisting').hasClass('not-existing'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing1'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing2'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing3'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing1 existing2'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing1 existing3'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing2 existing1'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing2 existing3'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing3 existing1'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing3 existing2'));
    assert.isTrue(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing1 existing2 existing3'));
    assert.isFalse(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing')); // This should fail because it isn't a match
    assert.isFalse(Prime.Document.queryFirst('#hasClassMultipleExisting').hasClass('existing1 fake-class'));
  });

  it('hide', function() {
    Prime.Document.queryFirst('#hide').hide();

    var element = document.getElementById('hide');
    assert.equal(element.style.display, 'none');
  });

  /**
   * Tests .is(selector)
   */
  it('is', function() {
    assert.isTrue(Prime.Document.queryFirst('#is-test td').is('td'));
    assert.isTrue(Prime.Document.queryFirst('#is-test tr').is('tr'));
    assert.isTrue(Prime.Document.queryFirst('#is-test textarea').is('textarea'));
    assert.isTrue(Prime.Document.queryFirst('#is-test input').is('input'));
    assert.isTrue(Prime.Document.queryFirst('#is-test input[name=is-test]').is('input'));
    assert.isFalse(Prime.Document.queryFirst('#is-test tr').is('td'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.foo').is('div'));
    assert.isFalse(Prime.Document.queryFirst('#is-test div.foo').is('div.bar'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.foo.bar').is('div'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.foo.bar').is('div.foo'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.foo.bar').is('div.foo.bar'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.display-none').is('div.display-none'));
    assert.isTrue(Prime.Document.queryFirst('#is-test div.display-none').is('div'));
    assert.isFalse(Prime.Document.queryFirst('#is-test div.display-none').is('div.bar'));
    assert.isFalse(Prime.Document.queryFirst('#is-test div.display-none').is('td'));

    var element1 = Prime.Document.queryFirst('div');
    assert.isTrue(element1.is('div'));

    var element2 = Prime.Document.queryFirst('a');
    assert.isTrue(element2.is('a'));

    var element3 = Prime.Document.queryFirst('div.foo.bar');
    assert.isTrue(element3.is('.foo'));
    assert.isTrue(element3.is('.bar'));
    assert.isTrue(element3.is('.foo.bar'));
    assert.isTrue(element3.is('.bar.foo'));

    assert.isFalse(element3.is('.div'));
    assert.isFalse(element3.is('.baz'));
    assert.isFalse(element3.is('a'));
    assert.isFalse(element3.is('span'));

    var element4 = Prime.Document.queryFirst('#is-test textarea', element4);
    assert.isTrue(element4.is('textarea'));
    assert.isTrue(element4.is('td textarea'));
    assert.isTrue(element4.is('tr td textarea'));
    assert.isTrue(element4.is('table tr td textarea'));
    assert.isTrue(element4.is('#is-test table tr td textarea'));
    assert.isTrue(element4.is('#is-test > table tr td textarea'));
    assert.isFalse(element4.is('div > textarea'));
    assert.isFalse(element4.is('a > textarea'));
    assert.isFalse(element4.is('body > textarea'));
    assert.isFalse(element4.is('input'));
    assert.isFalse(element4.is('a'));
  });

  /**
   * Tests the isInside function.
   */
  it('isInside', function() {
    var outer = Prime.Document.queryById('query');
    var inner1 = Prime.Document.queryById('queryOne');
    var inner2 = Prime.Document.queryById('queryTwo');
    var inner3 = Prime.Document.queryById('queryThree');
    assert.isTrue(inner1.isInside(outer));
    assert.isTrue(inner2.isInside(outer));
    assert.isTrue(inner3.isInside(outer));
    assert.isFalse(inner1.isInside(inner2));
    assert.isFalse(inner1.isInside(inner3));
    assert.isFalse(inner2.isInside(inner1));
    assert.isFalse(inner2.isInside(inner3));
    assert.isFalse(inner3.isInside(inner1));
    assert.isFalse(inner3.isInside(inner2));
  });

  /**
   * Tests inserting a new Element into the DOM after other elements.
   */
  describe('insertBefore', function() {
    beforeEach(function() {
      this.verifyInsertBefore = function(newElement, nextSiblingID, tagName, previousSiblingCount) {
        assert.exists(newElement);
        assert.exists(newElement.nextSibling);
        assert.equal(newElement.nextSibling.id, nextSiblingID);
        assert.equal(newElement.tagName, tagName);
        assert.hasPreviousElementSiblings(newElement, previousSiblingCount);
      };

      this.verifyInsertBeforeFirst = function(newElement, nextSiblingID, tagName) {
        assert.exists(newElement);
        assert.exists(newElement.nextSibling);
        assert.equal(newElement.nextSibling.id, nextSiblingID);
        assert.equal(newElement.tagName, tagName);
        assert.hasPreviousElementSiblings(newElement, 0);
      };
    });

    afterEach(function() {
      Prime.Document.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Document.query('#insertMultipleElementNew').removeAllFromDOM();
      assert.notExists(document.getElementById('insertSingleElementNew'));
      assert.notExists(document.getElementById('insertMultipleElementNew'));
    });

    it('insertBeforeSingleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertSingleElementNew').insertBefore(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    });

    it('insertAfterSinglePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertSingleElementNew').insertBefore(Prime.Document.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    });

    it('insertBeforeFirstMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    });

    it('insertBeforeFirstMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(Prime.Document.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    });

    it('insertBeforeMiddleMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    });

    it('insertBeforeMiddleMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(Prime.Document.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    });

    it('insertBeforeLastMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    });

    it('insertBeforeLastMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertBefore(Prime.Document.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    });

    it('insertBeforeExisting', function() {
      var target = Prime.Document.queryById('insertBefore');
      var mover = Prime.Document.queryById('insertBeforeMove');

      mover.insertBefore(target);
      var parent = document.getElementById('insertBeforeExisting');
      assert.equal(parent.children[0].id, 'insertBeforeMove');
      assert.equal(parent.children[1].id, 'insertBefore');
    });
  });

  /**
   * Tests inserting a new Element into the DOM before other elements.
   */
  describe('insertAfter', function() {
    beforeEach(function() {
      this.verifyInsertAfter = function(newElement, previousSiblingID, tagName, nextSiblingCount) {
        assert.exists(newElement);
        assert.exists(newElement.previousSibling);
        assert.equal(newElement.previousSibling.id, previousSiblingID);
        assert.equal(newElement.tagName, tagName);
        assert.hasNextElementSiblings(newElement, nextSiblingCount);
      };

      this.verifyInsertAfterEnd = function(newElement, previousSiblingID, tagName) {
        assert.exists(newElement);
        assert.exists(newElement.previousSibling);
        assert.equal(newElement.previousSibling.id, previousSiblingID);
        assert.equal(newElement.tagName, tagName);
        assert.hasNextElementSiblings(newElement, 0);
      };
    });

    afterEach(function() {
      Prime.Document.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Document.query('#insertMultipleElementNew').removeAllFromDOM();
      assert.notExists(document.getElementById('insertSingleElementNew'));
      assert.notExists(document.getElementById('insertMultipleElementNew'));
    });

    it('insertAfterSingleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertSingleElementNew').insertAfter(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    });

    it('insertAfterSinglePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertSingleElementNew').insertAfter(Prime.Document.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    });

    it('insertAfterFirstMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    });

    it('insertAfterFirstMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(Prime.Document.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    });

    it('insertAfterMiddleMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    });

    it('insertAfterMiddleMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(Prime.Document.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    });

    it('insertAfterLastMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    });

    it('insertAfterLastMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>').setId('insertMultipleElementNew').insertAfter(Prime.Document.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    });

    it('insertAfterExisting', function() {
      var target = Prime.Document.queryById('insertAfter');
      var mover = Prime.Document.queryById('insertAfterMove');

      mover.insertAfter(target);
      var parent = document.getElementById('insertAfterExisting');
      assert.equal(parent.children[0].id, 'insertAfter');
      assert.equal(parent.children[1].id, 'insertAfterMove');
    });
  });

  it('insertTextAfter', function() {
    var div = Prime.Document.queryFirst('#insertTextAfter');
    var a = Prime.Document.queryFirst('#insertTextAfter a');
    a.insertTextAfter(' foo');
    assert.equal(div.getTextContent().trim(), 'To insert after foo');
  });

  it('insertTextBefore', function() {
    var div = Prime.Document.queryFirst('#insertTextBefore');
    var a = Prime.Document.queryFirst('#insertTextBefore a');
    a.insertTextBefore('foo ');
    assert.equal(div.getTextContent().trim(), 'foo To insert before');
  });

  it('isChildOf', function() {
    var nested1 = Prime.Document.queryById('nested1');
    assert.isFalse(Prime.Document.queryById('nested1').isChildOf(nested1));
    assert.isTrue(Prime.Document.queryById('nested2').isChildOf(nested1));
    assert.isTrue(Prime.Document.queryById('nested3').isChildOf(nested1));
    assert.isTrue(Prime.Document.queryById('nested4').isChildOf(nested1));

    var nested2 = Prime.Document.queryById('nested2');
    assert.isFalse(Prime.Document.queryById('nested1').isChildOf(nested2));
    assert.isFalse(Prime.Document.queryById('nested2').isChildOf(nested2));
    assert.isTrue(Prime.Document.queryById('nested3').isChildOf(nested2));
    assert.isTrue(Prime.Document.queryById('nested4').isChildOf(nested2));

    var nested3 = Prime.Document.queryById('nested3');
    assert.isFalse(Prime.Document.queryById('nested1').isChildOf(nested3));
    assert.isFalse(Prime.Document.queryById('nested2').isChildOf(nested3));
    assert.isFalse(Prime.Document.queryById('nested3').isChildOf(nested3));
    assert.isTrue(Prime.Document.queryById('nested4').isChildOf(nested3));

    var nested4 = Prime.Document.queryById('nested4');
    assert.isFalse(Prime.Document.queryById('nested1').isChildOf(nested4));
    assert.isFalse(Prime.Document.queryById('nested2').isChildOf(nested4));
    assert.isFalse(Prime.Document.queryById('nested3').isChildOf(nested4));
    assert.isFalse(Prime.Document.queryById('nested4').isChildOf(nested4));
  });

  it('isVisible', function() {
    assert.isFalse(Prime.Document.queryById('hidden').isVisible());
    assert.isFalse(Prime.Document.queryById('display-none').isVisible());
    assert.isTrue(Prime.Document.queryById('query').isVisible());
  });

  describe('prependTo', function() {
    afterEach(function() {
      Prime.Document.query('#prependToSingleElementNew').removeAllFromDOM();
      Prime.Document.query('#prependToMultipleElementNew').removeAllFromDOM();
      assert.notExists(document.getElementById('prependToSingleElementNew'));
      assert.notExists(document.getElementById('prependToMultipleElementNew'));
    });

    it('prependToSingleDOMElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('prependToSingleElementNew')
          .prependTo(document.getElementById('insertSingle'));

      var newElement = document.getElementById('prependToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 1);
      assert.equal(findNextElementSibling(newElement).id, 'insertSingleElement');
    });

    it('prependToSinglePrimeElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('prependToSingleElementNew')
          .prependTo(Prime.Document.queryFirst('#insertSingle'));

      var newElement = document.getElementById('prependToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 1);
      assert.equal(findNextElementSibling(newElement).id, 'insertSingleElement');
    });

    it('prependToMultipleDOMElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('prependToMultipleElementNew')
          .prependTo(document.getElementById('insertMultiple'));

      var newElement = document.getElementById('prependToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 3);
      assert.equal(findNextElementSibling(newElement).id, 'insertMultipleOne');
    });

    it('prependToMultiplePrimeElement', function() {
      Prime.Document.newElement('<a/>')
          .setId('prependToMultipleElementNew')
          .prependTo(Prime.Document.queryFirst('#insertMultiple'));

      var newElement = document.getElementById('prependToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 0);
      assert.hasNextElementSiblings(newElement, 3);
      assert.equal(findNextElementSibling(newElement).id, 'insertMultipleOne');
    });
  });

  describe('removeClass', function() {
    beforeEach(function() {
      this.classEmpty = document.getElementById('classEmpty').className;
      this.classSingleExisting = document.getElementById('classSingleExisting').className;
      this.classMultipleExisting = document.getElementById('classMultipleExisting').className;
    });

    afterEach(function() {
      document.getElementById('classEmpty').className = this.classEmpty;
      document.getElementById('classSingleExisting').className = this.classSingleExisting;
      document.getElementById('classMultipleExisting').className = this.classMultipleExisting;
    });

    it('removeClassEmptyRemoveSingle', function() {
      var elem = document.getElementById('classEmpty');
      Prime.Document.queryFirst('#classEmpty').removeClass('new-class');
      assert.isNotOk(elem.className);
    });

    it('removeClassEmptyRemoveMultiple', function() {
      var elem = document.getElementById('classEmpty');
      Prime.Document.queryFirst('#classEmpty').removeClass('new-class1 new-class2');
      assert.isNotOk(elem.className);
    });

    it('removeClassSingleExistingRemoveOne', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').removeClass('existing');
      assert.isNotOk(elem.className);
    });

    it('removeClassSingleExistingRemoveMultiple', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').removeClass('existing new-class');
      assert.isNotOk(elem.className);
    });

    it('removeClassMultipleExistingRemoveOneFirst', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing1');
      assert.equal(elem.className, 'existing2 existing3');
    });

    it('removeClassMultipleExistingRemoveSubstring', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing');
      assert.equal(elem.className, 'existing1 existing2 existing3');
    });

    it('removeClassMultipleExistingRemoveSuperstring', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing11');
      assert.equal(elem.className, 'existing1 existing2 existing3');
    });

    it('removeClassMultipleExistingRemoveOneMiddle', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing2');
      assert.equal(elem.className, 'existing1 existing3');
    });

    it('removeClassMultipleExistingRemoveOneLast', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing3');
      assert.equal(elem.className, 'existing1 existing2');
    });

    it('removeClassMultipleExistingRemoveMultipleFirstMiddle', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing1 existing2');
      assert.equal(elem.className, 'existing3');
    });

    it('removeClassMultipleExistingRemoveMultipleMiddleLast', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing2 existing3');
      assert.equal(elem.className, 'existing1');
    });

    it('removeClassMultipleExistingRemoveMultipleFirstLast', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing1 existing3');
      assert.equal(elem.className, 'existing2');
    });

    it('removeClassMultipleExistingRemoveMultipleLastFirst', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing3 existing1');
      assert.equal(elem.className, 'existing2');
    });

    it('removeClassMultipleExistingRemoveMultipleAll', function() {
      var elem = document.getElementById('classMultipleExisting');
      Prime.Document.queryFirst('#classMultipleExisting').removeClass('existing2 existing3 existing1');
      assert.isNotOk(elem.className);
    });

    it('removeClassNonExistingSingle', function() {
      var elem = document.getElementById('classSingleExisting');
      Prime.Document.queryFirst('#classSingleExisting').removeClass('non-existing');
      assert.equal(elem.className, 'existing');
    });
  });

  it('setChecked', function() {
    Prime.Document.queryById('two-checkbox-checked').setChecked(true);
    assert.isTrue(Prime.Document.queryById('one-checkbox-checked').isChecked());
    assert.isTrue(Prime.Document.queryById('two-checkbox-checked').isChecked());
    assert.isTrue(Prime.Document.queryById('three-checkbox-checked').isChecked());

    Prime.Document.queryById('two-checkbox-checked').setChecked(false);
    assert.isTrue(Prime.Document.queryById('one-checkbox-checked').isChecked());
    assert.isFalse(Prime.Document.queryById('two-checkbox-checked').isChecked());
    assert.isTrue(Prime.Document.queryById('three-checkbox-checked').isChecked());

    Prime.Document.queryById('two-radio-checked').setChecked(true);
    assert.isFalse(Prime.Document.queryById('one-radio-checked').isChecked());
    assert.isTrue(Prime.Document.queryById('two-radio-checked').isChecked());
    assert.isFalse(Prime.Document.queryById('three-radio-checked').isChecked());

    Prime.Document.queryById('two-radio-checked').setChecked(false);
    assert.isFalse(Prime.Document.queryById('one-radio-checked').isChecked());
    assert.isFalse(Prime.Document.queryById('two-radio-checked').isChecked());
    assert.isFalse(Prime.Document.queryById('three-radio-checked').isChecked());
  });

  it('setDisabled', function() {
    Prime.Document.queryById('checkbox-disabled').setDisabled(true);
    assert.isTrue(Prime.Document.queryById('checkbox-disabled').isDisabled());

    var select = Prime.Document.queryById('select-disabled');
    select.getChildren().each(function(option) {
      option.setDisabled(true);
    });
    select.getChildren().each(function(option) {
      assert.isTrue(option.isDisabled());
    });
  });

  it('setAttributes', function() {
    Prime.Document.queryById('set-attributes').setAttributes({rel: 'foo', width: '10%'});

    var element = document.getElementById('set-attributes');
    assert.isNotNull(element);
    assert.equal(element.attributes.getNamedItem('rel').value, 'foo');
    assert.equal(element.attributes.getNamedItem('width').value, '10%');
  });

  it('setHTML', function() {
    Prime.Document.queryFirst('#html').setHTML('Changed');

    var element = document.getElementById('html');
    assert.equal(element.innerHTML, 'Changed');
  });

  it('setTextContent', function() {
    Prime.Document.queryFirst('#html').setTextContent('Changed');

    var element = document.getElementById('html');
    assert.equal(element.textContent, 'Changed');
  });

  it('setHeight', function() {
    var element = Prime.Document.queryById('set-styles').setHeight(10);
    assert.equal(element.getStyle('height'), '10px');
    assert.equal(element.getHeight(), 10);

    element.setHeight('10em');
    assert.equal(element.getStyle('height'), '10em');
    assert.isTrue(element.getHeight() > 0); // Just make sure it doesn't throw since the computed style is always in pixels
  });

  it('setHTMLByElement', function() {
    Prime.Document.queryFirst('#htmlByElement').setHTML(Prime.Document.queryById('htmlByElementTarget'));

    var element = document.getElementById('htmlByElement');
    assert.equal(element.innerHTML, 'By Element Target');
  });

  it('setLeft', function() {
    var element = Prime.Document.queryById('set-styles').setLeft(10);
    assert.equal(element.getStyle('left'), '10px');

    element.setLeft('10em');
    assert.equal(element.getStyle('left'), '10em');
  });

  it('setSelectedValues', function() {
    Prime.Document.queryById('two-checkbox-select').setSelectedValues('three');
    assert.isFalse(Prime.Document.queryById('one-checkbox-select').isChecked());
    assert.isFalse(Prime.Document.queryById('two-checkbox-select').isChecked());
    assert.isTrue(Prime.Document.queryById('three-checkbox-select').isChecked());

    Prime.Document.queryById('three-checkbox-select').setSelectedValues('one', 'two');
    assert.isTrue(Prime.Document.queryById('one-checkbox-select').isChecked());
    assert.isTrue(Prime.Document.queryById('two-checkbox-select').isChecked());
    assert.isFalse(Prime.Document.queryById('three-checkbox-select').isChecked());

    Prime.Document.queryById('three-checkbox-select').setSelectedValues(['one', 'three']);
    assert.isTrue(Prime.Document.queryById('one-checkbox-select').isChecked());
    assert.isFalse(Prime.Document.queryById('two-checkbox-select').isChecked());
    assert.isTrue(Prime.Document.queryById('three-checkbox-select').isChecked());

    Prime.Document.queryById('two-radio-select').setSelectedValues('two');
    assert.isFalse(Prime.Document.queryById('one-radio-select').isChecked());
    assert.isTrue(Prime.Document.queryById('two-radio-select').isChecked());
    assert.isFalse(Prime.Document.queryById('three-radio-select').isChecked());

    Prime.Document.queryById('two-radio-select').setSelectedValues('three');
    assert.isFalse(Prime.Document.queryById('one-radio-select').isChecked());
    assert.isFalse(Prime.Document.queryById('two-radio-select').isChecked());
    assert.isTrue(Prime.Document.queryById('three-radio-select').isChecked());

    Prime.Document.queryById('select-single-select').setSelectedValues('three');
    assert.deepEqual(Prime.Document.queryById('select-single-select').getSelectedValues(), ['three']);

    Prime.Document.queryById('select-multiple-select').setSelectedValues('two');
    assert.deepEqual(Prime.Document.queryById('select-multiple-select').getSelectedValues(), ['two']);

    Prime.Document.queryById('select-multiple-select').setSelectedValues('one', 'three');
    assert.deepEqual(Prime.Document.queryById('select-multiple-select').getSelectedValues(), ['one', 'three']);

    Prime.Document.queryById('select-multiple-select').setSelectedValues(['one', 'two']);
    assert.deepEqual(Prime.Document.queryById('select-multiple-select').getSelectedValues(), ['one', 'two']);
  });

  it('setStyles', function() {
    Prime.Document.queryById('set-styles').setStyles({'text-align': 'right', width: '10%'});

    var element = document.getElementById('set-styles');
    assert.isNotNull(element);
    assert.equal(element.style['text-align'], 'right');
    assert.equal(element.style['width'], '10%');
  });

  it('setTop', function() {
    var element = Prime.Document.queryById('set-styles').setTop(10);
    assert.equal(element.getStyle('top'), '10px');

    element = element.setTop('10em');
    assert.equal(element.getStyle('top'), '10em');
  });

  it('setValue', function() {
    assert.equal(Prime.Document.queryById('one-checkbox-set').setValue('one-changed').getValue(), 'one-changed');
    assert.isTrue(Prime.Document.queryById('one-checkbox-set').isChecked());
    assert.equal(Prime.Document.queryById('two-checkbox-set').setValue('two-changed').getValue(), 'two-changed');
    assert.isFalse(Prime.Document.queryById('two-checkbox-set').isChecked());
    assert.equal(Prime.Document.queryById('one-radio-set').setValue('one-changed').getValue(), 'one-changed');
    assert.isTrue(Prime.Document.queryById('one-radio-set').isChecked());
    assert.equal(Prime.Document.queryById('two-radio-set').setValue('two-changed').getValue(), 'two-changed');
    assert.isFalse(Prime.Document.queryById('two-radio-set').isChecked());
    assert.equal(Prime.Document.queryById('text-set').setValue('text-set-changed').getValue(), 'text-set-changed');
    assert.equal(Prime.Document.queryById('textarea-set').setValue('textarea-set-changed').getValue(), 'textarea-set-changed');
  });

  it('setWidth', function() {
    var element = Prime.Document.queryById('set-styles').setWidth(10);
    assert.equal(element.getStyle('width'), '10px');
    assert.equal(element.getWidth(), 10);

    element.setWidth('10em');
    assert.equal(element.getStyle('width'), '10em');
    assert.isTrue(element.getWidth() > 0); // Just make sure it doesn't throw since the computed style is always in pixels
  });

  it('show', function() {
    // Test inline styles with show. This should end up empty string
    Prime.Document.queryFirst('#show').show();

    var element = document.getElementById('show');
    assert.equal(element.style.display, '');

    // Test computed style is block, so this should also end up empty string.
    Prime.Document.queryFirst('#hide').hide();
    Prime.Document.queryFirst('#hide').show();

    element = document.getElementById('hide');
    assert.equal(element.style.display, '');

    // Test a stylesheet display: none and guessing it is a block element
    Prime.Document.queryFirst('#showCSSBlock').hide();
    Prime.Document.queryFirst('#showCSSBlock').show();

    element = document.getElementById('showCSSBlock');
    assert.equal(element.style.display, 'block');

    // Test a stylesheet display: none and guessing it is a inline element
    Prime.Document.queryFirst('#showCSSInline').hide();
    Prime.Document.queryFirst('#showCSSInline').show();

    element = document.getElementById('showCSSInline');
    assert.equal(element.style.display, 'inline');

    // Test a stylesheet display: none and then forcing it to be inline-block via the parameter
    Prime.Document.queryFirst('#showCSSInline').hide();
    Prime.Document.queryFirst('#showCSSInline').show('table-cell');

    element = document.getElementById('showCSSInline');
    assert.equal(element.style.display, 'table-cell');
  });

  it('eventsUsingFunction single listener', function(done) {
    var called = false;
    var called2 = false;
    var memo = null;
    var memo2 = null;
    var handler = function(event) {
      called = true;
      memo = event.memo;
    };

    Prime.Document.queryFirst('#event').addEventListener('click', handler).fireEvent('click', 'memo');

    setTimeout(function() {
      assert.isTrue(called);
      assert.isFalse(called2);
      assert.equal(memo, 'memo');
      assert.isNull(memo2);
      done();
    }, 50);
  });

  it('eventUsingFunction remove single listener', function(done) {
    var called = false;
    var called2 = false;
    var memo = null;
    var memo2 = null;
    var handler = function(event) {
      called = true;
      memo = event.memo;
    };

    // Remove the event listener
    Prime.Document.queryFirst('#event').addEventListener('click', handler).removeEventListener('click', handler).fireEvent('click', 'memo');

    setTimeout(function() {
      assert.isFalse(called);
      assert.isFalse(called2);
      assert.isNull(memo);
      assert.isNull(memo2);
      done();
    }, 50);

    // Add the event listener, then remove it using a pattern
    Prime.Document.queryFirst('#event').addEventListener('click', handler).removeEventListenersByPattern(/cli.*/).fireEvent('click', 'memo');

    setTimeout(function() {
      assert.isFalse(called);
      assert.isFalse(called2);
      assert.isNull(memo);
      assert.isNull(memo2);
      done();
    }, 50);
  });

  it('eventUsingFunction multiple listeners', function(done) {
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

    Prime.Document.queryFirst('#event').addEventListener('click', handler).addEventListener('click', handler2).fireEvent('click', 'memo');

    window.setTimeout(function() {
      assert.isTrue(called);
      assert.isTrue(called2);
      assert.equal(memo, 'memo');
      assert.equal(memo2, 'memo');
      done();
    }, 50);
  });

  it('eventUsingFunction remove all listeners', function(done) {
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

    Prime.Document.queryFirst('#event').addEventListener('click', handler).addEventListener('click', handler2).removeAllEventListeners().fireEvent('click', 'memo');

    window.setTimeout(function() {
      assert.isFalse(called);
      assert.isFalse(called2);
      assert.isNull(memo);
      assert.isNull(memo2);
      done();
    }, 50);
  });

  it('eventsUsingObject', function() {
    var MyEventListener = function() {
      Prime.Utils.bindAll(this);
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
    Prime.Document.queryFirst('#event')
        .addEventListener('click', instance.handle)
        .fireEvent('click', 'memo');

    assert.isTrue(instance.called);
    assert.equal(instance.memo, 'memo');

    // Unbind the listener and click it again
    instance.called = false;
    instance.memo = null;
    Prime.Document.queryFirst('#event')
        .removeEventListener('click', instance.handle)
        .fireEvent('click', 'memo');

    assert.isFalse(instance.called);
    assert.isNull(instance.memo);
  });

  it('customEvents', function() {
    var MyEventListener = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
      this.count = 0;
      this.called2 = false;
      this.count2 = 0;
      this.memo = null;
      this.event = null;
    };
    MyEventListener.prototype = {
      handle: function(evt) {
        console.log('handle');
        this.called = true;
        this.count++;
        this.memo = evt.memo;
        this.event = evt.event;
      },

      handle2: function(evt) {
        console.log('handle2');
        this.called2 = true;
        this.count2++;
      }
    };

    var instance = new MyEventListener();
    Prime.Document.queryFirst('#event')
        .addEventListener('custom:pop', instance.handle)
        .addEventListener('custom:pop', instance.handle)
        .addEventListener('custom:pop', instance.handle)
        .fireEvent('custom:pop', 'foo');

    assert.isTrue(instance.called);
    assert.equal(instance.count, 1);
    assert.equal(instance.event, 'custom:pop');
    assert.equal(instance.memo, 'foo');

    // Remove the event listener and re-test
    instance.called = false;
    instance.count = 0;
    instance.memo = null;
    instance.event = null;
    Prime.Document.queryFirst('#event')
        .removeEventListener('custom:pop', instance.handle)
        .fireEvent('custom:pop', 'foo');

    assert.isFalse(instance.called);
    assert.equal(instance.count, 0);
    assert.isNull(instance.event);
    assert.isNull(instance.memo);

    // Add multiple listeners for a single event and then remove them all
    Prime.Document.queryFirst('#event')
        .addEventListener('custom:pop', instance.handle)
        .addEventListener('custom:pop', instance.handle2)
        .fireEvent('custom:pop', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.count, 1);
    assert.isTrue(instance.called2);
    assert.equal(instance.count2, 1);

    instance.called = false;
    instance.count = 0;
    instance.called2 = false;
    instance.count2 = 0;
    Prime.Document.queryFirst('#event')
        .removeEventListeners('custom:pop')
        .fireEvent('custom:pop', 'foo');

    assert.isFalse(instance.called);
    assert.equal(instance.count, 0);
    assert.isFalse(instance.called2);
    assert.equal(instance.count2, 0);

    // Add multiple listeners for a single event and then remove them all using the global function
    Prime.Document.queryFirst('#event')
        .addEventListener('custom:pop', instance.handle)
        .addEventListener('custom:pop', instance.handle2)
        .fireEvent('custom:pop', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.count, 1);
    assert.isTrue(instance.called2);
    assert.equal(instance.count2, 1);

    instance.called = false;
    instance.count = 0;
    instance.called2 = false;
    instance.count2 = 0;
    Prime.Document.queryFirst('#event')
        .removeAllEventListeners()
        .fireEvent('custom:pop', 'foo');

    assert.isFalse(instance.called);
    assert.equal(instance.count, 0);
    assert.isFalse(instance.called2);
    assert.equal(instance.count2, 0);

    // Add multiple listeners for a single event and then remove them all using a pattern
    Prime.Document.queryFirst('#event')
        .addEventListener('custom:pop', instance.handle)
        .addEventListener('custom:pop', instance.handle2)
        .fireEvent('custom:pop', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.count, 1);
    assert.isTrue(instance.called2);
    assert.equal(instance.count2, 1);

    instance.called = false;
    instance.count = 0;
    instance.called2 = false;
    instance.count2 = 0;
    Prime.Document.queryFirst('#event')
        .removeEventListenersByPattern(/custom:.+/)
        .fireEvent('custom:pop', 'foo');

    assert.isFalse(instance.called);
    assert.equal(instance.count, 0);
    assert.isFalse(instance.called2);
    assert.equal(instance.count2, 0);
  });

  it('opacity', function() {
    var element = Prime.Document.queryFirst('#html');
    assert.equal(element.getOpacity(), 1.0);

    element.setOpacity(0.5);
    assert.equal(element.getOpacity(), 0.5);
  });

  it('query', function() {
    var list = Prime.Document.queryById('query').query('p.test');
    assert.equal(list.length, 3);
    assert.equal(list[0].getId(), 'queryOne');
    assert.equal(list[1].getId(), 'queryTwo');
    assert.equal(list[2].getId(), 'queryThree');
  });

  describe('queryUp', function() {
    before(function() {
      this.child = Prime.Document.queryById('child');
      this.parent = Prime.Document.queryById('parent');
      this.ancestor = Prime.Document.queryFirst('div.ancestor');
    });

    it('find parent by id', function() {
      assert.equal(this.child.queryUp('#parent').domElement, this.parent.domElement);
    });

    it('find parent by type + id', function() {
      assert.equal(this.child.queryUp('div#parent').domElement, this.parent.domElement);
    });

    it('find parent by type only', function() {
      assert.equal(this.child.queryUp('div').domElement, this.parent.domElement);
    });

    it('find ancestor', function() {
      assert.equal(this.child.queryUp('.ancestor').domElement, this.ancestor.domElement);
    });

    it('find parent with a space in the selector', function() {
      assert.equal(this.child.queryUp('div #parent').domElement, this.parent.domElement);
      assert.equal(this.child.queryUp('body .ancestor').domElement, this.ancestor.domElement);
    });
  });

  it('queryFirst', function() {
    var child = Prime.Document.queryById('query').queryFirst('.test');
    assert.isNotNull(child);
    assert.equal(child.getId(), 'queryOne')
  });

  it('queryLast', function() {
    var child = Prime.Document.queryById('query').queryLast('.test');
    assert.isNotNull(child);
    assert.equal(child.getId(), 'queryThree')
  });

  it('unwrap', function() {
    var element = Prime.Document.queryById('unwrap');
    assert.equal(element.getHTML(), '<span>Unwrap</span> Me');
    var span = element.queryFirst('span');
    span.unwrap();
    assert.equal(element.getHTML(), 'Unwrap Me');
  });
});
