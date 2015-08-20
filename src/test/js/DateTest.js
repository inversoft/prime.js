/*
 * Copyright (c) 2015, Inversoft Inc., All Rights Reserved
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

buster.testCase('Prime.Date namespace tests', {
  'plusDays': function() {
    var date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, 1); // September 2
    assert.equals(date, new Date(2015, 8, 2));

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 1); // October 1
    assert.equals(date, new Date(2015, 9, 1));

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 31); // October 31
    assert.equals(date, new Date(2015, 9, 31));

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 32); // November 1
    assert.equals(date, new Date(2015, 10, 1));

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 11 + 31 + 30 + 31 + 15); // January 16
    assert.equals(date, new Date(2016, 0, 16));

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 365); // September 20
    assert.equals(date, new Date(2016, 8, 20));

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 365 + 11 + 31 + 30 + 31 + 15); // September 20
    assert.equals(date, new Date(2017, 0, 16));

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, -1); // September 19
    assert.equals(date, new Date(2015, 8, 19));

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -1); // August 31
    assert.equals(date, new Date(2015, 7, 31));

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -10); // August 22
    assert.equals(date, new Date(2015, 7, 22));

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -365); // September 1
    assert.equals(date, new Date(2014, 8, 1));

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -365 - 1 - 31 - 31 - 30 - 31 - 30 - 31 - 28 - 31 - 11); // December 20
    assert.equals(date, new Date(2013, 11, 20));
  },

  'plusHours': function() {
    var date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 1); // September 1 1:00am
    assert.equals(date, new Date(2015, 8, 1, 1, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 10); // September 1 10:00am
    assert.equals(date, new Date(2015, 8, 1, 10, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 24); // September 2 12:00am
    assert.equals(date, new Date(2015, 8, 2, 0, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 25); // September 2 1:00am
    assert.equals(date, new Date(2015, 8, 2, 1, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 24 * 32 + 10); // October 3 10:00am
    assert.equals(date, new Date(2015, 9, 3, 10, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -1); // August 31 11:00pm
    assert.equals(date, new Date(2015, 7, 31, 23, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -10); // August 31 2:00pm
    assert.equals(date, new Date(2015, 7, 31, 14, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -24); // August 31 12:00am
    assert.equals(date, new Date(2015, 7, 31, 0, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -25); // August 30 11:00pm
    assert.equals(date, new Date(2015, 7, 30, 23, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -24 * 32 - 10); // July 30 2:00pm
    assert.equals(date, new Date(2015, 6, 30, 14, 0, 0));
  },

  'plusMinutes': function() {
    var date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 1); // September 1 12:01am
    assert.equals(date, new Date(2015, 8, 1, 0, 1, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 10); // September 1 12:10am
    assert.equals(date, new Date(2015, 8, 1, 0, 10, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 60); // September 1 1:00am
    assert.equals(date, new Date(2015, 8, 1, 1, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 61); // September 1 1:01am
    assert.equals(date, new Date(2015, 8, 1, 1, 1, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 60 * 24 * 32 + 10); // October 3 12:10am
    assert.equals(date, new Date(2015, 9, 3, 0, 10, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -1); // August 31 11:59pm
    assert.equals(date, new Date(2015, 7, 31, 23, 59, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -10); // August 31 11:50pm
    assert.equals(date, new Date(2015, 7, 31, 23, 50, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -60); // August 31 11:00pm
    assert.equals(date, new Date(2015, 7, 31, 23, 0, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -61); // August 31 10:59pm
    assert.equals(date, new Date(2015, 7, 31, 22, 59, 0));

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -60 * 24 * 32 - 10); // July 30 11:50pm
    assert.equals(date, new Date(2015, 6, 30, 23, 50, 0));

    date = new Date(2015, 2, 1, 0, 0, 0); // March 1 12:00am
    Prime.Date.plusMinutes(date, -1); // February 28 11:59pm
    assert.equals(date, new Date(2015, 1, 28, 23, 59, 0));

    date = new Date(2015, 1, 28, 23, 59, 0); // February 28 23:59pm
    Prime.Date.plusMinutes(date, 1); // March 1 12:00am
    assert.equals(date, new Date(2015, 2, 1, 0, 0, 0));
  },

  'plusSeconds': function() {
    var date = new Date(2015, 2, 1, 0, 0, 0); // March 1 12:00:00am
    Prime.Date.plusSeconds(date, -1); // February 28 11:59:59pm
    assert.equals(date, new Date(2015, 1, 28, 23, 59, 59));

    date = new Date(2015, 1, 28, 23, 59, 59); // February 28 23:59:59pm
    Prime.Date.plusSeconds(date, 1); // March 1 12:00:00am
    assert.equals(date, new Date(2015, 2, 1, 0, 0, 0));
  },

  'plusMonths': function() {
    var date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 1); // November
    assert.equals(date, new Date(2015, 9, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 4); // January
    assert.equals(date, new Date(2016, 0, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 24); // September
    assert.equals(date, new Date(2017, 8, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 28); // January
    assert.equals(date, new Date(2018, 0, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -4); // May
    assert.equals(date, new Date(2015, 4, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -8); // January
    assert.equals(date, new Date(2015, 0, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -24); // September
    assert.equals(date, new Date(2013, 8, 1));

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -32); // January
    assert.equals(date, new Date(2013, 0, 1));

    date = new Date(2015, 2, 31); // March 31
    Prime.Date.plusMonths(date, -1); // February
    assert.equals(date, new Date(2015, 1, 28));

    date = new Date(2015, 7, 31); // August 31
    Prime.Date.plusMonths(date, -1); // July
    assert.equals(date, new Date(2015, 6, 31));
  }
});
