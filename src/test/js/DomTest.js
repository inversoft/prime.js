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
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;


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

  /**
   * This is duplicated test in Dom.ElementListTest, but that's cool since it tests a Dom namespace level function
   */
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
        assert(err !== null);
      }
    }
  }
});
