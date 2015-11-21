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

buster.testCase('ElementList namespace tests', {
  'query': function() {
    var list = Prime.Document.query('p.test');
    assert.equals(list.length, 3);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');

    var parent = Prime.Document.queryByID('query');
    list = Prime.Document.query('p.test', parent);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');

    list = Prime.Document.query('p.test', parent.domElement);
    assert.equals(list[0].domElement.id, 'queryOne');
    assert.equals(list[1].domElement.id, 'queryTwo');
    assert.equals(list[2].domElement.id, 'queryThree');
  }
});

buster.testCase('ElementList class tests', {
  'each': function() {
    var count = 0;
    Prime.Document.query('p.test').each(function(element, index) {
      assert.equals(index, count++);
      assert.isTrue(this instanceof Array);
      assert.isTrue(element instanceof Prime.Document.Element);
      assert.equals(element.domElement.tagName, 'P');
    }, []);

    assert.equals(count, 3);
  },

  'indexOf Prime Element': function() {
    var container = Prime.Document.queryByID("query");
    var list = Prime.Document.query("p", container);

    var one = Prime.Document.queryByID("queryOne");
    var two = Prime.Document.queryByID("queryTwo");
    var outside = Prime.Document.queryByID("insertSingle");

    assert.equals(list.indexOf(one), 0);
    assert.equals(list.indexOf(one.domElement), 0);
    assert.equals(list.indexOf(two), 1);
    assert.equals(list.indexOf(two.domElement), 1);
    assert.equals(list.indexOf(outside), -1);
    assert.equals(list.indexOf(outside.domElement), -1);
  },

  'addClass and removeClass': function() {
    var container = Prime.Document.queryByID("query");
    var list = Prime.Document.query("p", container);

    var one = Prime.Document.queryByID("queryOne");
    var two = Prime.Document.queryByID("queryTwo");

    list.addClass('foobar');

    assert.isTrue(one.hasClass('foobar'));
    assert.isTrue(two.hasClass('foobar'));

    list.removeClass('foobar');

    assert.isFalse(one.hasClass('foobar'));
    assert.isFalse(two.hasClass('foobar'));
  }
});