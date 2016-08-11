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

buster.testCase('Prime.Template', {
  'generate with no replaces': function() {
    var template = new Prime.Template("<span>foo</span>");
    var string = template.generate();
    assert.equals(string, '<span>foo</span>');
  },

  'generate with simple key replacement': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var string = template.generate({'foo': 'bar'});
    assert.equals(string, '<span>bar</span>');
  },

  'generate with simple function replacement': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var string = template.generate({'foo': function() {
      return 'baz'
    }});
    assert.equals(string, '<span>baz</span>');
  },

  'generate with multiple times replacement': function() {
    var template = new Prime.Template("<span>#{foo}#{foo}</span>");
    var string = template.generate({'foo': 'waldo'});
    assert.equals(string, '<span>waldowaldo</span>');
  },

  'generate with multiple key replacement': function() {
    var template = new Prime.Template("<span>#{foo} #{bar}</span>");
    var string = template.generate({'foo': 'where\'s', 'bar': 'waldo?' });
    assert.equals(string, '<span>where\'s waldo?</span>');
  },

  'generate with regex key': function() {
    var template = new Prime.Template("<span>69!</span>");
    var string = template.generate({"/\\d+/": "number blocked"});
    assert.equals(string, '<span>number blocked!</span>');
  },

  'append': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var container = Prime.Document.newElement("<div/>");
    template.appendTo(container, {'foo': 'bar'});
    assert.equals(container.getHTML(), '<span>bar</span>');
  },

  'appendMultiple': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var container = Prime.Document.newElement("<div/>");
    template.appendTo(container, {'foo': 'bar'});
    template.appendTo(container, {'foo': 'baz'});
    assert.equals(container.getHTML(), '<span>bar</span><span>baz</span>');
  },

  'insertBefore': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBefore");

    template.insertBefore(target, {'foo': 'bar'});
    assert.equals(target.domElement.parentNode.children[0].innerHTML, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerHTML, '');
  },

  'insertBeforeMultiple': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBeforeMultiple");

    template.insertBefore(target, {'foo': 'bar'});
    template.insertBefore(target, {'foo': 'baz'});
    assert.equals(target.domElement.parentNode.children[0].innerHTML, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerHTML, 'baz');
    assert.equals(target.domElement.parentNode.children[2].innerHTML, '');
  },

  'insertAfter': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertAfter");

    template.insertAfter(target, {'foo': 'bar'});
    assert.equals(target.domElement.parentNode.children[0].innerHTML, '');
    assert.equals(target.domElement.parentNode.children[1].innerHTML, 'bar');
  },

  'insertAfterMultiple': function() {
    var template = new Prime.Template("<span>#{foo}</span>");
    var target = Prime.Document.queryById("templateInsertBeforeAfter");

    template.insertAfter(target, {'foo': 'bar'});
    template.insertAfter(target, {'foo': 'baz'});
    assert.equals(target.domElement.parentNode.children[2].innerHTML, 'bar');
    assert.equals(target.domElement.parentNode.children[1].innerHTML, 'baz');
    assert.equals(target.domElement.parentNode.children[0].innerHTML, '');
  }
});
