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
  DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

  numberOfDaysInMonth: function(month) {
    return Prime.Date.DAYS_IN_MONTH[month];
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

    var newDate = date.getDate() + number;
    var numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());

    if (newDate > 0) {
      while (newDate > numberOfDaysInMonth) {
        Prime.Date.plusMonths(date, 1);
        newDate = newDate - numberOfDaysInMonth;
        numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());
      }

      date.setDate(newDate);
    } else {
      while (newDate <= 0) {
        Prime.Date.plusMonths(date, -1);
        numberOfDaysInMonth = Prime.Date.numberOfDaysInMonth(date.getMonth());
        newDate = newDate + numberOfDaysInMonth;
      }

      date.setDate(newDate);
    }
  },

  /**
   * Adds the given number of hours to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {Number} The number of hours to add.
   */
  plusHours: function(date, number) {
    if (number === 0) {
      return;
    }

    var deltaDays = parseInt(number / 24);
    Prime.Date.plusDays(date, deltaDays);

    var deltaHours = number % 24;
    var newHour = date.getHours() + deltaHours;
    if (newHour > 23) {
      Prime.Date.plusDays(date, 1);
      date.setHours(newHour - 24);
    } else if (newHour < 0) {
      Prime.Date.plusDays(date, -1);
      date.setHours(24 + newHour);
    } else {
      date.setHours(newHour);
    }
  },

  /**
   * Adds the given number of minutes to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {Number} The number of minutes to add.
   */
  plusMinutes: function(date, number) {
    if (number === 0) {
      return;
    }

    var deltaHours = parseInt(number / 60);
    Prime.Date.plusHours(date, deltaHours);

    var deltaMinutes = number % 60;
    var newMinute = date.getMinutes() + deltaMinutes;
    if (newMinute > 60) {
      Prime.Date.plusHours(date, 1);
      date.setMinutes(newMinute - 60);
    } else if (newMinute < 0) {
      Prime.Date.plusHours(date, -1);
      date.setMinutes(60 + newMinute);
    } else {
      date.setMinutes(newMinute);
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

    var deltaYears = parseInt(number / 12);
    var deltaMonths = number % 12;
    var currentMonth = date.getMonth();
    var newMonth = currentMonth + deltaMonths;
    if (newMonth < 0) {
      deltaYears--;
      deltaMonths = newMonth;
      currentMonth = 12;
    } else if (newMonth >= 12) {
      deltaYears++;
      deltaMonths = newMonth - 12;
      currentMonth = 0;
    }

    date.setYear(date.getFullYear() + deltaYears);
    date.setMonth(currentMonth + deltaMonths);
  },

  /**
   * Adds the given number of seconds to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {Number} The number of seconds to add.
   */
  plusSeconds: function(date, number) {
    if (number === 0) {
      return;
    }

    var deltaMinutes = parseInt(number / 60);
    Prime.Date.plusMinutes(date, deltaMinutes);

    var deltaSeconds = number % 60;
    var newSecond = date.getSeconds() + deltaSeconds;
    if (newSecond > 60) {
      Prime.Date.plusMinutes(date, 1);
      date.setSeconds(newSecond - 60);
    } else if (newSecond < 0) {
      Prime.Date.plusMinutes(date, -1);
      date.setSeconds(60 + newSecond);
    } else {
      date.setSeconds(newSecond);
    }
  },

  /**
   * Adds the given number of years to the given Date. The number can be negative.
   *
   * @param date {Date} The date.
   * @param number {Number} The number of years to add.
   */
  plusYears: function(date, number) {
    if (number === 0) {
      return;
    }

    date.setFullYear(date.getFullYear() + number);
  }
};