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
      '  <div class="header">' +
      '    <span class="prev">&#9664;</span>' +
      '    <span class="month" data-month="' + this.date.getMonth() + '">' + Prime.Widgets.DatePicker.months[this.date.getMonth()] + '</span>' +
      '    <span class="year" data-year="' + year + '">' + year + '</span>' +
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
      '    <input size="2" maxlength="2" type="text" name="hour">' + timeSeparator + '<input size="2" maxlength="2" type="text" name="minute">' +
      '    <input size="2" maxlength="2" type="text" name="am_pm">' +
      '  </div>' +
      '</div>';
  Prime.Document.appendHTML(html);
  this.datepicker = Prime.Document.queryFirst('.prime-date-picker');
  this.datepicker.hide();
  this.element.addEventListener('click', this._handleInputClick, this);
  this.element.addEventListener('focus', this._handleInputClick, this);

  this.calendarBody = this.datepicker.queryFirst('table tbody').addEventListener('click', this._handleDayClick, this);
  this.month = this.datepicker.queryFirst('.header .month').addEventListener('click', this._handleMonthExpand, this);
  this.year = this.datepicker.queryFirst('.header .year').addEventListener('click', this._handleYearExpand, this);
  this.time = this.datepicker.queryFirst('div.time');
  this.hours = this.time.queryFirst('input[name=hour]').addEventListener('change', this._handleTimeChange, this);
  this.minutes = this.time.queryFirst('input[name=minute]').addEventListener('change', this._handleTimeChange, this);
  this.ampm = this.time.queryFirst('input[name=am_pm]').addEventListener('keydown', this._handleAmPmKey, this);

  this.nextMonthAnchor = this.datepicker.queryFirst('.header .next').addEventListener('click', this._handleNextMonth, this);
  this.previousMonthAnchor = this.datepicker.queryFirst('.header .prev').addEventListener('click', this._handlePreviousMonth, this);

  this.element.addClass('prime-initialized');

  this.setDate(this.date);
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
    this.datepicker.removeFromDOM();
    this.element.removeEventListener('click', this._handleInputClick);
    this.element.removeEventListener('focus', this._handleInputClick);
    new Prime.Document.Element(document.body).removeListener('click', this.hide, this);
    this.element.removeClass('prime-initialized');
  },

  /**
   * Hide the Date Picker widget
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  hide: function() {
    new Prime.Effects.Fade(this.datepicker).withDuration(100).go();
    return this;
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
    this._refreshMonthYear();
    this._refreshCalendar();
    this._refreshTime();
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

  /**
   * @param {number} month The month. A 0 based number between 0 (January) and 11 (December).
   * @returns {Prime.Widgets.DatePicker}
   */
  setMonth: function(month) {
    var currentYear = parseInt(this.year.getDataAttribute('year'));
    if (month < 0) {
      month = 11;
      currentYear--;
    } else if (month > 11) {
      currentYear++;
      month = 0;
    }

    this.date.setMonth(month);
    this.date.setYear(currentYear);
    this.setDate(this.date);

    return this;
  },

  /**
   *
   * @param {number} year The year.
   * @returns {Prime.Widgets.DatePicker}
   */
  setYear: function(year) {
    this.year.setDataAttribute('year', year);
    this.year.setTextContent(year);
    this.date.setYear(year);
    this.setDate(this.date);
    return this;
  },

  /**
   * Sets the time of the DatePicker and redraws the calendar.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  setTime: function() {
    var hours = this.hours.getValue();
    if (this.ampm.getValue() !== Prime.Widgets.DatePicker.ampm[0]) {
      hours = hours + 12;
      hours = hours.toString();
    }
    this.date.setHours(hours, this.minutes.getValue());
    this.setDate(this.date);
    return this;
  },

  /**
   * Show the Date Picker widget
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  show: function() {
    new Prime.Effects.Appear(this.datepicker).withDuration(200).go();
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
    var year = this.date.getFullYear();
    var month = this.date.getMonth();

    for (var i = 0; i < 7; i++) {

      var dayOfWeek = startDayOfMonth + i;
      // Days of the previous month
      if (dayOfWeek <= startDayOfWeek) {
        row += '<td><a class="prime-inactive" href="#" data-year="' + year + '" data-month="' + (month - 1) + '" data-day="' + startDayOfPreviousMonth + '">' + startDayOfPreviousMonth + '</a></td>';
        startDayOfPreviousMonth++;
        emptyColumns++;
      } else if (dayOfWeek > daysInMonth) {
        // Days of the next month
        row += '<td><a class="prime-inactive" href="#" data-year="' + year + '" data-month="' + month + '" data-day="' + dayOfWeek + '">' + startDayOfNextMonth + '</a></td>';
        startDayOfNextMonth++;
      } else {
        // Days in the current month
        var day = dayOfWeek - emptyColumns;
        var selected = this.date.getDate() === day;
        row += '<td><a ' + (selected ? 'class="prime-selected"' : '') + 'href="#" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '">' + day + '</a></td>';
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
    return new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
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

  _handleAmPmKey: function(event) {
    // Decode the key event
    var current = this.ampm.getValue();
    if (event.keyCode === 65) {
      if (current === Prime.Widgets.DatePicker.ampm[1]) {
        this.ampm.setValue(Prime.Widgets.DatePicker.ampm[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    } else if (event.keyCode === 80) {
      if (current === Prime.Widgets.DatePicker.ampm[0]) {
        this.ampm.setValue(Prime.Widgets.DatePicker.ampm[1]);
        this.date.setHours(this.date.getHours() + 12);
      }
    } else if (event.keyCode === 38 || event.keyCode === 40) {
      if (current === Prime.Widgets.DatePicker.ampm[0]) {
        this.ampm.setValue(Prime.Widgets.DatePicker.ampm[1]);
        this.date.setHours(this.date.getHours() + 12);
      } else if (current === Prime.Widgets.DatePicker.ampm[1]) {
        this.ampm.setValue(Prime.Widgets.DatePicker.ampm[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    }

    this.setDate(this.date);
    return false;
  },

  /**
   * Handle the click on a day.
   * @parameter {Event} event The click event.
   * @private
   */
  _handleDayClick: function(event) {
    var dayElement = new Prime.Document.Element(event.target);
    if (!dayElement.is('a')) {
      dayElement = dayElement.queryFirst('a');
    }

    var day = parseInt(dayElement.getDataAttribute('day'));
    var month = parseInt(dayElement.getDataAttribute('month'));
    var year = parseInt(dayElement.getDataAttribute('year'));

    // temporarily set the day to 1 so it does not shift when changing year or month
    this.date.setDate(1);

    // setting year, month and then day is important.
    this.date.setYear(year);
    this.date.setMonth(month);
    this.date.setDate(day);

    this.setDate(this.date);
    this.hide();
    return false;
  },

  _handleInputClick: function() {
    if (!this.datepicker.isVisible()) {
      this.datepicker.setLeft(this.element.getLeft());
      this.datepicker.setTop(this.element.getTop() + this.element.getHeight() + 8);
      this.show();
    }
    return false;
  },

  _handleMonthExpand: function() {
    this.months = this.datepicker.queryFirst('.months');

    if (this.months === null) {
      var html = '<div class="months">';
      for (var i = 0; i < Prime.Widgets.DatePicker.months.length; i++) {
        html += '<div data-month="' + i + '">' + Prime.Widgets.DatePicker.months[i] + '</div>';
      }
      html += '</div>';
      this.datepicker.appendHTML(html);
      this.months = this.datepicker.queryFirst('.months');
      this.months.getChildren().each(function(month) {
        month.addEventListener('click', function() {
          new Prime.Effects.Fade(this.months).withDuration(100).go();
          this.setMonth(parseInt(month.getDataAttribute('month')));
        }, this);
      }, this);
    }

    new Prime.Effects.Appear(this.months).withDuration(100).go();
    this.months.setLeft(this.month.getLeft() - 10);
    this.months.setTop(this.datepicker.getOffsetTop() - this.datepicker.getTop() - (this.months.getHeight() / 2));
  },

  _handleYearExpand: function() {
    this.years = this.datepicker.queryFirst('.years');

    if (this.years === null) {
      var html = '<div class="years">';
      var startYear = this.date.getFullYear() - 10;
      var endYear = this.date.getFullYear() + 10;
      for (var i = startYear; i < endYear; i++) {
        html += '<div data-year="' + i + '">' + i + '</div>';
      }
      html += '</div>';
      this.datepicker.appendHTML(html);
      this.years = this.datepicker.queryFirst('.years');
      this.years.getChildren().each(function(year) {
        year.addEventListener('click', function() {
          new Prime.Effects.Fade(this.years).withDuration(100).go();
          this.setYear(parseInt(year.getDataAttribute('year')));
        }, this);
      }, this);
    }

    new Prime.Effects.Appear(this.years).withDuration(100).go();
    this.years.setLeft(this.year.getLeft() - 10);
    this.years.setTop(this.datepicker.getOffsetTop() - this.datepicker.getTop() - (this.years.getHeight() / 2));
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

  /**
   * Refresh the UI
   * @private
   */
  _refreshCalendar: function() {
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
   * Refresh the UI
   * @private
   */
  _refreshMonthYear: function() {

    var month = this.date.getMonth();
    var year = this.date.getFullYear();

    // update data- attributes
    this.month.setDataAttribute('month', month);
    this.year.setDataAttribute('year', year);

    // update text
    this.month.setTextContent(Prime.Widgets.DatePicker.months[month]);
    this.year.setTextContent(year);
  },

  /**
   * Refresh the UI
   * @private
   */
  _refreshTime: function() {
    // Set Time -- assuming 12 hour time
    var hours = this.date.getHours();
    if (hours == 0) {
      hours = 12;
      this.ampm.setValue(Prime.Widgets.DatePicker.ampm[0]);
    } else if (hours > 12) {
      hours -= 12;
      this.ampm.setValue(Prime.Widgets.DatePicker.ampm[1]);
    } else {
      this.ampm.setValue(Prime.Widgets.DatePicker.ampm[0]);
    }
    this.hours.setValue(hours);
    this.minutes.setValue(("00" + this.date.getMinutes()).slice(-2));
  }
};