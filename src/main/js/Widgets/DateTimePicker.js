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

import {Events} from "../Events.js";
import {PrimeDate} from "../Date.js";
import {PrimeDocument} from "../PrimeDocument.js";
import {PrimeElement} from "../Document/PrimeElement.js";
import {Utils} from "../Utils.js";

const SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATE_SEPARATOR = '/';
const TIME_SEPARATOR = ':';
const AM_PM = ['AM', 'PM'];

class DateTimePicker {
  /**
   * Constructs a new DateTimePicker object for the given input element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the DateTimePicker widget.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    if (!this.element.is('input')) {
      throw new TypeError('You can only use DateTimePicker with an input element');
    }

    this.callback = null;
    this.customFormatHandler = null;
    this._setInitialOptions();
  };

  static get SHORT_DAY_NAMES() {
    return SHORT_DAY_NAMES;
  }

  static get MONTHS() {
    return MONTHS;
  }

  static get DATE_SEPARATOR() {
    return DATE_SEPARATOR;
  }

  static get TIME_SEPARATOR() {
    return TIME_SEPARATOR;
  }

  static get AM_PM() {
    return AM_PM;
  }

  /**
   * Closes the Date Picker widget.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  close() {
    this.datepicker.removeClass('open');

    // Pause a bit to cancel focus event and allow transition to play
    setTimeout(function() {
      this.datepicker.hide();
    }.bind(this), this.options.closeTimeout);
    return this;
  }

  /**
   * Closes the months select box.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  closeMonthsSelect() {
    this.months.removeClass('open');
    setTimeout(function() {
      this.months.hide();
    }.bind(this), this.options.closeTimeout);
    return this;
  }

  /**
   * Closes the years select box.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  closeYearsSelect() {
    this.years.removeClass('open');
    setTimeout(function() {
      this.years.hide();
    }.bind(this), this.options.closeTimeout);
    return this;
  }

  /**
   * Destroys the DateTimePicker Widget
   */
  destroy() {
    this.datepicker.removeFromDOM();
    this.element.removeEventListener('click', this._handleInputClick)
        .removeEventListener('focus', this._handleInputClick)
        .removeEventListener('keydown', this._handleInputKey);
    PrimeDocument.removeEventListener('click', this._handleGlobalClick);
    PrimeDocument.removeEventListener('keydown', this._handleGlobalKey);
  }

  /**
   * Draws the calendar using the month and year from the given Date object.
   *
   * @param date {Date} The date to draw the calendar for.
   * @return {DateTimePicker} This DateTimePicker.
   */
  drawCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1);
    const firstDayOfMonth = firstDay.getDay();
    const daysInMonth = PrimeDate.numberOfDaysInMonth(year, month);
    const used = firstDayOfMonth + daysInMonth;
    const weeksInMonth = Math.ceil(used / 7);

    let rows = '';
    let startDay = 1;
    for (let i = 0; i < weeksInMonth; i++) {
      const startDayOfWeek = i === 0 ? firstDayOfMonth : 0;
      rows += this._buildCalendarWeek(date, startDayOfWeek, startDay, daysInMonth);
      startDay += 7 - startDayOfWeek; // increment by 7 adjusted by a week day of week offset
    }

    this.calendarBody.setHTML(rows);

    // update data- attributes
    this.monthDisplay.setDataAttribute('month', month);
    this.yearDisplay.setDataAttribute('year', year);

    // update text
    this.monthDisplay.setTextContent(DateTimePicker.MONTHS[month]);
    this.yearDisplay.setTextContent(year);

    return this;
  }

  /**
   * Rebuilds the entire widget using the date value. Even if the user has moved to a different month display, this will
   * rebuild the table completely.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  initialize() {
    const value = this.element.getValue();
    if (value === '' || value === null) {
      this.date = new Date();
    } else {
      this.date = new Date(value);
    }

    const year = this.date.getUTCFullYear();
    const timeSeparator = `<span>${DateTimePicker.TIME_SEPARATOR}</span>`;
    const dateSeparator = `<span>${DateTimePicker.DATE_SEPARATOR}</span>`;
    let html =
        `<div class="${this.options.className }">
  <header>
    <span class="prev">&#9664;</span>
    <span class="month"></span>
    <span class="year"></span>
    <span class="next">&#9654;</span>
  </header>
  <table>
    <thead>
      <tr>
        <th>${DateTimePicker.SHORT_DAY_NAMES[0]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[1]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[2]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[3]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[4]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[5]}</th>
        <th>${DateTimePicker.SHORT_DAY_NAMES[6]}</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
  <div class="inputs">
    <div class="date">
      <input size="2" maxlength="2" type="text" name="month" autocomplete="off"/>${dateSeparator}
      <input size="2" maxlength="2" type="text" name="day" autocomplete="off"/>${dateSeparator}
      <input size="4" maxlength="4" type="text" name="year" autocomplete="off"/>
    </div>
    <div class="time">
      <input size="2" maxlength="2" type="text" name="hour" autocomplete="off"/>${timeSeparator}
      <input size="2" maxlength="2" type="text" name="minute" autocomplete="off"/>${timeSeparator}
      <input size="2" maxlength="2" type="text" name="second" autocomplete="off"/>
      <input size="2" maxlength="2" type="text" name="am_pm" autocomplete="off"/>
    </div>
  </div>
</div>`;
    PrimeDocument.appendHTML(html);
    this.datepicker = PrimeDocument.queryLast('.' + this.options.className).hide();
    this.element.addEventListener('click', this._handleInputClick);
    this.element.addEventListener('focus', this._handleInputClick);
    this.element.addEventListener('keydown', this._handleInputKey);

    this.calendarBody = this.datepicker.queryFirst('table tbody').addEventListener('click', this._handleDayClick);
    this.monthDisplay = this.datepicker.queryFirst('header .month').addEventListener('click', this._handleMonthExpand);
    this.yearDisplay = this.datepicker.queryFirst('header .year').addEventListener('click', this._handleYearExpand);

    this.time = this.datepicker.queryFirst('.time');
    this.inputs = this.datepicker.queryFirst('div.inputs');
    this.hourInput = this.inputs.queryFirst('input[name=hour]').addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleHourKey);
    this.minuteInput = this.inputs.queryFirst('input[name=minute]').addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleMinuteKey);
    this.secondInput = this.inputs.queryFirst('input[name=second]').addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleSecondKey);
    this.ampmInput = this.inputs.queryFirst('input[name=am_pm]').addEventListener('keydown', this._handleAmPmKey);
    this.monthInput = this.inputs.queryFirst('input[name=month]').setValue(this.date.getMonth() + 1).addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleMonthKey);
    this.dayInput = this.inputs.queryFirst('input[name=day]').setValue(this.date.getDate()).addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleDayKey);
    this.yearInput = this.inputs.queryFirst('input[name=year]').setValue(this.date.getFullYear()).addEventListener('change', this._handleDateTimeChange).addEventListener('keydown', this._handleYearKey);

    this.datepicker.queryFirst('header .next').addEventListener('click', this._handleNextMonth);
    this.datepicker.queryFirst('header .prev').addEventListener('click', this._handlePreviousMonth);

    PrimeDocument.addEventListener('click', this._handleGlobalClick);
    PrimeDocument.addEventListener('keydown', this._handleGlobalKey);

    // Setup months dropdown
    html = '<div class="months">';
    for (let i = 0; i < DateTimePicker.MONTHS.length; i++) {
      html += `<div data-month="${i}">${DateTimePicker.MONTHS[i]}</div>`;
    }
    html += '</div>';
    this.datepicker.appendHTML(html);
    this.months = this.datepicker.queryFirst('.months');
    this.months.hide();
    this.months.getChildren().each(function(month) {
      month.addEventListener('click', function() {
        this.setMonth(parseInt(month.getDataAttribute('month')));
        this.closeMonthsSelect();
      }.bind(this));
    }.bind(this));

    // Setup year dropdown
    html = '<div class="years">';
    const startYear = this.date.getFullYear() - 100;
    const endYear = this.date.getFullYear();
    for (let i = startYear; i <= endYear; i++) {
      html += `<div data-year="${i}">${i}</div>`;
    }
    html += '</div>';
    this.datepicker.appendHTML(html);
    this.years = this.datepicker.queryFirst('.years');
    this.years.hide();
    this.years.getChildren().each(function(year) {
      year.addEventListener('click', function() {
        this.setYear(parseInt(year.getDataAttribute('year')));
        this.closeYearsSelect();
      }.bind(this));
    }.bind(this));

    this._rebuild();

    if (this.customFormatHandler !== null) {
      this.element.setValue(this.customFormatHandler.call(null, this.date));
    }

    return this;
  }

  /**
   * @returns {Date} Return the current value of the time picker.
   */
  getDate() {
    return new Date(this.date.getTime());
  }

  /**
   * Moves the DateTimePicker to the next month and redraws the calendar.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  nextMonth() {
    const newDate = new Date(this.date);
    newDate.setDate(1); // Set the day to 1 to keep us from wrapping months on the 30 and 31st.
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    newDate.setFullYear(parseInt(this.yearDisplay.getDataAttribute('year')));
    PrimeDate.plusMonths(newDate, 1);
    this.drawCalendar(newDate);
    return this;
  }

  /**
   * Opens the Date Picker widget.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  open() {
    this.datepicker.setLeft(this.element.getLeft());
    this.datepicker.setTop(this.element.getAbsoluteTop() + this.element.getHeight() + 8);
    this.datepicker.show();
    this.datepicker.addClass('open');

    const zIndex = this.element.getRelativeZIndex();
    this.datepicker.setStyle('zIndex', zIndex + 10);
    return this;
  }

  /**
   * Opens the month select box.
   */
  openMonthSelect() {
    this.closeYearsSelect();

    this.months.setLeft(this.monthDisplay.getOffsetLeft() - 5);
    this.months.setTop(this.monthDisplay.getOffsetTop() - 5);
    this.months.setStyle('zIndex', this.monthDisplay.getRelativeZIndex() + 10);
    this.months.show();
    this.months.addClass('open');

    const currentMonth = this.months.queryFirst('[data-month="' + this.date.getMonth() + '"]');
    this.months.getChildren().each(function(month) {
      month.removeClass('selected');
    });
    currentMonth.addClass('selected');
  }

  /**
   * Opens the year select box.
   */
  openYearSelect() {
    this.closeMonthsSelect();

    this.years.setLeft(this.yearDisplay.getOffsetLeft() - 5);
    this.years.setTop(this.yearDisplay.getOffsetTop() - 5);
    this.years.setStyle('zIndex', this.yearDisplay.getRelativeZIndex() + 10);
    this.years.show();
    this.years.addClass('open');

    const currentYear = this.years.queryFirst('[data-year="' + this.date.getFullYear() + '"]');
    this.years.getChildren().each(function(year) {
      year.removeClass('selected');
    });
    currentYear.addClass('selected');
  }

  /**
   * Moves the DateTimePicker to the previous month and redraws the calendar.
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  previousMonth() {
    const newDate = new Date(this.date);
    newDate.setDate(1); // Set to 1 until month has been set
    newDate.setMonth(parseInt(this.monthDisplay.getDataAttribute('month')));
    newDate.setFullYear(parseInt(this.yearDisplay.getDataAttribute('year')));
    PrimeDate.plusMonths(newDate, -1);
    this.drawCalendar(newDate);
    return this;
  }

  /**
   * Sets the date of the DateTimePicker and redraws the calendar to the month for the date.
   *
   * @param {Date} newDate The new date.
   * @returns {DateTimePicker} This DateTimePicker.
   */
  setDate(newDate) {
    this.date = newDate;

    if (this.customFormatHandler !== null) {
      this.element.setValue(this.customFormatHandler.call(null, this.date));
    } else {
      if (this.options.dateOnly) {
        this.element.setValue(PrimeDate.toDateOnlyISOString(newDate));
      } else {
        this.element.setValue(newDate.toISOString());
      }
    }

    this._rebuild();

    if (this.callback !== null) {
      this.callback(this);
    }

    return this;
  }

  /**
   * @param {number} month The month. A 0 based number between 0 (January) and 11 (December).
   * @returns {DateTimePicker}
   */
  setMonth(month) {
    let currentYear = parseInt(this.yearDisplay.getDataAttribute('year'));
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
  }

  /**
   *
   * @param {number} year The year.
   * @returns {DateTimePicker}
   */
  setYear(year) {
    this.yearDisplay.setDataAttribute('year', year);
    this.yearDisplay.setTextContent(year);
    this.date.setYear(year);
    this.setDate(this.date);
    return this;
  }

  /**
   * Sets the callback handler that is called with the DateTimePicker's value is changed.
   *
   * @param callback {Function} The callback function.
   * @return {DateTimePicker} This.
   */
  withCallback(callback) {
    this.callback = callback;
    return this;
  }

  /**
   * Sets the class name for the main div of the date time picker.
   *
   * @param className {string} The class name.
   * @returns {DateTimePicker} This.
   */
  withClassName(className) {
    this.options.className = className;
    return this;
  }

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {DateTimePicker}
   */
  withCloseTimeout(timeout) {
    this.options.closeTimeout = timeout;
    return this;
  }

  /**
   * Sets a custom format handler responsible for formatting the date string that will be set into the input field.
   * When not defined the default behavior will be used.
   *
   * @param formatHandler {Function} The handler function.
   * @return {DateTimePicker} This.
   */
  withCustomFormatHandler(formatHandler) {
    this.customFormatHandler = formatHandler;
    return this;
  }

  /**
   * Render the DateTimePicker w/out the time picker. Only the calendar will be displayed and the input field will be updated with date only.
   *
   *
   * @returns {DateTimePicker} This DateTimePicker.
   */
  withDateOnly() {
    this.options.dateOnly = true;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {DateTimePicker} This DateTimePicker.
   */
  withOptions(options) {
    if (!Utils.isDefined(options)) {
      return this;
    }

    for (let option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
    return this;
  }

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
  _buildCalendarWeek(date, startDayOfWeek, startDayOfMonth, daysInMonth) {
    const daysInPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    let startDayOfPreviousMonth = daysInPreviousMonth - startDayOfWeek + 1;
    let startDayOfNextMonth = 1;

    let row = '<tr>';
    let emptyColumns = 0;
    const year = date.getFullYear();
    const month = date.getMonth();

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = startDayOfMonth + i;
      // Days of the previous month
      if (dayOfWeek <= startDayOfWeek) {
        row += '<td><a class="inactive" href="#" data-year="' + year + '" data-month="' + (month - 1) + '" data-day="' + startDayOfPreviousMonth + '">' + startDayOfPreviousMonth + '</a></td>';
        startDayOfPreviousMonth++;
        emptyColumns++;
      } else if (dayOfWeek > daysInMonth) {
        // Days of the next month
        row += '<td><a class="inactive" href="#" data-year="' + year + '" data-month="' + month + '" data-day="' + dayOfWeek + '">' + startDayOfNextMonth + '</a></td>';
        startDayOfNextMonth++;
      } else {
        // Days in the current month
        const day = dayOfWeek - emptyColumns;
        const selected = this.date.getDate() === day && this.date.getMonth() === month;
        row += '<td><a ' + (selected ? 'class="selected"' : '') + 'href="#" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '">' + day + '</a></td>';
      }
    }

    row += '</tr>';
    return row;
  }

  // noinspection JSMethodCanBeStatic
  /**
   * Clamp the value between the minimum and maximum values.
   *
   * @param {Number} min the minimum number value.
   * @param {Number} max The maximum number value.
   * @param {Number} value The value to clamp.
   * @returns {Number} The resulting value, either the min, max or actual value if not out of bounds.
   * @private
   */
  _clamp(min, max, value) {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Handles when the AM/PM element is selected and the user hits a key. If the user hits A, this changes to AM. If the
   * user hits P, this changes to PM. If the use hits the up or down arrows, this toggles between AM and PM.
   *
   * @param {KeyboardEvent} event The keyboard event.
   * @private
   */
  _handleAmPmKey(event) {
    if (event.keyCode === Events.Keys.TAB) {
      Utils.stopEvent(event);
      if (event.shiftKey) {
        this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
        this.secondInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
        this.monthInput.focus();
      }
      return;
    }

    // Decode the key event
    const current = this.ampmInput.getValue();
    if (event.keyCode === 65) {
      // User hit A
      if (current === DateTimePicker.AM_PM[1]) {
        PrimeDate.plusHours(this.date, -12);
      }
    } else if (event.keyCode === 80) {
      // User hit P
      if (current === DateTimePicker.AM_PM[0]) {
        PrimeDate.plusHours(this.date, 12);
      }
    } else if (event.keyCode === Events.Keys.UP_ARROW || event.keyCode === Events.Keys.DOWN_ARROW) {
      // User hit up or down arrow
      if (current === DateTimePicker.AM_PM[0]) {
        PrimeDate.plusHours(this.date, 12);
      } else if (current === DateTimePicker.AM_PM[1]) {
        PrimeDate.plusHours(this.date, -12);
      }
    } else if (event.keyCode === Events.Keys.ENTER || event.keyCode === Events.Keys.ESCAPE) {
      return;
    }

    this.setDate(this.date);
    this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
    Utils.stopEvent(event);
  }

  /**
   * Handle date/time change events. This pulls the values from the 3 date fields and makes a new Date. Then it calls
   * {@link #setDate(Date)}.
   *
   * @param {KeyboardEvent} event The keyboard event.
   * @private
   */
  _handleDateTimeChange(event) {
    Utils.stopEvent(event);
    const newDate = new Date();
    const hours = this._clamp(1, 12, parseInt(this.hourInput.getValue()));
    if (this.ampmInput.getValue() === DateTimePicker.AM_PM[0]) {
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

    const seconds = this._clamp(0, 59, parseInt(this.secondInput.getValue()));
    const minutes = this._clamp(0, 59, parseInt(this.minuteInput.getValue()));

    newDate.setSeconds(seconds);
    newDate.setMinutes(minutes);
    newDate.setDate(1); // Set to 1 until month has been set
    newDate.setMonth(parseInt(this.monthInput.getValue()) - 1);
    newDate.setDate(parseInt(this.dayInput.getValue()));
    newDate.setYear(parseInt(this.yearInput.getValue()));

    this.setDate(newDate);
  }

  /**
   * Handle the click on a day.
   *
   * @parameter {MouseEvent} event The click event.
   * @private
   */
  _handleDayClick(event) {
    Utils.stopEvent(event);
    let dayElement = new PrimeElement(event.target);
    if (!dayElement.is('a')) {
      dayElement = dayElement.queryFirst('a');
    }

    const newDate = new Date(this.date);
    newDate.setDate(1); // Set to 1 until month has been set
    newDate.setFullYear(parseInt(dayElement.getDataAttribute('year')));
    newDate.setMonth(parseInt(dayElement.getDataAttribute('month')));
    newDate.setDate(parseInt(dayElement.getDataAttribute('day')));
    this.setDate(newDate);
  }

  /**
   * Handles when a key is click in the day input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the day.
   *
   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleDayKey(event) {
    if (event.keyCode === Events.Keys.UP_ARROW) {
      PrimeDate.plusDays(this.date, 1);
      this.setDate(this.date);
      this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
      Utils.stopEvent(event);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusDays(this.date, -1);
      this.setDate(this.date);
      this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setDate(parseInt(this.dayInput.getValue()));
    }
  }

  /**
   * Handles a global click event. This determines if the click was outside of the DateTimePicker and closes it.
   *
   * @param {MouseEvent} event The click event.
   * @private
   */
  _handleGlobalClick(event) {
    // Skip this function completely if they clicked the input field
    if (event.target === this.element.domElement) {
      return;
    }

    const top = this.datepicker.getTop();
    const bottom = this.datepicker.getBottom();
    const left = this.datepicker.getLeft();
    const right = this.datepicker.getRight();
    if (this.datepicker.isVisible() && (event.x < left || event.x > right || event.y < top || event.y > bottom)) {
      this.close();
      this.closeYearsSelect();
      this.closeMonthsSelect();
    } else {
      if (this.years.isVisible()) {
        this.closeYearsSelect();
      }
      if (this.months.isVisible()) {
        this.closeMonthsSelect();
      }
    }
  }

  /**
   * Handles a global key event. This determines if the DateTimePicker is open and if enter or escape was hit.
   *
   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleGlobalKey(event) {
    // Skip this function completely if the DateTimePicker isn't open
    if (!this.datepicker.isVisible()) {
      return;
    }

    if (event.keyCode === Events.Keys.ENTER) {
      Utils.stopEvent(event);
      this.setDate(this.date);
      this.close();
      this.element.focus();
    } else if (event.keyCode === Events.Keys.ESCAPE) {
      this.close();
      this.element.focus();
    }
  }

  /**
   * Handles when a key is click in the hours input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the hour.
   *
   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleHourKey(event) {
    if (event.keyCode === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusHours(this.date, 1);
      this.setDate(this.date);
      this.hourInput.domElement.setSelectionRange(0, this.hourInput.getValue().length);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusHours(this.date, -1);
      this.setDate(this.date);
      this.hourInput.domElement.setSelectionRange(0, this.hourInput.getValue().length);
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setHours(parseInt(this.hourInput.getValue()));
    }
  }

  /**
   * Handle the click event for the input date field. If the DateTimePicker is hidden this will call the {@link #show()}
   * function.
   *
   * @returns {boolean} Always true.
   * @private
   */
  _handleInputClick() {
    if (!this.datepicker.isVisible()) {
      this.open();
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
      this.monthInput.focus();
    }
  }

  /**
   * Handle the key event for the input date field. If the user hits tab or shift-tab, this moves the focus to the
   * nested inputs.
   *
   * @param {KeyboardEvent} event The keyboard event.
   * @private
   */
  _handleInputKey(event) {
    if (this.datepicker.isVisible() && event.keyCode === Events.Keys.TAB) {
      Utils.stopEvent(event);
      if (event.shiftKey) {
        this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
        this.ampmInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
        this.monthInput.focus();
      }
    }
  }

  /**
   * Handle the key down event and capture the up and down arrow key to increment and decrement the minute.

   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleMinuteKey(event) {
    if (event.keyCode === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusMinutes(this.date, 1);
      this.setDate(this.date);
      this.minuteInput.domElement.setSelectionRange(0, this.minuteInput.getValue().length);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusMinutes(this.date, -1);
      this.setDate(this.date);
      this.minuteInput.domElement.setSelectionRange(0, this.minuteInput.getValue().length);
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setMinutes(parseInt(this.minuteInput.getValue()));
    }
  }

  /**
   * Handles the click on the month to open the month select.
   *
   * @private
   */
  _handleMonthExpand(event) {
    Utils.stopEvent(event);
    this.openMonthSelect();
  }

  /**
   * Handles when a key is click in the month input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the month.
   *
   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleMonthKey(event) {
    if (event.keyCode === Events.Keys.TAB && event.shiftKey) {
      Utils.stopEvent(event);
      if (this.options.dateOnly) {
        this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
        this.yearInput.focus();
      } else {
        this.ampmInput.domElement.setSelectionRange(0, this.ampmInput.getValue().length);
        this.ampmInput.focus();
      }
      return;
    }

    if (event.keyCode === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusMonths(this.date, 1);
      this.setDate(this.date);
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusMonths(this.date, -1);
      this.setDate(this.date);
      this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setMonth(parseInt(this.monthInput.getValue()) - 1);
    }
  }

  /**
   * Handle the next month button click.
   *
   * @param {MouseEvent} event The mouse event.
   * @private
   */
  _handleNextMonth(event) {
    Utils.stopEvent(event);
    this.nextMonth();
  }

  /**
   * Handle the previous month button click.
   *
   * @param {MouseEvent} event The mouse event.
   * @private
   */
  _handlePreviousMonth(event) {
    Utils.stopEvent(event);
    this.previousMonth();
  }

  /**
   * Handle the key down event and capture the up and down arrow key to increment and decrement the second.

   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleSecondKey(event) {
    if (event.keyCode === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusSeconds(this.date, 1);
      this.setDate(this.date);
      this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusSeconds(this.date, -1);
      this.setDate(this.date);
      this.secondInput.domElement.setSelectionRange(0, this.secondInput.getValue().length);
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setSeconds(parseInt(this.secondInput.getValue()));
    }
  }

  /**
   * Handles the click on the year to open the year select.
   *
   * @private
   */
  _handleYearExpand(event) {
    Utils.stopEvent(event);
    this.openYearSelect();
  }

  /**
   * Handles when a key is click in the year input field so that tab and shift tab work properly.
   * <p>
   * Also handles up and down arrow to increment and decrement the year.
   *
   * @param {KeyboardEvent} event The key event.
   * @private
   */
  _handleYearKey(event) {
    if (event.keyCode === Events.Keys.UP_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusYears(this.date, 1);
      this.setDate(this.date);
      this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
    } else if (event.keyCode === Events.Keys.DOWN_ARROW) {
      Utils.stopEvent(event);
      PrimeDate.plusYears(this.date, -1);
      this.setDate(this.date);
      this.yearInput.domElement.setSelectionRange(0, this.yearInput.getValue().length);
    } else if (event.keyCode === Events.Keys.TAB && this.options.dateOnly) {
      Utils.stopEvent(event);
      if (event.shiftKey) {
        this.dayInput.domElement.setSelectionRange(0, this.dayInput.getValue().length);
        this.dayInput.focus();
      } else {
        this.monthInput.domElement.setSelectionRange(0, this.monthInput.getValue().length);
        this.monthInput.focus();
      }
    } else if (event.keyCode === Events.Keys.ENTER) {
      this.date.setFullYear(parseInt(this.yearInput.getValue()));
    }
  }

  /**
   * Rebuilds the HTML of the DateTimePicker.
   * @private
   */
  _rebuild() {
    this.drawCalendar(this.date);
    this._refreshInputs();

    if (this.options.dateOnly) {
      this.time.hide();
    }
  }

  /**
   * Refresh the time inputs.
   *
   * @private
   */
  _refreshInputs() {
    // Set Time -- assuming 12-hour time for the input fields and ISO 24-hour time for the field
    const hours = PrimeDate.getHourOfDay(this.date);
    this.hourInput.setValue(hours);

    const minutes = this.date.getMinutes();
    this.minuteInput.setValue(("00" + minutes).slice(-2));

    const seconds = this.date.getSeconds();
    this.secondInput.setValue(("00" + seconds).slice(-2));

    if (this.date.getHours() >= 12) {
      this.ampmInput.setValue(DateTimePicker.AM_PM[1]);
    } else {
      this.ampmInput.setValue(DateTimePicker.AM_PM[0]);
    }

    this.monthInput.setValue(this.date.getMonth() + 1);
    this.dayInput.setValue(this.date.getDate());
    this.yearInput.setValue(this.date.getFullYear());
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      className: 'prime-date-picker',
      closeTimeout: 200,
      dateOnly: false
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {DateTimePicker};
