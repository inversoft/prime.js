/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
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

describe('Reorder class tests', function() {
  it('basic function', function() {

    let table = Prime.Document.queryById('reorder-test');
    let reorder = new Prime.Widgets.Reorder(table)
        .withItemSelector('tbody tr')
        .initialize();

    assert.isNotNull(reorder);
    assert.equal(table, reorder.element);

    // Assert initial values and indicies
    assert.equal(table.queryFirst('tbody td.company-name-1').getHTML(), 'Acme Corp');
    assert.equal(table.queryFirst('tbody td.company-name-2').getHTML(), 'Umbrella Corp');
    assert.equal(table.queryFirst('tbody td.company-name-3').getHTML(), 'Wayne Industries');

    assert.equal(table.queryFirst('tbody td.company-name-1').queryUp('tr').getDataAttribute('index'), '0');
    assert.equal(table.queryFirst('tbody td.company-name-2').queryUp('tr').getDataAttribute('index'), '1');
    assert.equal(table.queryFirst('tbody td.company-name-3').queryUp('tr').getDataAttribute('index'), '2');

    // Move the first row down
    let firstRow = table.queryFirst('tbody tr:first-of-type');
    reorder.moveDown(firstRow);

    // The rows will not change, but the index will
    assert.equal(table.queryFirst('tbody td.company-name-1').getHTML(), 'Acme Corp');
    assert.equal(table.queryFirst('tbody td.company-name-2').getHTML(), 'Umbrella Corp');
    assert.equal(table.queryFirst('tbody td.company-name-3').getHTML(), 'Wayne Industries');

    // Assert new indices
    assert.equal(table.queryFirst('tbody td.company-name-1').queryUp('tr').getDataAttribute('index'), '1');
    assert.equal(table.queryFirst('tbody td.company-name-2').queryUp('tr').getDataAttribute('index'), '0');
    assert.equal(table.queryFirst('tbody td.company-name-3').queryUp('tr').getDataAttribute('index'), '2');

    // Move the last row up
    let lastRow = table.queryFirst('tbody tr:last-of-type');
    reorder.moveUp(lastRow);

    // The rows will not change, but the index will
    assert.equal(table.queryFirst('tbody td.company-name-1').getHTML(), 'Acme Corp');
    assert.equal(table.queryFirst('tbody td.company-name-2').getHTML(), 'Umbrella Corp');
    assert.equal(table.queryFirst('tbody td.company-name-3').getHTML(), 'Wayne Industries');

    // Assert new indices
    assert.equal(table.queryFirst('tbody td.company-name-1').queryUp('tr').getDataAttribute('index'), '2');
    assert.equal(table.queryFirst('tbody td.company-name-2').queryUp('tr').getDataAttribute('index'), '0');
    assert.equal(table.queryFirst('tbody td.company-name-3').queryUp('tr').getDataAttribute('index'), '1');

  });
});
