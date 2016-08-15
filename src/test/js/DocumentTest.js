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

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('Prime.Document namespace tests', {
  'addEventListener': function() {
    var MyEventListener = function() {
      Prime.Utils.bindAll(this);
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
    Prime.Document.addEventListener('click', instance.handle);

    Prime.Document.queryFirst('#html').fireEvent('click', 'foo');
    assert(instance.called);
    assert.equals(instance.event, 'click');
    assert.equals(instance.memo, 'foo');
  },

  'body': function() {
    assert.isTrue(Prime.Document.bodyElement !== null);
    assert.isTrue(Prime.Document.bodyElement.queryFirst('.body-test') !== null);
  },

  'onReady': function() {
    assert.equals(documentReadyCount, 1);
    assert.equals(drc.count, 1);
  },

  'getHeight': function() {
    var height = Prime.Document.getHeight();
    assert.isTrue(height > 400);
  },

  'getWidth': function() {
    var width = Prime.Document.getWidth();
    assert.isTrue(width > 400);
  },

  /**
   * Tests creating a new element.
   */
  'newElement': function() {
    var element = Prime.Document.newElement('<a/>');
    assert.equals(element.domElement.tagName, 'A');

    element = Prime.Document.newElement('<div/>');
    assert.equals(element.domElement.tagName, 'DIV');

    element = Prime.Document.newElement('<span></span>');
    assert.equals(element.domElement.tagName, 'SPAN');

    element = Prime.Document.newElement('<span>foo</span>');
    assert.equals(element.domElement.tagName, 'SPAN');

    element = Prime.Document.newElement('<div/>', {'id': '1'});
    assert.equals(element.getId(), '1');
    assert.equals(element.getId(), '1');

    element = Prime.Document.newElement('<div/>', {'id': 'id', 'style': 'width:200px;float:left'});
    assert.equals(element.getId(), 'id');
    assert.equals(element.getId(), 'id');
    assert.equals(element.domElement.style['width'], '200px');
    assert.equals(element.domElement.style['cssFloat'], 'left');
  },

  /**
   * This is duplicated test in Document.ElementListTest, but that's cool since it tests a Dom namespace level function
   */
  'query': function() {
    var list = Prime.Document.query('p.test');
    assert.equals(list.length, 3);
    assert.equals(list[0].getId(), 'queryOne');
    assert.equals(list[1].getId(), 'queryTwo');
    assert.equals(list[2].getId(), 'queryThree');

    var parent = Prime.Document.queryById('query');
    list = Prime.Document.query('p.test', parent);
    assert.equals(list[0].getId(), 'queryOne');
    assert.equals(list[1].getId(), 'queryTwo');
    assert.equals(list[2].getId(), 'queryThree');

    list = Prime.Document.query('p.test', parent.domElement);
    assert.equals(list[0].getId(), 'queryOne');
    assert.equals(list[1].getId(), 'queryTwo');
    assert.equals(list[2].getId(), 'queryThree');
  },

  'queryById': function() {
    var element = Prime.Document.queryById('queryOne');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('invalid');
    assert.isNull(element);
  },

  'queryFirst': function() {
    var element = Prime.Document.queryFirst('p');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('p#queryOne');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('#queryOne');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('#invalid');
    assert.isNull(element);
  },

  'queryFirst with Element': function() {
    var child = Prime.Document.queryFirst('.test', Prime.Document.queryById('query'));
    refute.isNull(child);
    assert.equals(child.getId(), 'queryOne')
  },

  'queryLast': function() {
    var element = Prime.Document.queryLast('p.test');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryThree');

    element = Prime.Document.queryLast('#queryOne');
    refute.isNull(element);
    assert.equals(element.getId(), 'queryOne');

    element = Prime.Document.queryLast('#invalid');
    assert.isNull(element);

    element = Prime.Document.queryLast('.invalid');
    assert.isNull(element);
  },

  'queryLast with Element': function() {
    var child = Prime.Document.queryLast('.test', Prime.Document.queryById('query'));
    refute.isNull(child);
    assert.equals(child.getId(), 'queryThree')
  },

  'queryUp': {
    setUp: function() {
      this.child = Prime.Document.queryById('child');
      this.parent = Prime.Document.queryById('parent');
      this.ancestor = Prime.Document.queryFirst('div.ancestor');
    },

    'find parent by id': function() {
      assert.equals(Prime.Document.queryUp('#parent', this.child).domElement, this.parent.domElement);
    },

    'find parent by type + id': function() {
      assert.equals(Prime.Document.queryUp('div#parent', this.child).domElement, this.parent.domElement);
    },

    'find parent by type only': function() {
      assert.equals(Prime.Document.queryUp('div', this.child).domElement, this.parent.domElement);
    },

    'find ancestor': function() {
      assert.equals(Prime.Document.queryUp('.ancestor', this.child).domElement, this.ancestor.domElement);
    },

    'find parent with a space in the selector': function() {
      assert.equals(Prime.Document.queryUp('div #parent', this.child).domElement, this.parent.domElement);
      assert.equals(Prime.Document.queryUp('body .ancestor', this.child).domElement, this.ancestor.domElement);
    }
  },

  'removeEventListener': function() {
    var MyEventListener = function() {
      Prime.Utils.bindAll(this);
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
    Prime.Document.addEventListener('click', instance.handle);

    Prime.Document.queryFirst('#html').fireEvent('click', 'foo');
    assert.isTrue(instance.called);
    assert.equals(instance.event, 'click');
    assert.equals(instance.memo, 'foo');

    instance.called = false;
    instance.memo = null;
    instance.event = null;

    Prime.Document.removeEventListener('click', instance.handle);
    Prime.Document.queryFirst('#html').fireEvent('click', 'foo');
    assert.isFalse(instance.called);
    assert.isNull(instance.event);
    assert.isNull(instance.memo);
  },

  'newDocument': function() {
    var newDocument = Prime.Document.newDocument('<html><head><title>foo</title></head><body>body</body></html>');
    refute.isNull(newDocument);
    assert.equals(newDocument.documentElement.outerHTML, '<html><head><title>foo</title></head><body>body</body></html>');
    assert.equals(newDocument.documentElement.innerHTML, '<head><title>foo</title></head><body>body</body>');
    assert.equals(Prime.Document.queryFirst('body', newDocument).getHTML(), 'body');
    assert.equals(Prime.Document.queryFirst('body', newDocument).getOuterHTML(), '<body>body</body>');
  }
});
