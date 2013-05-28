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
    assert.isTrue(instance.called);
    assert.equals(instance.event, 'click');
    assert.equals(instance.memo, 'foo');

    instance.called = false;
    instance.memo = null;
    instance.event = null;

    Prime.Dom.Document.removeEventListener('click', proxy);
    Prime.Dom.queryFirst('#html').fireEvent('click', 'foo');
    assert.isFalse(instance.called);
    assert.equals(instance.event, null);
    assert.equals(instance.memo, null);
  }
});
