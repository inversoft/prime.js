/*
 * Copyright (c) 2016-2017, Inversoft Inc., All Rights Reserved
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

describe('DateTimePicker class tests', function() {
  before(function() {
    this.input = Prime.Document.queryById('datetimepicker-test1');
    this.dateWidget = new Prime.Widgets.DateTimePicker(this.input).initialize();
  });

  after(function() {
    this.dateWidget.destroy();
    this.dateWidget = null;
  });

  it('next month', function() {
    // start at March 31st and clicking next month should be correct.
    var newDate = new Date();
    newDate.setMonth(2);
    newDate.setDate(31);
    this.dateWidget.setDate(newDate);

    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 3); // April
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 4); // May
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 5); // June
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 6); // July
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 7); // August
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 8); // September
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 9); // October
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 10); // November
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 11); // December
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 0); // January
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 1); // February
    assert.equal(this.dateWidget.nextMonth().monthDisplay.getDataAttribute('month'), 2); // March
  });

  it('previous month', function() {
    // start at March 31st and clicking next month should be correct.
    var newDate = new Date();
    newDate.setMonth(2);
    newDate.setDate(31);
    this.dateWidget.setDate(newDate);

    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 1); // February
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 0); // January
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 11); // December
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 10); // November
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 9); // October
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 8); // September
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 7); // August
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 6); // July
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 5); // June
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 4); // May
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 3); // April
    assert.equal(this.dateWidget.previousMonth().monthDisplay.getDataAttribute('month'), 2); // March
  });
});
