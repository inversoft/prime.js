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

var Prime = Prime || {};

Prime.Date = {
  daysInMonths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

  numberOfDaysInMonth: function(month) {
    return Prime.Date.daysInMonths[month];
  },

  /**
   * Adds the given number of days to the given Date.
   *
   * @param date {Date} The date to add the days to.
   * @param number {Number} The number of days to add.
   */
  plusDays: function(date, number) {
    if (number === 0) {
      return;
    }

    console.log(date.getDate());
    var newDate = date.getDate() + number;
    var numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());

    if (newDate > 0) {
      // currentDate = 31  numberOfDaysInMonth = 31  number = 1  newDate = 32  newMonth = 0 (newMonth = 1  newDate = 1)
      // currentDate = 30  numberOfDaysInMonth = 31  number = 10  newDate = 40  newMonth = 0 (newMonth = 1  newDate = 9)
      // currentDate = 30  numberOfDaysInMonth = 31  number = 100  newDate = 130  newMonth = 0 (newMonth = 1  newDate = 99) (newMonth = 2  newDate = 71) (newMonth = 3  newDate = 40) (newMonth = 4  newDate = 9)
      console.log('start');
      console.log('newDate=' + newDate);
      console.log('numberOfDaysInMonth=' + numberOfDaysInMonth);
      while (newDate > numberOfDaysInMonth) {
        Prime.Date.plusMonths(date, 1);
        newDate = newDate - numberOfDaysInMonth;
        numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());
        console.log('newDate=' + newDate);
        console.log('numberOfDaysInMonth=' + numberOfDaysInMonth);
      }

      console.log('done');
      date.setDate(newDate);
    } else {
      // currentDate = 30  numberOfDaysInMonth = 31  number = -10  newDate = 20 newMonth = 0 (newMonth = 0  newDate = 20)
      // currentDate = 30  numberOfDaysInMonth = 31  number = -30 newDate = 0 newMonth = 0 (newMonth = -1  newDate = 31)
      // currentDate = 30  numberOfDaysInMonth = 31  number = -100 newDate = -70 newMonth = 0 (newMonth = -1  newDate = -39) (newMonth = -2  newDate = -9) (newMonth = -3  newDate = 22)
      while (newDate <= 0) {
        Prime.Date.plusMonths(date, -1);
        numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());
        newDate = newDate + numberOfDaysInMonth;
      }

      date.setDate(newDate);
    }
  },

  /**
   * Adds the given number of months to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {Number} The number of months to add.
   */
  plusMonths: function(date, number) {
    if (number === 0) {
      return;
    }

    // number = 8  deltaYears = 0  deltaMonths = 8
    // number = 80  deltaYears = 6  deltaMonths = 8
    // number = -8  deltaYears = 0  deltaMonths = -8
    // number = -80  deltaYears = 6  deltaMonths = -8
    var deltaYears = parseInt(number / 12);
    var deltaMonths = number % 12;
    //console.log('deltaYears=' + deltaYears);
    //console.log('deltaMonths=' + deltaMonths);

    // month = 4[May]        deltaMonths = -8  newMonth = -4  after(deltaMonths = -4  currentMonth = 12  result = 8[September])
    // month = 8[September]  deltaMonths = 8   newMonth = 16  after(deltaMonth = 4    currentMonth = 0   result = 4[May])
    var currentMonth = date.getMonth();
    var newMonth = currentMonth + deltaMonths;
    //console.log('currentMonth=' + currentMonth);
    //console.log('newMonth=' + newMonth);
    if (newMonth < 0) {
      deltaYears--;
      deltaMonths = newMonth;
      currentMonth = 12;
    } else if (newMonth >= 12) {
      deltaYears++;
      deltaMonths = newMonth - 12;
      currentMonth = 0;
    }
    //console.log('deltaYears=' + deltaYears);
    //console.log('deltaMonths=' + deltaMonths);
    //console.log('currentMonth=' + currentMonth);

    date.setYear(date.getFullYear() + deltaYears);
    date.setMonth(currentMonth + deltaMonths);
  }
};