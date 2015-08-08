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
  var timeSeparator = '<span>' + Prime.Widgets.DatePicker.timeSeparator + '</span>';
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
      '  <div class="time">' +
      '    <input size="2" maxlength="2" type="text" name="hour">' + timeSeparator + '<input size="2" maxlength="2" type="text" name="minute">' + timeSeparator + '<input size="2" maxlength="2" type="text" name="second">' +
      '    <select name="am_pm">' +
      '      <option value="am">' + Prime.Widgets.DatePicker.ampm[0] + '</option>' +
      '      <option value="pm">' + Prime.Widgets.DatePicker.ampm[1] + '</option>' +
      '    </select>' +
      '  </div>' +
      '</div>';
  Prime.Document.appendHTML(html);
  this.container = Prime.Document.queryFirst('.prime-date-picker');
  this.calendarBody = this.container.queryFirst('table tbody').addEventListener('click', this._handleDayClick, this);
  this.month = this.container.queryFirst('.month span.month');
  this.time = this.container.queryFirst('div.time');
  this.hours = this.time.queryFirst('input[name=hour]');
  this.minutes = this.time.queryFirst('input[name=minute]');
  this.seconds = this.time.queryFirst('input[name=second]');
  this.ampm = this.time.queryFirst('select[name=am_pm]');
  this.setDate(this.date);

  this.nextMonthAnchor = this.container.queryFirst('.month span.next').addEventListener('click', this._handleNextMonth, this);
  this.previousMonthAnchor = this.container.queryFirst('.month span.prev').addEventListener('click', this._handlePreviousMonth, this);
  this.time.query('input, select').each(function(element) {
    element.addEventListener('change', this._handleTimeChange, this);
  }, this);
};

Prime.Widgets.DatePicker.shortDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
Prime.Widgets.DatePicker.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Prime.Widgets.DatePicker.longDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Prime.Widgets.DatePicker.timeSeparator = ':';
Prime.Widgets.DatePicker.ampm = ['AM', 'PM'];

Prime.Widgets.DatePicker.prototype = {
  /**
   * Destroys the DatePicker Widget
   */
  destroy: function() {
    this.container.removeFromDOM();
  },

  /**
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  nextDay: function() {
    this.setDay(this.date.getDate() + 1);
    this.setDate(this.date);
    return this;
  },

  /**
   * Moves the DatePicker to the next month and redraws the calendar.
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  nextMonth: function() {
    var currentMonth = parseInt(this.month.getDataAttribute('month'));
    this.setMonth(currentMonth + 1);
    return this;
  },

  /**
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  previousDay: function() {
    this.setDay(this.date.getDate() - 1);
    this.setDate(this.date);
    return this;
  },

  /**
   * Moves the DatePicker to the previous month and redraws the calendar.
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  previousMonth: function() {
    var currentMonth = parseInt(this.month.getDataAttribute('month'));
    this.setMonth(currentMonth - 1);
    return this;
  },

  /**
   * Rebuilds the calendar using the date value of the DatePicker. Even if the user has moved to a different month
   * display, this will rebuild the table completely.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  refresh: function() {
    this._setDate();
    this._setTime();
    return this;
  },

  /**
   * Set the day of the month.
   * @param {number} day
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  setDay: function(day) {
    this.date.setDate(day);
    this.setDate(this.date);
    return this;
  },

  /**
   * Sets the date of the DatePicker and redraws the calendar to the month for the date.
   *
   * @param newDate {Date} The new date.
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  setDate: function(newDate) {
    this.date = newDate;
    this.element.setValue(newDate.toString());
    this.refresh();
    return this;
  },

  setMonth: function(month) {
    var currentYear = parseInt(this.month.getDataAttribute('year'));
    if (month < 0) {
      month = 11;
      currentYear--;
    } else if (month > 11) {
      currentYear++;
      month = 0;
    }

    this.month.setAttribute('data-month', month);
    this.month.setAttribute('data-year', currentYear);
    this.month.setHTML(Prime.Widgets.DatePicker.months[month] + ' ' + currentYear);
    this.date.setMonth(month);
    this.date.setYear(currentYear);
    this.setDate(this.date);

    return this;
  },

  /**
   * Sets the time of the DatePicker and redraws the calendar.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  setTime: function() {
    console.info(this.date);
    var hours = this.hours.getValue();
    if (this.ampm.getValue() !== Prime.Widgets.DatePicker.ampm[0]) {
      hours = hours + 12;
      hours = hours.toString();
    }
    this.date.setHours(hours, this.minutes.getValue(), this.seconds.getValue());
    this.setDate(this.date);
    console.info(this.date);
    return this;
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
    var daysInPreviousMonth = this._getDaysInPreviousMonth();
    var startDayOfPreviousMonth = daysInPreviousMonth - startDayOfWeek + 1;
    var startDayOfNextMonth = 1;

    var row = '<tr>';
    var emptyColumns = 0;

    for (var i = 0; i < 7; i++) {

      var dayOfWeek = startDayOfMonth + i;
      // Days of the previous month
      if (dayOfWeek <= startDayOfWeek) {
        row += '<td><a class="prime-inactive" href="#">' + startDayOfPreviousMonth + '</a></td>';
        startDayOfPreviousMonth++;
        emptyColumns++;
      } else if (dayOfWeek > daysInMonth) {
        // Days of the next month
        row += '<td><a class="prime-inactive" href="#">' + startDayOfNextMonth + '</a></td>';
        startDayOfNextMonth++;
      } else {
        // Days in the current month
        var day = dayOfWeek - emptyColumns;
        var selected = this.date.getDate() === day;
        row += '<td><a ' + (selected ? 'class="prime-selected"' : '') + 'href="#">' + day + '</a></td>';
      }
    }

    row += '</tr>';
    return row;
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
   * Return the days in the previous month.
   *
   * @returns {number} The number of days in the month.
   * @private
   */
  _getDaysInPreviousMonth: function() {
    var previous = new Date(this.date);
    previous.setMonth(this.date.getMonth());
    return new Date(previous.getFullYear(), previous.getMonth() + 1, 0).getDate();
  },

  /**
   * Return the first day of the month. 0 based integer where 0 is Sunday and 6 is Saturday.
   *
   * @returns {number} The first day of the month.
   * @private
   */
  _getFirstDayOfMonth: function() {
    return new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
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
   * Handle the click on a day.
   * @parameter {Event} event The click event.
   * @private
   */
  _handleDayClick: function(event) {
    var day = new Prime.Document.Element(event.target);
    if (!day.is('a')) {
      day = day.queryFirst('a');
    }
    this.setDay(day.getHTML());
    return false;
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
  },

  /**
   * Handle time change events.
   * @private
   */
  _handleTimeChange: function() {
    this.setTime();
    return false;
  },

  _setDate: function() {
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

  /**
   *
   * @private
   */
  _setTime: function() {
    // Set Time -- assuming 12 hour time
    var hours = this.date.getHours();
    if (hours == 0) {
      hours = 12;
      this.ampm.setSelectedValues('am')
    } else if (hours > 12) {
      hours -= 12;
      this.ampm.setSelectedValues('pm')
    } else {
      this.ampm.setSelectedValues('am')
    }
    this.hours.setValue(hours);
    this.minutes.setValue(("00" + this.date.getMinutes()).slice(-2));
    this.seconds.setValue(("00" + this.date.getSeconds()).slice(-2));
  }
};