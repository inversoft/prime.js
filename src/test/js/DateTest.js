/*
 * Copyright (c) 2015-2018, Inversoft Inc., All Rights Reserved
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

describe('Prime.Date namespace tests', function() {
  it('getHourOfDay', function() {
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 0, 0, 0)), 12);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 1, 0, 0)), 1);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 2, 0, 0)), 2);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 3, 0, 0)), 3);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 4, 0, 0)), 4);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 5, 0, 0)), 5);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 6, 0, 0)), 6);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 7, 0, 0)), 7);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 8, 0, 0)), 8);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 9, 0, 0)), 9);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 10, 0, 0)), 10);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 11, 0, 0)), 11);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 12, 0, 0)), 12);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 13, 0, 0)), 1);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 14, 0, 0)), 2);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 15, 0, 0)), 3);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 16, 0, 0)), 4);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 17, 0, 0)), 5);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 18, 0, 0)), 6);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 19, 0, 0)), 7);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 20, 0, 0)), 8);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 21, 0, 0)), 9);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 22, 0, 0)), 10);
    assert.equal(Prime.Date.getHourOfDay(new Date(2015, 8, 1, 23, 0, 0)), 11);
  });

  it('numberOfDaysInMonth', function() {
    assert.equal(Prime.Date.numberOfDaysInMonth(2012, 1), 29); // Feb 2012 - leap year
    assert.equal(Prime.Date.numberOfDaysInMonth(2013, 1), 28); // Feb 2013
    assert.equal(Prime.Date.numberOfDaysInMonth(2014, 1), 28); // Feb 2014
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 1), 28); // Feb 2015
    assert.equal(Prime.Date.numberOfDaysInMonth(2016, 1), 29); // Feb 2016 - leap year
    assert.equal(Prime.Date.numberOfDaysInMonth(2019, 1), 28); // Feb 2019
    assert.equal(Prime.Date.numberOfDaysInMonth(2020, 1), 29); // Feb 2020 - leap year

    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 0), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 1), 28);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 2), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 3), 30);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 4), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 5), 30);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 6), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 7), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 8), 30);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 9), 31);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 10), 30);
    assert.equal(Prime.Date.numberOfDaysInMonth(2015, 11), 31);
  });

  it('isLeapYear', function() {
    // exceptions to the divided by 100 rule - divided by 400
    assert.isFalse(Prime.Date.isLeapYear(1800));
    assert.isFalse(Prime.Date.isLeapYear(1900));
    assert.isFalse(Prime.Date.isLeapYear(2100));
    assert.isFalse(Prime.Date.isLeapYear(2200));
    assert.isFalse(Prime.Date.isLeapYear(2300));
    assert.isFalse(Prime.Date.isLeapYear(2500));

    assert.isTrue(Prime.Date.isLeapYear(2000));
    assert.isTrue(Prime.Date.isLeapYear(2400));

    assert.isTrue(Prime.Date.isLeapYear(2012));
    assert.isFalse(Prime.Date.isLeapYear(2013));
    assert.isFalse(Prime.Date.isLeapYear(2014));
    assert.isFalse(Prime.Date.isLeapYear(2015));
    assert.isTrue(Prime.Date.isLeapYear(2016));
    assert.isFalse(Prime.Date.isLeapYear(2017));
  });

  it('plusDays', function() {
    var date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, 1); // September 2
    assert.equal(date.toISOString(), new Date(2015, 8, 2).toISOString());

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 1); // October 1
    assert.equal(date.toISOString(), new Date(2015, 9, 1).toISOString());

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 31); // October 31
    assert.equal(date.toISOString(), new Date(2015, 9, 31).toISOString());

    date = new Date(2015, 8, 30); // September 30
    Prime.Date.plusDays(date, 32); // November 1
    assert.equal(date.toISOString(), new Date(2015, 10, 1).toISOString());

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 11 + 31 + 30 + 31 + 15); // January 16
    assert.equal(date.toISOString(), new Date(2016, 0, 16).toISOString());

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 365); // September 20
    assert.equal(date.toISOString(), new Date(2016, 8, 19).toISOString()); // leap year - so subtract a day

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, 365 + 11 + 31 + 30 + 31 + 15); // September 20
    assert.equal(date.toISOString(), new Date(2017, 0, 15).toISOString()); // leap year - so subtract a day

    date = new Date(2015, 8, 20); // September 20
    Prime.Date.plusDays(date, -1); // September 19
    assert.equal(date.toISOString(), new Date(2015, 8, 19).toISOString());

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -1); // August 31
    assert.equal(date.toISOString(), new Date(2015, 7, 31).toISOString());

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -10); // August 22
    assert.equal(date.toISOString(), new Date(2015, 7, 22).toISOString());

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -365); // September 1
    assert.equal(date.toISOString(), new Date(2014, 8, 1).toISOString());

    date = new Date(2015, 8, 1); // September 1
    Prime.Date.plusDays(date, -365 - 1 - 31 - 31 - 30 - 31 - 30 - 31 - 28 - 31 - 11); // December 20
    assert.equal(date.toISOString(), new Date(2013, 11, 20).toISOString());
  });

  it('plusHours', function() {
    var date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 1); // September 1 1:00am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 1, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 10); // September 1 10:00am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 10, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 24); // September 2 12:00am
    assert.equal(date.toISOString(), new Date(2015, 8, 2, 0, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 25); // September 2 1:00am
    assert.equal(date.toISOString(), new Date(2015, 8, 2, 1, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, 24 * 32 + 10); // October 3 10:00am
    assert.equal(date.toISOString(), new Date(2015, 9, 3, 10, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -1); // August 31 11:00pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 23, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -10); // August 31 2:00pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 14, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -24); // August 31 12:00am
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 0, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -25); // August 30 11:00pm
    assert.equal(date.toISOString(), new Date(2015, 7, 30, 23, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusHours(date, -24 * 32 - 10); // July 30 2:00pm
    assert.equal(date.toISOString(), new Date(2015, 6, 30, 14, 0, 0).toISOString());
  });

  it('plusMinutes', function() {
    var date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 1); // September 1 12:01am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 0, 1, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 10); // September 1 12:10am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 0, 10, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 60); // September 1 1:00am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 1, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 61); // September 1 1:01am
    assert.equal(date.toISOString(), new Date(2015, 8, 1, 1, 1, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, 60 * 24 * 32 + 10); // October 3 12:10am
    assert.equal(date.toISOString(), new Date(2015, 9, 3, 0, 10, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -1); // August 31 11:59pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 23, 59, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -10); // August 31 11:50pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 23, 50, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -60); // August 31 11:00pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 23, 0, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -61); // August 31 10:59pm
    assert.equal(date.toISOString(), new Date(2015, 7, 31, 22, 59, 0).toISOString());

    date = new Date(2015, 8, 1, 0, 0, 0); // September 1 12:00am
    Prime.Date.plusMinutes(date, -60 * 24 * 32 - 10); // July 30 11:50pm
    assert.equal(date.toISOString(), new Date(2015, 6, 30, 23, 50, 0).toISOString());

    date = new Date(2015, 2, 1, 0, 0, 0); // March 1 12:00am
    Prime.Date.plusMinutes(date, -1); // February 28 11:59pm
    assert.equal(date.toISOString(), new Date(2015, 1, 28, 23, 59, 0).toISOString());

    date = new Date(2015, 1, 28, 23, 59, 0); // February 28 23:59pm
    Prime.Date.plusMinutes(date, 1); // March 1 12:00am
    assert.equal(date.toISOString(), new Date(2015, 2, 1, 0, 0, 0).toISOString());
  });

  it('plusSeconds', function() {
    var date = new Date(2015, 2, 1, 0, 0, 0); // March 1 12:00:00am
    Prime.Date.plusSeconds(date, -1); // February 28 11:59:59pm
    assert.equal(date.toISOString(), new Date(2015, 1, 28, 23, 59, 59).toISOString());

    date = new Date(2015, 1, 28, 23, 59, 59); // February 28 23:59:59pm
    Prime.Date.plusSeconds(date, 1); // March 1 12:00:00am
    assert.equal(date.toISOString(), new Date(2015, 2, 1, 0, 0, 0).toISOString());
  });

  it('plusMonths', function() {
    var date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 1); // November
    assert.equal(date.toISOString(), new Date(2015, 9, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 4); // January
    assert.equal(date.toISOString(), new Date(2016, 0, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 24); // September
    assert.equal(date.toISOString(), new Date(2017, 8, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, 28); // January
    assert.equal(date.toISOString(), new Date(2018, 0, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -4); // May
    assert.equal(date.toISOString(), new Date(2015, 4, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -8); // January
    assert.equal(date.toISOString(), new Date(2015, 0, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -24); // September
    assert.equal(date.toISOString(), new Date(2013, 8, 1).toISOString());

    date = new Date(2015, 8, 1); // September
    Prime.Date.plusMonths(date, -32); // January
    assert.equal(date.toISOString(), new Date(2013, 0, 1).toISOString());

    date = new Date(2015, 2, 31); // March 31
    Prime.Date.plusMonths(date, -1); // February
    assert.equal(date.toISOString(), new Date(2015, 1, 28).toISOString());

    date = new Date(2015, 7, 31); // August 31
    Prime.Date.plusMonths(date, -1); // July
    assert.equal(date.toISOString(), new Date(2015, 6, 31).toISOString());
  });

  it('toISODateString', function() {
    var date = new Date(2015, 6, 4); // July 4th 2015
    assert.equal(Prime.Date.toDateOnlyISOString(date), '2015-07-04');
  });

  it('toDateOnlyISOString', function() {
    var date = new Date(2018, 6, 13); // July 13th 2018
    assert.equal(Prime.Date.toDateOnlyISOString(date), '2018-07-13');

    // Regardless of the time of day, we should find the same day
    let hour = 0;
    while (hour < 24) {
      date = new Date(2018, 6, 13, hour); // July 13th 2018 @ [0-23] $hour
      assert.equal(Prime.Date.toDateOnlyISOString(date), '2018-07-13');
      hour++;
    }
  });
});
