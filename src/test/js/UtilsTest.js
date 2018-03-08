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
// Cannot set strict on this test because you can't modify the window object in strict mode
// 'use strict';

describe('Utils tests', function() {

  // Failure test to see if a proper line number is returned.
  // it('fail', function() {
  //   assert.fail();
  // });

  it('bindAll', function() {
    function MyClass() {
      this.calledOne = false;
      this.calledTwo = false;
    };

    MyClass.prototype = {
      one: function() {
        this.calledOne = true;
      },

      _two: function() {
        this.calledTwo = true;
      }
    };

    // Detach the functions from the object so that the 'this' reference is broken
    var myClass = new MyClass();
    var funcOne = myClass.one;
    var funcTwo = myClass._two;
    funcOne();
    funcTwo();
    assert.isFalse(myClass.calledOne);
    assert.isFalse(myClass.calledTwo);

    // Bind all
    Prime.Utils.bindAll(myClass);
    funcOne = myClass.one;
    funcTwo = myClass._two;
    funcOne();
    funcTwo();
    assert.isTrue(myClass.calledOne);
    assert.isTrue(myClass.calledTwo);
  });

  it('callIteratively', function(done) {
    var count = 0;
    function call() {
      count++;
    }

    Prime.Utils.callIteratively(1000, 10, call);

    setTimeout(function() {
      assert.equal(count, 10);
      done();
    }, 1100);
  });

  it('callIterativelyWithEndFunction', function(done) {
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
      assert.equal(count, 10);
      assert(ended);
      done();
    }, 1100);
  });

  it('callIterativelyWithEndFunctionAndContext', function(done) {
    var CallIterativelyClass = function() {
      Prime.Utils.bindAll(this);
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
    Prime.Utils.callIteratively(1000, 10, instance.call, instance.end);

    setTimeout(function() {
      assert.equal(instance.count, 10);
      assert.isTrue(instance.ended);
      done();
    }, 1100);
  });

  it('capitalize', function() {
    assert.equal(Prime.Utils.capitalize('fred'), 'Fred');
    assert.equal(Prime.Utils.capitalize('-fred'), '-fred');
    assert.equal(Prime.Utils.capitalize(''), '');
  });

  it('convertStyleName', function() {
    assert.equal(Prime.Utils.convertStyleName('-moz-box-shadow'), 'MozBoxShadow')
    assert.equal(Prime.Utils.convertStyleName('text-align'), 'textAlign')
    assert.equal(Prime.Utils.convertStyleName('top'), 'top')
  });

  it('dataSetToOptions', function() {
    var element = Prime.Document.queryFirst('#data-set-to-options input[name=one]');
    assert.deepEqual(Prime.Utils.dataSetToOptions(element), {foo: 2, bar: '2 + 1'});
    element = Prime.Document.queryFirst('#data-set-to-options input[name=two]');
    assert.deepEqual(Prime.Utils.dataSetToOptions(element), {foo: true, bar: false});
    element = Prime.Document.queryFirst('#data-set-to-options input[name=three]');
    assert.deepEqual(Prime.Utils.dataSetToOptions(element), {foo: 'bar'});
  });

  it('removeAllFromArray', function() {
    var array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['a', 'c']);
    assert.deepEqual(array, ['b', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['d', 'e']);
    assert.deepEqual(array, ['a', 'b', 'c']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeAllFromArray(array, ['a', 'b', 'c', 'd', 'e']);
    assert.deepEqual(array, []);
  });

  it('escapeHTML', function() {
    assert.equal(Prime.Utils.escapeHTML('<html>'), '&lt;html&gt;')
  });

  it('removeFromArray', function() {
    var array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'c');
    assert.deepEqual(array, ['a', 'b', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'a');
    assert.deepEqual(array, ['b', 'c', 'd', 'e']);

    array = ['a', 'b', 'c', 'd', 'e'];
    Prime.Utils.removeFromArray(array, 'e');
    assert.deepEqual(array, ['a', 'b', 'c', 'd']);
  });
});