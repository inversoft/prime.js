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

buster.testCase('Fade tests', {
  setUp: function() {
    this.timeout = 2000;
  },

  'fade': function(done) {
    var called = false;
    var endFunction = function() {
      called = true;
    };

    var element = Prime.Document.queryFirst('#fade');
    new Prime.Effects.Fade(element).withDuration(500).withEndFunction(endFunction).go();

    setTimeout(function() {
      assert(called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  },

  'fadeContext': function(done) {
    var FadeClass = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
    };
    FadeClass.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var handler = new FadeClass();
    var element = Prime.Document.queryFirst('#fadeContext');
    var effect = new Prime.Effects.Fade(element);
    assert.equals(effect.duration, 1000);

    effect.withDuration(200);
    assert.equals(effect.duration, 200);

    effect.withEndFunction(handler.handle);
    assert.equals(effect.endFunction, handler.handle);

    effect.go();

    setTimeout(function() {
      assert(handler.called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  }
});


buster.testCase('Appear tests', {
  setUp: function() {
    this.timeout = 2000;
  },

  'appear': function(done) {
    var called = false;
    var endFunction = function() {
      called = true;
    };

    var element = Prime.Document.queryFirst('#appear');
    new Prime.Effects.Appear(element).withDuration(500).withEndFunction(endFunction).go();

    setTimeout(function() {
      assert(called);
      assert.equals(element.domElement.style.opacity, '1');
      assert.equals(element.domElement.style.display, '');
      done();
    }, 800);
  },

  'appearCSS': function(done) {
    var called = false;
    var endFunction = function() {
      called = true;
    };

    var element = Prime.Document.queryFirst('#appearCSS');
    new Prime.Effects.Appear(element).withDuration(500).withEndFunction(endFunction).go();

    setTimeout(function() {
      assert(called);
      assert.equals(element.domElement.style.opacity, '1');
      assert.equals(element.domElement.style.display, 'block');
      done();
    }, 800);
  },

  'appearContext': function(done) {
    var AppearClass = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
    };
    AppearClass.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var handler = new AppearClass();
    var element = Prime.Document.queryFirst('#appearContext');
    var effect = new Prime.Effects.Appear(element);
    assert.equals(effect.duration, 1000);

    effect.withDuration(200);
    assert.equals(effect.duration, 200);

    effect.withEndFunction(handler.handle);
    assert.equals(effect.endFunction, handler.handle);

    effect.go();

    setTimeout(function() {
      assert(handler.called);
      assert.equals(element.domElement.style.opacity, '1');
      assert.equals(element.domElement.style.display, '');
      done();
    }, 800);
  },

  'appearContextCSS': function(done) {
    var AppearClass = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
    };
    AppearClass.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var handler = new AppearClass();
    var element = Prime.Document.queryFirst('#appearContextCSS');
    var effect = new Prime.Effects.Appear(element);
    assert.equals(effect.duration, 1000);

    effect.withDuration(200);
    assert.equals(effect.duration, 200);

    effect.withEndFunction(handler.handle);
    assert.equals(effect.endFunction, handler.handle);

    effect.go();

    setTimeout(function() {
      assert(handler.called);
      assert.equals(element.domElement.style.opacity, '1');
      assert.equals(element.domElement.style.display, 'inline');
      done();
    }, 800);
  }
});
