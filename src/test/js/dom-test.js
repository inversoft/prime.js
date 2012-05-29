var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase("DOM tests", {
  /**
   * Tests selecting element(s).
   */
  "query": function() {
    var list = Prime.Dom.query('p');
    assert.equals(list.length, 3);
    assert.equals(list[0].id, 'queryOne');
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].id, 'queryTwo');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].id, 'queryThree');
    assert.equals(list[2].domElement.id, 'queryThree');
  },

  /**
   * Tests selecting one element.
   */
  "queryFirst": function() {
    var element = Prime.Dom.queryFirst('p');
    refute.isNull(element);
    assert.equals(element.id, 'queryOne');
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('p#queryOne');
    refute.isNull(element);
    assert.equals(element.id, 'queryOne');
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('#queryOne');
    refute.isNull(element);
    assert.equals(element.id, 'queryOne');
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('#invalid');
    assert.isNull(element);
  },

  /**
   * Tests selecting by ID.
   */
  "queryByID": function() {
    var element = Prime.Dom.queryByID('queryOne');
    refute.isNull(element);
    assert.equals(element.id, 'queryOne');
    assert.equals(element.domElement.id, 'queryOne');

    element = Prime.Dom.queryFirst('invalid');
    assert.isNull(element);
  },

  /**
   * Tests creating a new element.
   */
  "newElement": function() {
    var element = Prime.Dom.newElement('<a/>');
    assert.equals(element.domElement.tagName, 'A');

    element = Prime.Dom.newElement('<div/>');
    assert.equals(element.domElement.tagName, 'DIV');
  },

  /**
   * Tests inserting a new Element into the DOM after other elements.
   */
  "insertBefore": {
    setUp: function() {
      Prime.Dom.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#insertMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('insertSingleElementNew'));
      refute(document.getElementById('insertMultipleElementNew'));

      this.verifyInsertBefore = function(newElement, nextSiblingID, tagName, previousSiblingCount) {
        assert(newElement);
        assert(newElement.nextSibling);
        assert.equals(newElement.nextSibling.id, nextSiblingID);
        assert.equals(newElement.tagName, tagName);

        // Ensure there are a specific number of element siblings.
        var sibling = newElement.previousSibling;
        var count = 0;
        while (sibling) {
          if (sibling.nodeType === 1) {
            count++;
          }
          sibling = sibling.previousSibling;
        }
        assert.equals(count, previousSiblingCount, 'Expected ' + previousSiblingCount + ' previous siblings');
      };

      this.verifyInsertBeforeFirst = function(newElement, nextSiblingID, tagName) {
        assert(newElement);
        assert(newElement.nextSibling);
        assert.equals(newElement.nextSibling.id, nextSiblingID);
        assert.equals(newElement.tagName, tagName);

        // Ensure that the siblings before the new element are not elements (they might be text nodes though).
        var sibling = newElement.previousSibling;
        while (sibling) {
          refute.equals(sibling.nodeType, 1);
          sibling = sibling.previousSibling;
        }
      };
    },

    "insertBeforeSingleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertBefore(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    "insertAfterSinglePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    "insertBeforeFirstMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    "insertBeforeFirstMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    "insertBeforeMiddleMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    "insertBeforeMiddleMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    "insertBeforeLastMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    },

    "insertBeforeLastMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    }
  },

  /**
   * Tests inserting a new Element into the DOM before other elements.
   */
  "insertAfter": {
    setUp: function() {
      Prime.Dom.query('#insertSingleElementNew').removeAllFromDOM();
      Prime.Dom.query('#insertMultipleElementNew').removeAllFromDOM();
      refute(document.getElementById('insertSingleElementNew'));
      refute(document.getElementById('insertMultipleElementNew'));

      this.verifyInsertAfter = function(newElement, previousSiblingID, tagName, nextSiblingCount) {
        assert(newElement);
        assert(newElement.previousSibling);
        assert.equals(newElement.previousSibling.id, previousSiblingID);
        assert.equals(newElement.tagName, tagName);

        // Ensure there are a specific number of element siblings.
        var sibling = newElement.nextSibling;
        var count = 0;
        while (sibling) {
          if (sibling.nodeType === 1) {
            count++;
          }
          sibling = sibling.nextSibling;
        }
        assert.equals(count, nextSiblingCount, 'Expected ' + nextSiblingCount + ' next siblings');
      };

      this.verifyInsertAfterEnd = function(newElement, previousSiblingID, tagName) {
        assert(newElement);
        assert(newElement.previousSibling);
        assert.equals(newElement.previousSibling.id, previousSiblingID);
        assert.equals(newElement.tagName, tagName);

        // Ensure that the siblings after the new element are not elements (they might be text nodes though).
        var sibling = newElement.nextSibling;
        while (sibling) {
          refute.equals(sibling.nodeType, 1);
          sibling = sibling.nextSibling;
        }
      };
    },

    "insertAfterSingleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertAfter(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    "insertAfterSinglePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    "insertAfterFirstMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    "insertAfterFirstMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    "insertAfterMiddleMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    "insertAfterMiddleMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    "insertAfterLastMultipleDOMElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    },

    "insertAfterLastMultiplePrimeElement": function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    }
  },

  "html": function() {
    Prime.Dom.queryFirst('#html').html('Changed');

    var element = document.getElementById('html');
    assert.equals(element.innerHTML, 'Changed');
  },

  "// withEventListener": function() {
  }
});
