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
 *  TODO - We could optionally use select boxes for month and year expansion selections?
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
  var timeSeparator = '<span>' + Prime.Widgets.DatePicker.TIME_SEPARATOR + '</span>';
  var dateSeparator = '<span>' + Prime.Widgets.DatePicker.DATE_SEPARATOR + '</span>';
  var html =
      '<div class="prime-date-picker">' +
      '  <div class="header">' +
      '    <span class="prev">&#9664;</span>' +
      '    <span class="month"></span>' +
      '    <span class="year"></span>' +
      '    <span class="next">&#9654;</span>' +
      '  </div>' +
      '  <table class="month">' +
      '    <thead>' +
      '      <tr>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[0] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[1] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[2] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[3] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[4] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[5] + '</th>' +
      '        <th>' + Prime.Widgets.DatePicker.SHORT_DAY_NAMES[6] + '</th>' +
      '      </tr>' +
      '    </thead>' +
      '    <tbody>' +
      '    </tbody>' +
      '  </table>' +
      '  <div class="inputs">' +
      '    <div class="date">' +
      '      <input size="2" maxlength="2" type="text" name="month">' + dateSeparator +
      '      <input size="2" maxlength="2" type="text" name="day">' + dateSeparator +
      '      <input size="4" maxlength="4" type="text" name="year">' +
      '    </div>' +
      '    <div class="time">' +
      '      <input size="2" maxlength="2" type="text" name="hour">' + timeSeparator +
      '      <input size="2" maxlength="2" type="text" name="minute">' + timeSeparator +
      '      <input size="2" maxlength="2" type="text" name="second">' +
      '      <input size="2" maxlength="2" type="text" name="am_pm">' +
      '    </div>' +
      '  </div>' +
      '</div>';
  Prime.Document.appendHTML(html);
  this.datepicker = Prime.Document.queryLast('.prime-date-picker').hide();
  this.element.addEventListener('click', this._handleInputClick, this);
  this.element.addEventListener('focus', this._handleInputClick, this);
  this.element.addEventListener('keydown', this._handleInputKey, this);

  this.calendarBody = this.datepicker.queryFirst('table tbody').addEventListener('click', this._handleDayClick, this);
  this.monthDisplay = this.datepicker.queryFirst('.header .month').addEventListener('click', this._handleMonthExpand, this);
  this.yearDisplay = this.datepicker.queryFirst('.header .year').addEventListener('click', this._handleYearExpand, this);

  var inputs = this.datepicker.queryFirst('div.inputs');
  this.hourInput = inputs.queryFirst('input[name=hour]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleHourKey, this);
  this.minuteInput = inputs.queryFirst('input[name=minute]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleMinuteKey, this);
  this.secondInput = inputs.queryFirst('input[name=second]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleSecondKey, this);
  this.ampmInput = inputs.queryFirst('input[name=am_pm]').addEventListener('keydown', this._handleAmPmKey, this);
  this.monthInput = inputs.queryFirst('input[name=month]').setValue(this.date.getMonth() + 1).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleMonthKey, this);
  this.dayInput = inputs.queryFirst('input[name=day]').setValue(this.date.getDate()).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleDayKey, this);
  this.yearInput = inputs.queryFirst('input[name=year]').setValue(this.date.getFullYear()).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleYearKey, this);

  this.datepicker.queryFirst('.header .next').addEventListener('click', this._handleNextMonth, this);
  this.datepicker.queryFirst('.header .prev').addEventListener('click', this._handlePreviousMonth, this);

  this.globalClickHandler = Prime.Document.addEventListener('click', this._handleGlobalClick, this);
  this.globalKeyHandler = Prime.Document.addEventListener('keydown', this._handleGlobalKey, this);

  this.refresh();

  this.element.addClass('prime-initialized');
};

Prime.Widgets.DatePicker.SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
Prime.Widgets.DatePicker.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Prime.Widgets.DatePicker.DATE_SEPARATOR = '/';
Prime.Widgets.DatePicker.TIME_SEPARATOR = ':';
Prime.Widgets.DatePicker.AM_PM = ['AM', 'PM'];

Prime.Widgets.DatePicker.prototype = {
  /**
   * Destroys the DatePicker Widget
   */
  destroy: function() {
    this.datepicker.removeFromDOM();
    this.element.removeEventListener('click', this._handleInputClick);
    this.element.removeEventListener('focus', this._handleInputClick);
    new Prime.Document.Element(document.body).removeListener('click', this.hide, this);
    Prime.Document.removeEventListener('click', this.globalClickHandler);
    Prime.Document.removeEventListener('keydown', this.globalKeyHandler);
    this.element.removeClass('prime-initialized');
  },

  /**
   * Draws the calendar using the month and year from the given Date object.
   *
   * @param date {Date} The date to draw the calendar for.
   * @return {Prime.Widgets.DatePicker} This DatePicker.
   */
  drawCalendar: function(date) {
    var month = date.getMonth();
    var year = date.getFullYear();
    var firstDay = new Date(year, month, 1);
    var firstDayOfMonth = firstDay.getDay();
    var daysInMonth = Prime.Date.numberOfDaysInMonth(month);
    var used = firstDayOfMonth + daysInMonth;
    var weeksInMonth = Math.ceil(used / 7);

    var rows = '';
    var startDay = 1;
    for (var i = 0; i < weeksInMonth; i++) {
      var startDayOfWeek = i === 0 ? firstDayOfMonth : 0;
      rows += this._buildCalendarWeek(date, startDayOfWeek, startDay, daysInMonth);
      startDay += 7 - startDayOfWeek; // increment by 7 adjusted by a week day of week offset
    }

    this.calendarBody.setHTML(rows);

    // update data- attributes
    this.monthDisplay.setDataAttribute('month', month);
    this.yearDisplay.setDataAttribute('year', year);

    // update text
    this.monthDisplay.setTextContent(Prime.Widgets.DatePicker.MONTHS[month]);
    this.yearDisplay.setTextContent(year);

    return this;
  },

  /**
   * Hide the Date Picker widget.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  hide: function() {
    new Prime.Effects.Fade(this.datepicker).withDuration(100).go();
    return this;
  },

  /**
   * Moves the DatePicker to the next month and redraws the calendar.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  nextMonth: function() {
    var newDate = new Date(this.date);
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    Prime.Date.plusMonths(newDate, 1);
    this.drawCalendar(newDate);
    return this;
  },

  /**
   * Opens the month select box.
   */
  openMonthSelect: function() {
    this.months = this.datepicker.queryFirst('.months');
    if (typeof this.years !== 'undefined') {
      this.years.hide();
    }
    if (this.months === null) {
      var html = '<div class="months">';
      for (var i = 0; i < Prime.Widgets.DatePicker.MONTHS.length; i++) {
        html += '<div data-month="' + i + '">' + Prime.Widgets.DatePicker.MONTHS[i] + '</div>';
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
    this.months.setLeft(this.monthDisplay.getLeft() - 10);
    this.months.setTop(this.monthDisplay.getOffsetTop());
    var currentMonth = this.months.queryFirst('[data-month="' + this.date.getMonth() + '"]');
    this.months.getChildren().each(function(month) {
      month.removeClass('prime-selected');
    }, this);
    currentMonth.addClass('prime-selected');
    currentMonth.domElement.scrollIntoView();
  },

  /**
   * Opens the year select box.
   */
  openYearSelect: function() {
    this.years = this.datepicker.queryFirst('.years');
    if (typeof this.months !== 'undefined') {
      this.months.hide();
    }

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
    this.years.setLeft(this.yearDisplay.getLeft() - 10);
    this.years.setTop(this.yearDisplay.getOffsetTop());
    var currentYear = this.years.queryFirst('[data-year="' + this.date.getFullYear() + '"]');
    this.years.getChildren().each(function(year) {
      year.removeClass('prime-selected');
    }, this);
    currentYear.addClass('prime-selected');
    currentYear.domElement.scrollIntoView();
  },

  /**
   * Moves the DatePicker to the previous month and redraws the calendar.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  previousMonth: function() {
    var newDate = new Date(this.date);
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    Prime.Date.plusMonths(newDate, -1);
    this.drawCalendar(newDate);
    return this;
  },

  /**
   * Rebuilds the calendar using the date value of the DatePicker. Even if the user has moved to a different month
   * display, this will rebuild the table completely.
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  refresh: function() {
    this.drawCalendar(this.date);
    this._refreshInputs();
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
    this.element.setValue(newDate.toISOString());
    this.refresh();
    return this;
  },

  /**
   * @param {number} month The month. A 0 based number between 0 (January) and 11 (December).
   * @returns {Prime.Widgets.DatePicker}
   */
  setMonth: function(month) {
    var currentYear = parseInt(this.yearDisplay.getDataAttribute('year'));
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
    this.yearDisplay.setDataAttribute('year', year);
    this.yearDisplay.setTextContent(year);
    this.date.setYear(year);
    this.setDate(this.date);
    return this;
  },

  /**
   * Show the Date Picker widget
   *
   * @returns {Prime.Widgets.DatePicker} This DatePicker.
   */
  show: function() {
    this.datepicker.setLeft(this.element.getLeft());
    this.datepicker.setTop(this.element.getAbsoluteTop() + this.element.getHeight() + 8);
    new Prime.Effects.Appear(this.datepicker).withDuration(200).go();
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Build the HTML for a single calendar week.
   *
   * @param date {Date} The date to build the calendar week based on.
   * @param startDayOfWeek {Number} The day of the week of this week begins. A 0 based number between 0 and 6.
   * @param startDayOfMonth {Number} The day of the month this week begins. A number between 1 and 31.
   * @param daysInMonth {Number} The number of days in this calendar month.
   * @returns {string} The HTML for this week.
   * @private
   */
  _buildCalendarWeek: function(date, startDayOfWeek, startDayOfMonth, daysInMonth) {
    var daysInPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    var startDayOfPreviousMonth = daysInPreviousMonth - startDayOfWeek + 1;
    var startDayOfNextMonth = 1;

    var row = '<tr>';
    var emptyColumns = 0;
    var year = date.getFullYear();
    var month = date.getMonth();

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
        var selected = this.date.getDate() === day && this.date.getMonth() === month;
        row += '<td><a ' + (selected ? 'class="prime-selected"' : '') + 'href="#" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '">' + day + '</a></td>';
      }
    }

    row += '</tr>';
    return row;
  },

  /**
   * Handles when the AM/PM element is selected and the user hits a key. If the user hits A, this changes to AM. If the
   * user hits P, this changes to PM. If the use hits the up or down arrows, this toggles between AM and PM.
   *
   * @param event {KeyboardEvent} The keyboard event.
   * @returns {boolean} Always false so that the keyboard event is not propagated.
   * @private
   */
  _handleAmPmKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.TAB) {
      if (event.shiftKey) {
        this.secondInput.focus();
      } else {
        this.monthInput.focus();
      }
      return false;
    }

    // Decode the key event
    var current = this.ampmInput.getValue();
    if (event.keyCode === 65) {
      // User hit A
      if (current === Prime.Widgets.DatePicker.AM_PM[1]) {
        this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    } else if (event.keyCode === 80) {
      // User hit P
      if (current === Prime.Widgets.DatePicker.AM_PM[0]) {
        this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[1]);
        this.date.setHours(this.date.getHours() + 12);
      }
    } else if (event.keyCode === Prime.Events.Keys.UP_ARROW || event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      // User hit up or down arrow
      if (current === Prime.Widgets.DatePicker.AM_PM[0]) {
        this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[1]);
        this.date.setHours(this.date.getHours() + 12);
      } else if (current === Prime.Widgets.DatePicker.AM_PM[1]) {
        this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    } else if (event.keyCode === Prime.Events.Keys.ENTER || event.keyCode === Prime.Events.Keys.ESCAPE) {
      return true;
    }

    this.setDate(this.date);
    return false;
  },

  /**
   * Handle date/time change events. This pulls the values from the 3 date fields and makes a new Date. Then it calls
   * {@link #setDate(Date)}.
   *
   * @private
   */
  _handleDateTimeChange: function() {
    var newDate = new Date();
    var hours = parseInt(this.hourInput.getValue());
    if (hours < 1 || hours > 12) {
      hours = 1;
      this.hourInput.setValue(hours);
    }
    if (this.ampmInput.getValue() === Prime.Widgets.DatePicker.AM_PM[0]) {
      if (hours === 12) {
        newDate.setHours(0);
      } else {
        newDate.setHours(hours);
      }
    } else {
      if (hours === 12) {
        newDate.setHours(12);
      } else {
        newDate.setHours(hours + 12);
      }
    }

    var minutes = parseInt(this.minuteInput.getValue());
    if (minutes < 1 || minutes > 59) {
      minutes = 1;
      this.minuteInput.setValue(minutes);
    }
    newDate.setMinutes(minutes);
    newDate.setMonth(parseInt(this.monthInput.getValue()) - 1);
    newDate.setDate(parseInt(this.dayInput.getValue()));
    newDate.setYear(parseInt(this.yearInput.getValue()));

    this.setDate(newDate);
    return false;
  },

  /**
   * Handle the click on a day.
   *
   * @parameter {MouseEvent} event The click event.
   * @return {boolean} Always false.
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

    var newDate = new Date(year, month, day);
    this.setDate(newDate);
    return false;
  },

  /**
   * Handles when a key is click in the day input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the day.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False if the keys are shift+tab, true otherwise.
   * @private
   */
  _handleDayKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusDays(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusDays(this.date, -1);
      this.setDate(this.date);
      return false;
    }

    return true;
  },

  /**
   * Handles a global click event. This determines if the click was outside of the DatePicker and closes it.
   *
   * @param event {MouseEvent} The click event.
   * @returns {boolean} Always true.
   * @private
   */
  _handleGlobalClick: function(event) {
    // Skip this function completely if they clicked the input field
    if (event.target === this.element.domElement) {
      return true;
    }

    var top = this.datepicker.getTop();
    var bottom = this.datepicker.getBottom();
    var left = this.datepicker.getLeft();
    var right = this.datepicker.getRight();
    if (this.datepicker.isVisible() && (event.x < left || event.x > right || event.y < top || event.y > bottom)) {
      if (typeof this.years !== 'undefined') {
        this.years.hide();
      }
      if (typeof this.months !== 'undefined') {
        this.months.hide();
      }
      this.hide();
    }
    return true;
  },

  /**
   * Handles a global key event. This determines if the DatePicker is open and if enter or escape was hit.
   *
   * @param event {KeyboardEvent} The key event.
   * @returns {boolean} Always true.
   * @private
   */
  _handleGlobalKey: function(event) {
    // Skip this function completely if the DatePicker isn't open
    if (!this.datepicker.isVisible()) {
      return true;
    }

    if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.setDate(this.date);
      this.hide();
    } else if (event.keyCode === Prime.Events.Keys.ESCAPE) {
      this.hide();
    }

    return true;
  },

  /**
   * Handles when a key is click in the hours input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the hour.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False if the keys are shift+tab, true otherwise.
   * @private
   */
  _handleHourKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusHours(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusHours(this.date, -1);
      this.setDate(this.date);
      return false;
    }
    return true;
  },

  /**
   * Handle the click event for the input date field. If the DatePicker is hidden this will call the {@link #show()}
   * function.
   *
   * @returns {boolean} Always true.
   * @private
   */
  _handleInputClick: function() {
    if (!this.datepicker.isVisible()) {
      this.show();
      this.monthInput.focus();
    }
    return true;
  },

  /**
   * Handle the key event for the input date field. If the user hits tab or shift-tab, this moves the focus to the
   * nested inputs.
   *
   * @param event {KeyboardEvent} The keyboard event.
   * @returns {boolean} False if this handled the key, otherwise true.
   * @private
   */
  _handleInputKey: function(event) {
    if (this.datepicker.isVisible && event.keyCode === Prime.Events.Keys.TAB) {
      if (event.shiftKey) {
        this.ampmInput.focus();
      } else {
        this.monthInput.focus();
      }
      return false;
    }

    return true;
  },

  /**
   * Handle the key down event and capture the up and down arrow key to increment and decrement the minute.

   * @param {KeyboardEvent} event The key event.
   * @returns {boolean}
   * @private
   */
  _handleMinuteKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusMinutes(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusMinutes(this.date, -1);
      this.setDate(this.date);
      return false;
    }
    return true;
  },

  /**
   * Handles the click on the month to open the month select.
   *
   * @private
   */
  _handleMonthExpand: function() {
    this.openMonthSelect();
  },

  /**
   * Handles when a key is click in the month input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the month.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False if the keys are shift+tab, true otherwise.
   * @private
   */
  _handleMonthKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.TAB && event.shiftKey) {
      this.ampmInput.focus();
      return false;
    }

    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusMonths(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusMonths(this.date, -1);
      this.setDate(this.date);
      return false;
    }
    return true;
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
   * Handle the key down event and capture the up and down arrow key to increment and decrement the second.

   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False if the key was the up or down arrow, otherwise true.
   * @private
   */
  _handleSecondKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusSeconds(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusSeconds(this.date, -1);
      this.setDate(this.date);
      return false;
    }
    return true;
  },

  /**
   * Handles the click on the year to open the year select.
   *
   * @private
   */
  _handleYearExpand: function() {
    this.openYearSelect();
  },

  /**
   * Handles when a key is click in the year input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the year.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False if the keys are shift+tab, true otherwise.
   * @private
   */
  _handleYearKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusYears(this.date, 1);
      this.setDate(this.date);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusYears(this.date, -1);
      this.setDate(this.date);
      return false;
    }
    return true;
  },

  /**
   * Refresh the time inputs.
   *
   * @private
   */
  _refreshInputs: function() {
    // Set Time -- assuming 12-hour time for the input fields and ISO 24-hour time for the field
    var hours = this.date.getHours();
    if (hours == 0) {
      this.hourInput.setValue("12");
      this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[0]);
    } else if (hours > 12) {
      hours = hours - 12;
      this.hourInput.setValue(hours);
      this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[1]);
    } else {
      this.hourInput.setValue(hours);
      this.ampmInput.setValue(Prime.Widgets.DatePicker.AM_PM[0]);
    }

    var minutes = this.date.getMinutes();
    this.minuteInput.setValue(("00" + minutes).slice(-2));

    var seconds = this.date.getSeconds();
    this.secondInput.setValue(("00" + seconds).slice(-2));

    this.monthInput.setValue(this.date.getMonth() + 1);
    this.dayInput.setValue(this.date.getDate());
    this.yearInput.setValue(this.date.getFullYear());
  }
};