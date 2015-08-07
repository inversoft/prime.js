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

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new DatePicker object for the given input element.
 *
 * @param {Prime.Document.Element} element The Prime Element for the DatePicker widget.
 * @constructor
 */
Prime.Widgets.DatePicker = function(element) {
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);
  if (!this.element.is('input')) {
    throw new TypeError('You can only use Prime.Widgets.DatePicker with an input element');
  }

  var value = this.element.getValue();
  if (value === '' || value === null) {
    this.date = new Date();
  } else {
    this.date = new Date(value);
  }

  var year = this.date.getUTCFullYear();
  var html =
      '<div class="prime-date-picker">' +
      '  <div class="month">' +
      '    <span class="prev">&#9664;</span>' +
      '    <span class="month" data-month="' + this.date.getMonth() + '" data-year="' + year + '">' + Prime.Widgets.DatePicker.months[this.date.getMonth()] + ' ' + year + '</span>' +
      '    <span class="next">&#9654;</span>' +
      '  </div>' +
      '  <table class="month">' +
      '    <thead>' +
      '      <tr>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[0] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[1] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[2] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[3] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[4] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[5] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.shortDayNames[6] + '</th>' +
      '      </tr>' +
      '    </thead>' +
      '    <tbody>' +
      '    </tbody>' +
      '  </table>' +
      '</div>';
  Prime.Document.appendHTML(html);
  this.container = Prime.Document.queryFirst('.prime-date-picker');
  this.calendarBody = this.container.queryFirst('table tbody');

  this.setDate(this.date);

  this.nextMonthAnchor = this.container.queryFirst('.month span.next').addEventListener('click', this._handleNextMonth, this);
  this.previousMonthAnchor = this.container.queryFirst('.month span.prev').addEventListener('click', this._handlePreviousMonth, this);
  this.month = this.container.queryFirst('.month span.month');
};

Prime.Widgets.DatePicker.shortDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
Prime.Widgets.DatePicker.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Prime.Widgets.DatePicker.longDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


Prime.Widgets.DatePicker.prototype = {
  /**
   * Destroys the DatePicker Widget
   */
  destroy: function() {
    this.container.removeFromDOM();
  },

  /**
   * Moves the DatePicker to the next month and redraws the calendar.
   */
  nextMonth: function() {
    var currentMonth = parseInt(this.month.getDataAttribute('month'));
    var currentYear = parseInt(this.month.getDataAttribute('year'));
    if (currentMonth < 11) {
      currentMonth++;
    } else {
      currentYear++;
      currentMonth = 0;
    }

    this.month.setAttribute('data-month', currentMonth);
    this.month.setAttribute('data-year', currentYear);
    this.month.setHTML(Prime.Widgets.DatePicker.months[currentMonth] + ' ' + currentYear);
    this.date.setMonth(currentMonth);
    this.date.setYear(currentYear);
    this.setDate(this.date);
  },

  /**
   * Moves the DatePicker to the previous month and redraws the calendar.
   */
  previousMonth: function() {
    var currentMonth = parseInt(this.month.getDataAttribute('month'));
    var currentYear = parseInt(this.month.getDataAttribute('year'));
    if (currentMonth > 0) {
      currentMonth--;
    } else {
      currentYear--;
      currentMonth = 11;
    }

    this.month.setAttribute('data-month', currentMonth);
    this.month.setAttribute('data-year', currentYear);
    this.month.setHTML(Prime.Widgets.DatePicker.months[currentMonth] + ' ' + currentYear);
    this.date.setMonth(currentMonth);
    this.date.setYear(currentYear);
    this.setDate(this.date);
  },

  /**
   * Rebuilds the calendar using the date value of the DatePicker. Even if the user has moved to a different month
   * display, this will rebuild the table completely.
   */
  rebuildCalendar: function() {
    var firstDayOfMonth = this._getFirstDayOfMonth();
    var daysInMonth = this._getDaysInMonth();

    var rows = '';
    var weeksInMonth = this._getWeeksInMonth();

    var startDay = 1;
    for (var i = 0; i < weeksInMonth; i++) {
      var startDayOfWeek = i === 0 ? firstDayOfMonth : 0;
      rows += this._buildCalendarWeek(startDayOfWeek, startDay, daysInMonth);
      startDay += 7 - startDayOfWeek; // increment by 7 adjusted by a week day of week offset
    }

    this.calendarBody.setHTML(rows);
  },

  setDate: function(newDate) {
    this.date = newDate;
    this.element.setValue(newDate.toString());
    this.rebuildCalendar();
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Build the HTML for a single calendar week.
   *
   * @param {number} startDayOfWeek The day of the week of this week begins. A 0 based number between 0 and 6.
   * @param {number} startDayOfMonth The day of the month this week begins. A number between 1 and 31.
   * @param {number} daysInMonth The number of days in this calendar month.
   * @returns {string} The HTML for this week.
   * @private
   */
  _buildCalendarWeek: function(startDayOfWeek, startDayOfMonth, daysInMonth) {
    var row = '<tr>';
    var emptyColumns = 0;
    for (var i = 0; i < 7; i++) {

      var dayOfWeek = startDayOfMonth + i;
      if (dayOfWeek <= startDayOfWeek || dayOfWeek > daysInMonth) {
        row += this._buildCalendarDay(null);
        emptyColumns++;
      } else {
        row += this._buildCalendarDay(dayOfWeek - emptyColumns);
      }
    }

    row += '</tr>';
    return row;
  },

  /**
   * Build the HTML for a single calendar day
   * @param {number} day The day of the month. A number between 0 and 31. May be null to indicate an empty day on the calendar.
   * @returns {string} The HTML for this day.
   * @private
   */
  _buildCalendarDay: function(day) {
    if (day === null) {
      return '<td>&nbsp;</td>';
    } else {
      return '<td><a href="#">' + day + '</a></td>';
    }
  },

  /**
   * Return the days in this month
   *
   * @returns {number} The number of days in the month.
   * @private
   */
  _getDaysInMonth: function() {
    return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
  },

  /**
   * Return the first day of the month. 0 based integer where 0 is Sunday and 6 is Saturday.
   *
   * @returns {number} The first day of the month.
   * @private
   */
  _getFirstDayOfMonth: function() {
    return new Date(this.date.getMonth(), this.date.getFullYear(), 1).getDay();
  },

  /**
   * Return the number of weeks in this calendar month.
   *
   * @returns {number} The number of weeks in the specified month. A number between 1 and 6.
   * @private
   */
  _getWeeksInMonth: function() {
    var firstDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    var lastDay = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
    var used = firstDay.getDay() + lastDay.getDate();
    return Math.ceil(used / 7);
  },

  /**
   * Handle the next month button click.
   *
   * @private
   */
  _handleNextMonth: function() {
    this.nextMonth();
    return false;
  },

  /**
   * Handle the previous month button click.
   *
   * @private
   */
  _handlePreviousMonth: function() {
    this.previousMonth();
    return false;
  }
};