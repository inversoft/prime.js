/*
 * Copyright (c) 2013, Inversoft Inc., All Rights Reserved
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

describe('Prime.Template', function() {
  it('generate with no replaces', function() {
    var template = new Prime.Template("<span>foo</span>");
    var string = template.generate();
    assert.equal(string, '<span>foo</span>');
  });

  it('generate with simple key replacement', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var string = template.generate({foo: 'bar'});
    assert.equal(string, '<span>bar</span>');
  });

  it('generate with simple function replacement', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var string = template.generate({
      foo: function() {
      return 'baz'
    }});
    assert.equal(string, '<span>baz</span>');
  });

  it('generate with multiple times replacement', function() {
    var template = new Prime.Template("<span>#{foo}#{foo}</span>");
    var string = template.generate({foo: 'waldo'});
    assert.equal(string, '<span>waldowaldo</span>');
  });

  it('generate with multiple key replacement', function() {
    var template = new Prime.Template("<span>#{foo} #{bar}</span>");
    var string = template.generate({foo: 'where\'s', bar: 'waldo?'});
    assert.equal(string, '<span>where\'s waldo?</span>');
  });

  it('generate with regex key', function() {
    var template = new Prime.Template("<span>69!</span>");
    var string = template.generate({'/\\d+/': "number blocked"});
    assert.equal(string, '<span>number blocked!</span>');
  });

  it('append', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var container = Prime.Document.newElement("<div/>");
    template.appendTo(container, {foo: 'bar'});
    assert.equal(container.getHTML(), '<span>bar</span>');
  });

  it('appendMultiple', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var container = Prime.Document.newElement("<div/>");
    template.appendTo(container, {foo: 'bar'});
    template.appendTo(container, {foo: 'baz'});
    assert.equal(container.getHTML(), '<span>bar</span><span>baz</span>');
  });

  it('insertBefore', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBefore");

    template.insertBefore(target, {foo: 'bar'});
    assert.equal(target.domElement.parentNode.children[0].innerHTML, 'bar');
    assert.equal(target.domElement.parentNode.children[1].innerHTML, '');
  });

  it('insertBeforeMultiple', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBeforeMultiple");

    template.insertBefore(target, {foo: 'bar'});
    template.insertBefore(target, {foo: 'baz'});
    assert.equal(target.domElement.parentNode.children[0].innerHTML, 'bar');
    assert.equal(target.domElement.parentNode.children[1].innerHTML, 'baz');
    assert.equal(target.domElement.parentNode.children[2].innerHTML, '');
  });

  it('insertAfter', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertAfter");

    template.insertAfter(target, {foo: 'bar'});
    assert.equal(target.domElement.parentNode.children[0].innerHTML, '');
    assert.equal(target.domElement.parentNode.children[1].innerHTML, 'bar');
  });

  it('insertAfterMultiple', function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBeforeAfter");

    template.insertAfter(target, {foo: 'bar'});
    template.insertAfter(target, {foo: 'baz'});
    assert.equal(target.domElement.parentNode.children[2].innerHTML, 'bar');
    assert.equal(target.domElement.parentNode.children[1].innerHTML, 'baz');
    assert.equal(target.domElement.parentNode.children[0].innerHTML, '');
  });
});
