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

describe('ElementList namespace tests', function() {
  it('query', function() {
    var list = Prime.Document.query('p.test');
    assert.equal(list.length, 3);
    assert.equal(list[0].domElement.id, 'queryOne');
    assert.equal(list[1].domElement.id, 'queryTwo');
    assert.equal(list[2].domElement.id, 'queryThree');

    var parent = Prime.Document.queryById('query');
    list = Prime.Document.query('p.test', parent);
    assert.equal(list[0].domElement.id, 'queryOne');
    assert.equal(list[1].domElement.id, 'queryTwo');
    assert.equal(list[2].domElement.id, 'queryThree');

    list = Prime.Document.query('p.test', parent.domElement);
    assert.equal(list[0].domElement.id, 'queryOne');
    assert.equal(list[1].domElement.id, 'queryTwo');
    assert.equal(list[2].domElement.id, 'queryThree');
  });
});

describe('ElementList class tests', function() {
  it('each', function() {
    var count = 0;
    Prime.Document.query('p.test').each(function(element, index) {
      assert.equal(index, count++);
      assert.isTrue(element instanceof Prime.Document.Element);
      assert.equal(element.domElement.tagName, 'P');
    });

    assert.equal(count, 3);
  });

  it('indexOf Prime Element', function() {
    var container = Prime.Document.queryById("query");
    var list = Prime.Document.query("p", container);

    var one = Prime.Document.queryById("queryOne");
    var two = Prime.Document.queryById("queryTwo");
    var outside = Prime.Document.queryById("insertSingle");

    assert.equal(list.indexOf(one), 0);
    assert.equal(list.indexOf(one.domElement), 0);
    assert.equal(list.indexOf(two), 1);
    assert.equal(list.indexOf(two.domElement), 1);
    assert.equal(list.indexOf(outside), -1);
    assert.equal(list.indexOf(outside.domElement), -1);
  });

  it('addClass and removeClass', function() {
    var container = Prime.Document.queryById("query");
    var list = Prime.Document.query("p", container);

    var one = Prime.Document.queryById("queryOne");
    var two = Prime.Document.queryById("queryTwo");

    list.addClass('foobar');

    assert.isTrue(one.hasClass('foobar'));
    assert.isTrue(two.hasClass('foobar'));

    list.removeClass('foobar');

    assert.isFalse(one.hasClass('foobar'));
    assert.isFalse(two.hasClass('foobar'));
  });

  it('setChecked and setDisabled', function() {
    var container = Prime.Document.queryById("element-list-test");
    var checkboxes =container.query('input[type="checkbox"]');

    checkboxes.setChecked(true);
    checkboxes.each(function(checkbox) {
      assert.isTrue(checkbox.isChecked());
    });

    checkboxes.setChecked(false);
    checkboxes.each(function(checkbox) {
      assert.isFalse(checkbox.isChecked());
    });

    checkboxes.setDisabled(true);
    checkboxes.each(function(checkbox) {
      assert.isTrue(checkbox.isDisabled());
    });

    checkboxes.setDisabled(false);
    checkboxes.each(function(checkbox) {
      assert.isFalse(checkbox.isDisabled());
    });
  });
});