/*
 * Copyright (c) 2015-2016, Inversoft Inc., All Rights Reserved
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
 * Constructs a new DateTimePicker object for the given input element.
 *
 * @param {Prime.Document.Element} element The Prime Element for the DateTimePicker widget.
 * @constructor
 */
Prime.Widgets.DateTimePicker = function(element) {
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);
  if (!this.element.is('input')) {
    throw new TypeError('You can only use Prime.Widgets.DateTimePicker with an input element');
  }

  var value = this.element.getValue();
  if (value === '' || value === null) {
    this.date = new Date();
  } else {
    this.date = new Date(value);
  }

  this._setInitialOptions();
  var year = this.date.getUTCFullYear();
  var timeSeparator = '<span>' + Prime.Widgets.DateTimePicker.TIME_SEPARATOR + '</span>';
  var dateSeparator = '<span>' + Prime.Widgets.DateTimePicker.DATE_SEPARATOR + '</span>';
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
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[0] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[1] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[2] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[3] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[4] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[5] + '</th>' +
      '        <th>' + Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES[6] + '</th>' +
      '      </tr>' +
      '    </thead>' +
      '    <tbody>' +
      '    </tbody>' +
      '  </table>' +
      '  <div class="inputs">' +
      '    <div class="date">' +
      '      <input size="2" maxlength="2" type="text" name="month" autocomplete="off"/>' + dateSeparator +
      '      <input size="2" maxlength="2" type="text" name="day" autocomplete="off"/>' + dateSeparator +
      '      <input size="4" maxlength="4" type="text" name="year" autocomplete="off"/>' +
      '    </div>' +
      '    <div class="time">' +
      '      <input size="2" maxlength="2" type="text" name="hour" autocomplete="off"/>' + timeSeparator +
      '      <input size="2" maxlength="2" type="text" name="minute" autocomplete="off"/>' + timeSeparator +
      '      <input size="2" maxlength="2" type="text" name="second" autocomplete="off"/>' +
      '      <input size="2" maxlength="2" type="text" name="am_pm" autocomplete="off"/>' +
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

  this.time = this.datepicker.queryFirst('.time');
  this.inputs = this.datepicker.queryFirst('div.inputs');
  this.hourInput = this.inputs.queryFirst('input[name=hour]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleHourKey, this);
  this.minuteInput = this.inputs.queryFirst('input[name=minute]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleMinuteKey, this);
  this.secondInput = this.inputs.queryFirst('input[name=second]').addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleSecondKey, this);
  this.ampmInput = this.inputs.queryFirst('input[name=am_pm]').addEventListener('keydown', this._handleAmPmKey, this);
  this.monthInput = this.inputs.queryFirst('input[name=month]').setValue(this.date.getMonth() + 1).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleMonthKey, this);
  this.dayInput = this.inputs.queryFirst('input[name=day]').setValue(this.date.getDate()).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleDayKey, this);
  this.yearInput = this.inputs.queryFirst('input[name=year]').setValue(this.date.getFullYear()).addEventListener('change', this._handleDateTimeChange, this).addEventListener('keydown', this._handleYearKey, this);

  this.datepicker.queryFirst('.header .next').addEventListener('click', this._handleNextMonth, this);
  this.datepicker.queryFirst('.header .prev').addEventListener('click', this._handlePreviousMonth, this);

  this.callback = null;
  this.callbackContext = null;

  Prime.Document.addEventListener('click', this._handleGlobalClick, this);
  Prime.Document.addEventListener('keydown', this._handleGlobalKey, this);

  this.element.addClass('prime-initialized');
};

Prime.Widgets.DateTimePicker.SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
Prime.Widgets.DateTimePicker.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Prime.Widgets.DateTimePicker.DATE_SEPARATOR = '/';
Prime.Widgets.DateTimePicker.TIME_SEPARATOR = ':';
Prime.Widgets.DateTimePicker.AM_PM = ['AM', 'PM'];

Prime.Widgets.DateTimePicker.prototype = {
  /**
   * Destroys the DateTimePicker Widget
   */
  destroy: function() {
    this.datepicker.removeFromDOM();
    this.element.removeEventListener('click', this._handleInputClick);
    this.element.removeEventListener('focus', this._handleInputClick);
    this.element.removeEventListener('keydown', this._handleInputKey);
    Prime.Document.removeEventListener('click', this._handleGlobalClick);
    Prime.Document.removeEventListener('keydown', this._handleGlobalKey);
    this.element.removeClass('prime-initialized');
  },

  /**
   * Draws the calendar using the month and year from the given Date object.
   *
   * @param date {Date} The date to draw the calendar for.
   * @return {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  drawCalendar: function(date) {
    var month = date.getMonth();
    var year = date.getFullYear();
    var firstDay = new Date(year, month, 1);
    var firstDayOfMonth = firstDay.getDay();
    var daysInMonth = Prime.Date.numberOfDaysInMonth(year, month);
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
    this.monthDisplay.setTextContent(Prime.Widgets.DateTimePicker.MONTHS[month]);
    this.yearDisplay.setTextContent(year);

    return this;
  },

  /**
   * Hide the Date Picker widget.
   *
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  hide: function() {
    new Prime.Effects.Fade(this.datepicker).withDuration(100).go();
    return this;
  },

  /**
   * Moves the DateTimePicker to the next month and redraws the calendar.
   *
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  nextMonth: function() {
    var newDate = new Date(this.date);
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    newDate.setFullYear(parseInt(this.yearDisplay.getDataAttribute('year')));
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
      for (var i = 0; i < Prime.Widgets.DateTimePicker.MONTHS.length; i++) {
        html += '<div data-month="' + i + '">' + Prime.Widgets.DateTimePicker.MONTHS[i] + '</div>';
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
    this.months.setTop(this.monthDisplay.getAbsoluteTop());
    var currentMonth = this.months.queryFirst('[data-month="' + this.date.getMonth() + '"]');
    this.months.getChildren().each(function(month) {
      month.removeClass('prime-selected');
    }, this);
    currentMonth.addClass('prime-selected');
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
    this.years.setTop(this.yearDisplay.getAbsoluteTop());
    var currentYear = this.years.queryFirst('[data-year="' + this.date.getFullYear() + '"]');
    this.years.getChildren().each(function(year) {
      year.removeClass('prime-selected');
    }, this);
    currentYear.addClass('prime-selected');
  },

  /**
   * Moves the DateTimePicker to the previous month and redraws the calendar.
   *
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  previousMonth: function() {
    var newDate = new Date(this.date);
    newDate.setDate(1); // Set to 1 until month has been set
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    newDate.setFullYear(parseInt(this.yearDisplay.getDataAttribute('year')));
    Prime.Date.plusMonths(newDate, -1);
    this.drawCalendar(newDate);
    return this;
  },

  /**
   * Rebuilds the entire widget using the date value. Even if the user has moved to a different month
   * display, this will rebuild the table completely.
   *
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  render: function() {
    this.drawCalendar(this.date);
    this._refreshInputs();

    if (this.options.dateOnly) {
      this.time.hide();
    }
    return this;
  },

  /**
   * Sets the date of the DateTimePicker and redraws the calendar to the month for the date.
   *
   * @param {Date} newDate The new date.
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  setDate: function(newDate) {
    this.date = newDate;
    if (this.options.dateOnly) {
      this.element.setValue(Prime.Date.toDateOnlyISOString(newDate));
    } else {
      this.element.setValue(newDate.toISOString());
    }
    this.render();

    if (this.callback !== null) {
      this.callback.call(this.callbackContext, [this]);
    }

    return this;
  },

  /**
   * @param {number} month The month. A 0 based number between 0 (January) and 11 (December).
   * @returns {Prime.Widgets.DateTimePicker}
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
   * @returns {Prime.Widgets.DateTimePicker}
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
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  show: function() {
    this.datepicker.setLeft(this.element.getLeft());
    this.datepicker.setTop(this.element.getAbsoluteTop() + this.element.getHeight() + 8);
    new Prime.Effects.Appear(this.datepicker).withDuration(200).go();
    return this;
  },

  /**
   * Sets the callback handler that is called with the DateTimePicker's value is changed.
   *
   * @param callback {Function} The callback function.
   * @param context {*} The context for the callback.
   * @return {Prime.Widgets.DateTimePicker} This.
   */
  withCallback: function(callback, context) {
    this.callback = callback;
    this.callbackContext = context;
    return this;
  },

  /**
   * Render the DateTimePicker w/out the time picker. Only the calendar will be displayed and the input field will be updated with date only.
   *
   *
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  withDateOnly: function() {
    this.options['dateOnly'] = true;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
   */
  withOptions: function(options) {
    if (typeof options === 'undefined' || options === null) {
      return this;
    }

    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
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
   * @param {KeyboardEvent} event The keyboard event.
   * @returns {boolean} Always false so that the keyboard event is not propagated.
   * @private
   */
  _handleAmPmKey: function(event) {
    if (event.keyCode === Prime.Events.Keys.TAB) {
      if (event.shiftKey) {
        this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
        this.secondInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
        this.monthInput.focus();
      }
      return false;
    }

    // Decode the key event
    var current = this.ampmInput.getValue();
    if (event.keyCode === 65) {
      // User hit A
      if (current === Prime.Widgets.DateTimePicker.AM_PM[1]) {
        this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    } else if (event.keyCode === 80) {
      // User hit P
      if (current === Prime.Widgets.DateTimePicker.AM_PM[0]) {
        this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[1]);
        this.date.setHours(this.date.getHours() + 12);
      }
    } else if (event.keyCode === Prime.Events.Keys.UP_ARROW || event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      // User hit up or down arrow
      if (current === Prime.Widgets.DateTimePicker.AM_PM[0]) {
        this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[1]);
        this.date.setHours(this.date.getHours() + 12);
      } else if (current === Prime.Widgets.DateTimePicker.AM_PM[1]) {
        this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[0]);
        this.date.setHours(this.date.getHours() - 12);
      }
    } else if (event.keyCode === Prime.Events.Keys.ENTER || event.keyCode === Prime.Events.Keys.ESCAPE) {
      return true;
    }

    this.setDate(this.date);
    this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
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
    if (this.ampmInput.getValue() === Prime.Widgets.DateTimePicker.AM_PM[0]) {
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
    newDate.setDate(1); // Set to 1 until month has been set
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

    var newDate = new Date(this.date);
    newDate.setDate(1); // Set to 1 until month has been set
    newDate.setFullYear(parseInt(dayElement.getDataAttribute('year')));
    newDate.setMonth(parseInt(dayElement.getDataAttribute('month')));
    newDate.setDate(parseInt(dayElement.getDataAttribute('day')));
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
      this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusDays(this.date, -1);
      this.setDate(this.date);
      this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setDate(parseInt(this.dayInput.getValue()));
    }

    return true;
  },

  /**
   * Handles a global click event. This determines if the click was outside of the DateTimePicker and closes it.
   *
   * @param {MouseEvent} event The click event.
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
   * Handles a global key event. This determines if the DateTimePicker is open and if enter or escape was hit.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} Always true.
   * @private
   */
  _handleGlobalKey: function(event) {
    // Skip this function completely if the DateTimePicker isn't open
    if (!this.datepicker.isVisible()) {
      return true;
    }

    if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.setDate(this.date);
      this.hide();
      this.element.focus();
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ESCAPE) {
      this.hide();
      this.element.focus();
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
      this.hourInput.domElement.setSelectionRange(0, this.hourInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusHours(this.date, -1);
      this.setDate(this.date);
      this.hourInput.domElement.setSelectionRange(0, this.hourInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setHours(parseInt(this.hourInput.getValue()));
    }
    return true;
  },

  /**
   * Handle the click event for the input date field. If the DateTimePicker is hidden this will call the {@link #show()}
   * function.
   *
   * @returns {boolean} Always true.
   * @private
   */
  _handleInputClick: function() {
    if (!this.datepicker.isVisible()) {
      this.show();
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
      this.monthInput.focus();
    }
    return true;
  },

  /**
   * Handle the key event for the input date field. If the user hits tab or shift-tab, this moves the focus to the
   * nested inputs.
   *
   * @param {KeyboardEvent} event The keyboard event.
   * @returns {boolean} False if this handled the key, otherwise true.
   * @private
   */
  _handleInputKey: function(event) {
    if (this.datepicker.isVisible() && event.keyCode === Prime.Events.Keys.TAB) {
      if (event.shiftKey) {
        this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
        this.ampmInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
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
      this.minuteInput.domElement.setSelectionRange(0, this.minuteInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusMinutes(this.date, -1);
      this.setDate(this.date);
      this.minuteInput.domElement.setSelectionRange(0, this.minuteInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setMinutes(parseInt(this.minuteInput.getValue()));
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
      if (this.options.dateOnly) {
        this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
        this.yearInput.focus();
      } else {
        this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
        this.ampmInput.focus();
      }
      return false;
    }

    if (event.keyCode === Prime.Events.Keys.UP_ARROW) {
      Prime.Date.plusMonths(this.date, 1);
      this.setDate(this.date);
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusMonths(this.date, -1);
      this.setDate(this.date);
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setMonth(parseInt(this.monthInput.getValue()) - 1);
    }
    return true;
  },

  /**
   * Handle the next month button click.
   *
   * @returns {boolean} Always False.
   * @private
   */
  _handleNextMonth: function() {
    this.nextMonth();
    return false;
  },

  /**
   * Handle the previous month button click.
   *
   * @returns {boolean} Always False.
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
      this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusSeconds(this.date, -1);
      this.setDate(this.date);
      this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setSeconds(parseInt(this.secondInput.getValue()));
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
      this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.DOWN_ARROW) {
      Prime.Date.plusYears(this.date, -1);
      this.setDate(this.date);
      this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
      return false;
    } else if (event.keyCode === Prime.Events.Keys.TAB && this.options.dateOnly) {
      if (event.shiftKey) {
        this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
        this.dayInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
        this.monthInput.focus();
      }
      return false;
    } else if (event.keyCode === Prime.Events.Keys.ENTER) {
      this.date.setFullYear(parseInt(this.yearInput.getValue()));
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
      this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[0]);
    } else if (hours > 12) {
      hours = hours - 12;
      this.hourInput.setValue(hours);
      this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[1]);
    } else {
      this.hourInput.setValue(hours);
      this.ampmInput.setValue(Prime.Widgets.DateTimePicker.AM_PM[0]);
    }

    var minutes = this.date.getMinutes();
    this.minuteInput.setValue(("00" + minutes).slice(-2));

    var seconds = this.date.getSeconds();
    this.secondInput.setValue(("00" + seconds).slice(-2));

    this.monthInput.setValue(this.date.getMonth() + 1);
    this.dayInput.setValue(this.date.getDate());
    this.yearInput.setValue(this.date.getFullYear());
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'dateOnly': false
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};