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

buster.testCase('Utils tests', {
  setUp: function() {
    this.timeout = 2000;
  },

  'callIteratively': function(done) {
    var count = 0;
    function call() {
      count++;
    }

    Prime.Utils.callIteratively(1000, 10, call);

    setTimeout(function() {
      assert.equals(count, 10);
      done();
    }, 1100);
  },

  'callIterativelyWithEndFunction': function(done) {
    var count = 0;
    function call() {
      count++;
    }

    var ended = false;
    function end() {
      ended = true;
    }

    Prime.Utils.callIteratively(1000, 10, call, end);

    setTimeout(function() {
      assert.equals(count, 10);
      assert(ended);
      done();
    }, 1100);
  },

  'callIterativelyWithEndFunctionAndContext': function(done) {
    var CallIterativelyClass = function() {
      this.count = 0;
      this.ended = false;
    };
    CallIterativelyClass.prototype = {
      call: function() {
        this.count++;
      },

      end: function() {
        this.ended = true;
      }
    };

    var instance = new CallIterativelyClass();
    Prime.Utils.callIteratively(1000, 10, instance.call, instance.end, instance);

    setTimeout(function() {
      assert.equals(instance.count, 10);
      assert(instance.ended);
      done();
    }, 1100);
  },

  'removeAllFromArray': function() {
    var array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['a', 'c']);
    assert.equals(array, ['b', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['d', 'e']);
    assert.equals(array, ['a', 'b', 'c']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['a', 'b', 'c', 'd', 'e']);
    assert.equals(array, []);
  },

  'removeFromArray': function() {
    var array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'c');
    assert.equals(array, ['a', 'b', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'a');
    assert.equals(array, ['b', 'c', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'e');
    assert.equals(array, ['a', 'b', 'c', 'd']);
  }
});