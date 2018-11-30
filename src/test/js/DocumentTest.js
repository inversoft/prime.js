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

describe('Prime.Document namespace tests', function() {
  it('addEventListener', function() {
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
    assert.isOk(instance.called);
    assert.equal(instance.event, 'click');
    assert.equal(instance.memo, 'foo');
  });

  it('addDelegatedEventListener', function() {
    var MyEventListener = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
      this.event = null;
    };

    MyEventListener.prototype = {
      handle: function(event, target) {
        console.info(arguments);
        this.called = true;
        this.event = event;
      }
    };

    var instance = new MyEventListener();
    Prime.Document.addDelegatedEventListener('click', '.delegated-event-handler', instance.handle);

    Prime.Document.queryById('test-delegated-selector1').fireEvent('click', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.event.type, 'click');
    assert.equal(instance.event.memo, 'foo');

    // Second test, clicked, but selector does not match
    // - reset the handler
    instance.called = false;
    instance.event = null;

    Prime.Document.queryById('test-delegated-selector2').fireEvent('click', 'foo');
    assert.isFalse(instance.called);
    assert.equal(instance.event, null);

    // Third test, click on a nested <span> element
    // - reset the handler
    instance.called = false;
    instance.event = null;

    Prime.Document.queryById('test-delegated-selector3').queryFirst('span').fireEvent('click', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.event.type, 'click');
    assert.equal(instance.event.memo, 'foo');

    // Fourth test, click on a nested <div> element
    // - reset the handler
    instance.called = false;
    instance.event = null;

    Prime.Document.queryById('test-delegated-selector3').queryFirst('div').fireEvent('click', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.event.type, 'click');
    assert.equal(instance.event.memo, 'foo');

    // Fifth test, click on a nested <a> element
    // - reset the handler
    instance.called = false;
    instance.event = null;

    Prime.Document.queryById('test-delegated-selector3').queryFirst('a').fireEvent('click', 'foo');
    assert.isTrue(instance.called);
    assert.equal(instance.event.type, 'click');
    assert.equal(instance.event.memo, 'foo');
  });

  it('body', function() {
    assert.isTrue(Prime.Document.bodyElement !== null);
    assert.isTrue(Prime.Document.bodyElement.queryFirst('.body-test') !== null);
  });

  it('onReady', function() {
    assert.equal(documentReadyCount, 1);
    assert.equal(drc.count, 1);
  });

  it('getHeight', function() {
    var height = Prime.Document.getHeight();
    assert.isTrue(height > 400);
  });

  it('getWidth', function() {
    var width = Prime.Document.getWidth();
    assert.isTrue(width > 400);
  });

  /**
   * Tests creating a new element.
   */
  it('newElement', function() {
    var element = Prime.Document.newElement('<a/>');
    assert.equal(element.domElement.tagName, 'A');

    element = Prime.Document.newElement('<div/>');
    assert.equal(element.domElement.tagName, 'DIV');

    element = Prime.Document.newElement('<span></span>');
    assert.equal(element.domElement.tagName, 'SPAN');

    element = Prime.Document.newElement('<span>foo</span>');
    assert.equal(element.domElement.tagName, 'SPAN');

    element = Prime.Document.newElement('<div/>', {id: '1'});
    assert.equal(element.getId(), '1');
    assert.equal(element.getId(), '1');

    element = Prime.Document.newElement('<div/>', {id: 'id', style: 'width:200px;float:left'});
    assert.equal(element.getId(), 'id');
    assert.equal(element.getId(), 'id');
    assert.equal(element.domElement.style['width'], '200px');
    assert.equal(element.domElement.style['cssFloat'], 'left');
  });

  /**
   * This is duplicated test in Document.ElementListTest, but that's cool since it tests a Dom namespace level function
   */
  it('query', function() {
    var list = Prime.Document.query('p.test');
    assert.equal(list.length, 3);
    assert.equal(list[0].getId(), 'queryOne');
    assert.equal(list[1].getId(), 'queryTwo');
    assert.equal(list[2].getId(), 'queryThree');

    var parent = Prime.Document.queryById('query');
    list = Prime.Document.query('p.test', parent);
    assert.equal(list[0].getId(), 'queryOne');
    assert.equal(list[1].getId(), 'queryTwo');
    assert.equal(list[2].getId(), 'queryThree');

    list = Prime.Document.query('p.test', parent.domElement);
    assert.equal(list[0].getId(), 'queryOne');
    assert.equal(list[1].getId(), 'queryTwo');
    assert.equal(list[2].getId(), 'queryThree');
  });

  it('queryById', function() {
    var element = Prime.Document.queryById('queryOne');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('invalid');
    assert.isNull(element);
  });

  it('queryFirst', function() {
    var element = Prime.Document.queryFirst('p');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('p#queryOne');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('#queryOne');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryOne');

    element = Prime.Document.queryFirst('#invalid');
    assert.isNull(element);
  });

  it('queryFirst with Element', function() {
    var child = Prime.Document.queryFirst('.test', Prime.Document.queryById('query'));
    assert.isNotNull(child);
    assert.equal(child.getId(), 'queryOne')
  });

  it('queryLast', function() {
    var element = Prime.Document.queryLast('p.test');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryThree');

    element = Prime.Document.queryLast('#queryOne');
    assert.isNotNull(element);
    assert.equal(element.getId(), 'queryOne');

    element = Prime.Document.queryLast('#invalid');
    assert.isNull(element);

    element = Prime.Document.queryLast('.invalid');
    assert.isNull(element);
  });

  it('queryLast with Element', function() {
    var child = Prime.Document.queryLast('.test', Prime.Document.queryById('query'));
    assert.isNotNull(child);
    assert.equal(child.getId(), 'queryThree')
  });

  it('queryUp', function() {
    before(function() {
      this.child = Prime.Document.queryById('child');
      this.parent = Prime.Document.queryById('parent');
      this.ancestor = Prime.Document.queryFirst('div.ancestor');
    });

    it('find parent by id', function() {
      assert.equal(Prime.Document.queryUp('#parent', this.child).domElement, this.parent.domElement);
    });

    it('find parent by type + id', function() {
      assert.equal(Prime.Document.queryUp('div#parent', this.child).domElement, this.parent.domElement);
    });

    it('find parent by type only', function() {
      assert.equal(Prime.Document.queryUp('div', this.child).domElement, this.parent.domElement);
    });

    it('find ancestor', function() {
      assert.equal(Prime.Document.queryUp('.ancestor', this.child).domElement, this.ancestor.domElement);
    });

    it('find parent with a space in the selector', function() {
      assert.equal(Prime.Document.queryUp('div #parent', this.child).domElement, this.parent.domElement);
      assert.equal(Prime.Document.queryUp('body .ancestor', this.child).domElement, this.ancestor.domElement);
    });
  });

  it('removeEventListener', function() {
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
    assert.equal(instance.event, 'click');
    assert.equal(instance.memo, 'foo');

    instance.called = false;
    instance.memo = null;
    instance.event = null;

    Prime.Document.removeEventListener('click', instance.handle);
    Prime.Document.queryFirst('#html').fireEvent('click', 'foo');
    assert.isFalse(instance.called);
    assert.isNull(instance.event);
    assert.isNull(instance.memo);
  });

  it('newDocument', function() {
    var newDocument = Prime.Document.newDocument('<html><head><title>foo</title></head><body>body</body></html>');
    assert.isNotNull(newDocument);
    assert.equal(newDocument.documentElement.outerHTML, '<html><head><title>foo</title></head><body>body</body></html>');
    assert.equal(newDocument.documentElement.innerHTML, '<head><title>foo</title></head><body>body</body>');
    assert.equal(Prime.Document.queryFirst('body', newDocument).getHTML(), 'body');
    assert.equal(Prime.Document.queryFirst('body', newDocument).getOuterHTML(), '<body>body</body>');
  });
});
