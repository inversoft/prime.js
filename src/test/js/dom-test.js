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
    assert.equals(list[0].id, 'queryOne');
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].id, 'queryTwo');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].id, 'queryThree');
    assert.equals(list[2].domElement.id, 'queryThree');

    var parent = Prime.Dom.queryByID('query');
    list = Prime.Dom.query('p.test', parent);
    assert.equals(list[0].id, 'queryOne');
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].id, 'queryTwo');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].id, 'queryThree');
    assert.equals(list[2].domElement.id, 'queryThree');

    list = Prime.Dom.query('p.test', parent.domElement);
    assert.equals(list[0].id, 'queryOne');
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].id, 'queryTwo');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].id, 'queryThree');
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
    }, new Array());

    assert.equals(count, 3);
  }
});


buster.testCase('Element namespace tests', {
  /**
   * Tests selecting one element.
   */
  'queryFirst': function() {
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
    assert.equals(element.id, 'queryOne');
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
  }
});

buster.testCase('Element class tests', {
  setUp: function() {
    this.timeout = 1000;
  },

  'attribute': function() {
    assert.equals(Prime.Dom.queryFirst('#attributes').attribute('attr1'), 'value1');
    assert.equals(Prime.Dom.queryFirst('#attributes').attribute('attr2'), 'value2');
  },

  'set remove attribute':function () {
    assert.isTrue(Prime.Dom.queryFirst('#attributes').attribute('foo') == null);

    Prime.Dom.queryFirst('#attributes').setAttribute('foo', 'bar');
    assert.equals(Prime.Dom.queryFirst('#attributes').attribute('foo'), 'bar');

    Prime.Dom.queryFirst('#attributes').removeAttribute('foo');
    assert.isTrue(Prime.Dom.queryFirst('#attributes').attribute('foo') == null);
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
        withID('appendToSingleElementNew').
        appendTo(document.getElementById('insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    },

    'appendToSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('appendToSingleElementNew').
        appendTo(Prime.Dom.queryFirst('#insertSingle'));

      var newElement = document.getElementById('appendToSingleElementNew');
      assert.hasPreviousElementSiblings(newElement, 1);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertSingleElement');
    },

    'appendToMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('appendToMultipleElementNew').
        appendTo(document.getElementById('insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    },

    'appendToMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('appendToMultipleElementNew').
        appendTo(Prime.Dom.queryFirst('#insertMultiple'));

      var newElement = document.getElementById('appendToMultipleElementNew');
      assert.hasPreviousElementSiblings(newElement, 3);
      assert.hasNextElementSiblings(newElement, 0);
      assert.equals(findPreviousElementSibling(newElement).id, 'insertMultipleThree');
    }
  },

  'fadeOut': function(done) {
    var called = false;
    var endFunction = function() {
      called = true;
    };

    var element = Prime.Dom.queryFirst('#hide').
      fadeOut(500, endFunction);

    setTimeout(function() {
      assert(called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  },

  'fadeOutContext': function(done) {
    var FadeOutClass = function() {
      this.called = false;
    };
    FadeOutClass.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var handler = new FadeOutClass();
    var element = Prime.Dom.queryFirst('#hide').
      fadeOut(500, handler.handle, handler);

    setTimeout(function() {
      assert(handler.called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  },

  'getHTML': function() {
    var element = document.getElementById('html');
    element.innerHTML = 'Get test';

    assert.equals(Prime.Dom.queryFirst('#html').getHTML(), 'Get test');
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
        withID('insertSingleElementNew').
        insertBefore(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertSingleElement', 'A');
    },

    'insertBeforeFirstMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    'insertBeforeFirstMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBeforeFirst(newElement, 'insertMultipleOne', 'A');
    },

    'insertBeforeMiddleMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertBeforeMiddleMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertBeforeLastMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertBefore(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertBefore(newElement, 'insertMultipleThree', 'A', 2);
    },

    'insertBeforeLastMultiplePrimeElement': function() {
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
        withID('insertSingleElementNew').
        insertAfter(document.getElementById('insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterSinglePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertSingleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertSingleElement'));

      var newElement = document.getElementById('insertSingleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertSingleElement', 'A');
    },

    'insertAfterFirstMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    'insertAfterFirstMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleOne'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleOne', 'A', 2);
    },

    'insertAfterMiddleMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertAfterMiddleMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleTwo'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfter(newElement, 'insertMultipleTwo', 'A', 1);
    },

    'insertAfterLastMultipleDOMElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(document.getElementById('insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    },

    'insertAfterLastMultiplePrimeElement': function() {
      Prime.Dom.newElement('<a/>').
        withID('insertMultipleElementNew').
        insertAfter(Prime.Dom.queryFirst('#insertMultipleThree'));

      var newElement = document.getElementById('insertMultipleElementNew');
      this.verifyInsertAfterEnd(newElement, 'insertMultipleThree', 'A');
    }
  },

  'hide': function() {
    Prime.Dom.queryFirst('#hide').hide();

    var element = document.getElementById('hide');
    assert.equals(element.style.display, 'none');
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
    }
  },

  'setHTML': function() {
    Prime.Dom.queryFirst('#html').setHTML('Changed');

    var element = document.getElementById('html');
    assert.equals(element.innerHTML, 'Changed');
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
  },

  'withEventListenerFunction': function() {
    var called = false;
    Prime.Dom.queryFirst('#event').
      withEventListener('click', function() {
        called = true;
      });

    var element = document.getElementById('event');
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      element.dispatchEvent(event);
    } else {
      element.fireEvent('onclick');
    }

    assert(called);
  },

  'withEventListenerObject': function() {
    var MyEventListener = function() {
      this.called = false;
    };
    MyEventListener.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var instance = new MyEventListener();
    Prime.Dom.queryFirst('#event').
      withEventListener('click', instance.handle, instance);

    var element = document.getElementById('event');
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      element.dispatchEvent(event);
    } else {
      element.fireEvent('onclick');
    }

    assert(instance.called);
  }
});
