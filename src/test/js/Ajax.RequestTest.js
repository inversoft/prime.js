/*
 * Copyright (c) 2012-2016, Inversoft Inc., All Rights Reserved
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


describe('AJAX tests', function() {
  /**
   * Async test for testing that the context is used for the 'this' reference in event handler calls.
   *
   * @param done The done callback for async testing.
   */
  it('context', function(done) {
    var MyClass = function() {
      Prime.Utils.bindAll(this);
      this.called = false;
    };

    MyClass.prototype = {
      handleFunction: function() {
        this.called = true;
      }
    };

    var handler = new MyClass();
    new Prime.Ajax.Request('/ajax/ajax-response.html').
      withSuccessHandler(handler.handleFunction).
      go();

    setTimeout(function() {
      assert.isTrue(handler.called);
      done();
    }, 200);
  });

  it('data array', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html', 'POST').
      withData({
      array: ['value1', 'value2'],
      name: 'value'
      });

    assert.equal(req.body, 'array=value1&array=value2&name=value');
    assert.isNull(req.queryParams);
    assert.equal(req.contentType, 'application/x-www-form-urlencoded');
  });

  it('data array empty', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html', 'POST').
      withData({
      name1: 'value1',
      array: [],
      name2: 'value2'
      });

    assert.equal(req.body, 'name1=value1&name2=value2');
    assert.isNull(req.queryParams);
    assert.equal(req.contentType, 'application/x-www-form-urlencoded');
  });

  it('data POST', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html', 'POST').
      withData({
      name: 'value',
        'nameWith=': 'value',
        'valueWith=': 'value='
      });

    assert.equal(req.body, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.isNull(req.queryParams);
    assert.equal(req.contentType, 'application/x-www-form-urlencoded');
  });

  it('data GET', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html').
        withContentType('application/json').
        withData({
      name: 'value',
          'nameWith=':'value',
          'valueWith=':'value='
        });

    assert.equal(req.queryParams, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.isNull(req.body);
    assert.equal(req.contentType, 'application/json');

    req.xhr = new Mock.XHR();
    req.go();

    assert.equal(req.xhr.url, '/ajax/invalid.html?name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.equal(req.xhr.method, 'GET');
  });

  it('headers', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html')
        .withHeader('foo', 'bar')
        .withHeaders({
          bar: 'baz',
          jim: 'bob'
        })
        .withHeader('foo', 'bar')
        .go();

    // all I can really do is assert we stored them correctly to be set on the request
    assert.equal(req.headers['foo'], 'bar');
    assert.equal(req.headers['bar'], 'baz');
    assert.equal(req.headers['jim'], 'bob');
    assert.equal(req.headers['xyz'], undefined);
  });

  it('reset', function() {
    var req = new Prime.Ajax.Request('/ajax/invalid.html').
        withContentType('application/json').
        withData({
      name: 'value',
          'nameWith=':'value',
          'valueWith=':'value='
        });

    assert.equal(req.queryParams, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.equal(req.contentType, 'application/json');
    assert.equal(req.method, 'GET');

    req.reset();
    assert.isNull(req.queryParams);
    assert.isNull(req.contentType);
    assert.equal(req.method, 'GET');
  });

  /**
   * Async test for error completion handling.
   *
   * @param done The done callback for async testing.
   */
  it('error', function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('/ajax/invalid.html').
      withErrorHandler(handler).
      go();

    setTimeout(function() {
      assert.isTrue(called);
      done();
    }, 200);
  });

  /**
   * Async test for loading handling.
   *
   * @param done The done callback for async testing.
   */
  it('loading', function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('/ajax/ajax-response.html').
      withLoadingHandler(handler).
      go();

    setTimeout(function() {
      assert.isTrue(called);
      done();
    }, 200);
  });

  /**
   * Async test for open handling.
   *
   * @param done The done callback for async testing.
   */
  it('open', function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('/ajax/ajax-response.html').
      withOpenHandler(handler).
      go();

    setTimeout(function() {
      assert.isTrue(called);
      done();
    }, 200);
  });

  /**
   * Async test for send handling.
   *
   * @param done The done callback for async testing.
   */
  it('send', function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('/ajax/ajax-response.html').
      withSendHandler(handler).
      go();

    setTimeout(function() {
      assert.isTrue(called);
      done();
    }, 200);
  });

  /**
   * Async test for testing that the context is used for the 'this' reference in event handler calls.
   *
   * @param done The done callback for async testing.
   */
  it('subclass', function(done) {
    class MyAjaxRequest extends Prime.Ajax.Request {
      constructor(url) {
        super(url);
        this.called = false;
      }

      onSuccess() {
        this.called = true;
      }
    }

    // Extend and override the success handler

    var ajax = new MyAjaxRequest('/ajax/ajax-response.html').go();

    setTimeout(function() {
      assert.isTrue(ajax.called);
      done();
    }, 200);
  });

  /**
   * Async test for successful completion handling.
   *
   * @param done The done callback for async testing.
   */
  it('success', function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('/ajax/ajax-response.html').
      withSuccessHandler(handler).
      go();

    setTimeout(function() {
      assert.isTrue(called);
      done();
    }, 200);
  });

  /**
   * Async test for JSON response handling.
   *
   * @param done The done callback for async testing.
   */
  it('responseType', function(done) {
    var json = null;
    var handler = function(xhr) {
      json = JSON.parse(xhr.responseText);
    };

    var request = new Prime.Ajax.Request('/ajax/ajax-response.json').withSuccessHandler(handler);
    request.xhr.overrideMimeType("application/json");
    request.go();

    setTimeout(function() {
      assert.isTrue(json.success);
      done();
    }, 200);
  });
});