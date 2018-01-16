/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
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

import {Utils} from "../Utils";
import {PrimeElement} from "../Document/PrimeElement";
import {PrimeStorage} from "../Storage";

class Table {
  /**
   * Constructs a new Table object for the given table element.
   *
   * @param {PrimeElement|Element} element The table element.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.column = null;
    this.columnIndex = 0;
    this.sortAscending = true;

    this.element = PrimeElement.wrap(element);
    this.thead = this.element.queryFirst('thead');
    this.tbody = this.element.queryFirst('tbody');

    if (!this.element.is('table')) {
      throw new TypeError('The element you passed in is not a table element.');
    }

    this._setInitialOptions();
  }

  /**
   * Initializes the table widget.
   *
   * @returns {Table} This.
   */
  initialize() {
    // Sortable by default unless it is disabled
    if (this.element.getDataAttribute('sortable') !== 'false') {
      this._initializeSort();
    }

    // Initialize the checkbox handling
    this.selectAll = this.element.queryFirst('thead > tr > th input[type="checkbox"]');
    if (this.selectAll !== null) {
      this.selectAll.addEventListener('change', this._handleSelectAllChange);
    }

    this.element.query('tbody > tr > td input[type="checkbox"]').addEventListener('click', this._handleCheckboxEvent);
    this.checkedCount = 0;
    this.numberofCheckboxes = this.element.query('tbody td input[type="checkbox"]').length;

    return this;
  }

  /**
   * Sort the table.
   */
  sort() {
    this._clearSortIndicators();

    if (this.column.hasClass('sort-up')) {
      this.column.removeClass('sort-up').addClass('sort-down');
      this.sortAscending = false;
    } else if (this.column.hasClass('sort-down')) {
      this.column.removeClass('sort-down').addClass('sort-up');
      this.sortAscending = true;
    } else {
      this.column.addClass('sort-up');
      this.sortAscending = true;
    }

    // Collect the values to sort
    const rows = [];
    this.tbody.query('tr').each(function(element) {
      rows.push(element);
    });

    rows.sort(this._comparator);
    let i = 0;
    const length = rows.length;
    if (this.sortAscending) {
      for (i = 0; i <  length; i++) {
        this.tbody.appendElement(rows[i]);
      }
    } else {
      for (i = length; i > 0; i--) {
        this.tbody.appendElement(rows[i - 1]);
      }
    }

    // Save current sorted column state in local storage.
    if (PrimeStorage.supported && this.options.localStorageKey !== null) {
      const data = {
        columnIndex: this.columnIndex,
        sortAscending: this.sortAscending
      };
      PrimeStorage.setSessionObject(this.options.localStorageKey, data);
    }
  }

  /**
   * Sets a callback on a checkbox event.
   *
   * @param {function} callback The callback function
   * @returns {Table} This.
   */
  withCheckEventCallback(callback) {
    this.options.checkEventCallback = callback;
    return this;
  }

  /**
   * Enables local storage of the sorted column. This key is required to enable local storage of the sorted column.
   *
   * @param {String} key The local storage key.
   * @returns {Table} This.
   */
  withLocalStorageKey(key) {
    this.options.localStorageKey = key;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Table} This.
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
   * Remove the ascending and descending sort classes on every column except the current column being sorted.
   * @private
   */
  _clearSortIndicators() {
    this.thead.query('th').each((function(element) {
      if (element.domElement !== this.column.domElement) {
        element.removeClass('sort-up sort-down');
      }
    }).bind(this));
  }

  /**
   * Sort function to be used by the .sort() method.
   * @param a The first row to compare
   * @param b The second row to compare
   * @returns {number}
   * @private
   */
  _comparator(a, b) {
    const sortType = this.thead.query('th')[this.columnIndex].getDataAttribute('sortType') || 'string';
    if (sortType !== 'string' && sortType !== 'number') {
      throw new Error('Unsupported sort type. [string] or [number] are the two supported sort types.');
    }

    const cell1 = a.query('td')[this.columnIndex];
    const cell2 = b.query('td')[this.columnIndex];

    const sortValue1 = cell1.getDataAttribute('sortValue');
    const sortValue2 = cell2.getDataAttribute('sortValue');

    // Prefer the data-sort-value if provided
    let value1 = sortValue1 || cell1.getTextContent().toLowerCase();
    let value2 = sortValue2 || cell2.getTextContent().toLowerCase();

    if (sortType === 'string') {
      return value1.localeCompare(value2);
    } else {
      value1 = this._toNumber(value1);
      value2 = this._toNumber(value2);

      if (value1 < value2) {
        return -1;
      }

      if (value1 > value2) {
        return 1;
      }

      return 0;
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * Return the column index where 0 is the first column in the table.
   * @param column {PrimeElement} the column to determine the index of
   * @returns {number} a positive integer representing the index of the column in the table.
   * @private
   */
  _getColumnIndex(column) {
    let columnIndex = 0;
    let current = column;
    let previous = column;
    while (previous !== null) {
      previous = current.getPreviousSibling();
      current = previous;
      columnIndex++;
    }

    return columnIndex - 1;
  }

  _handleCheckboxEvent(event) {
    const target = new PrimeElement(event.currentTarget);
    const currentCheckedCount = this.checkedCount;
    this.checkedCount = this.checkedCount + (target.isChecked() ? 1 : -1);

    if (this.selectAll !== null) {
      if (currentCheckedCount === this.numberofCheckboxes && this.numberofCheckboxes !== this.checkedCount) {
        this.selectAll.setChecked(false);
      } else if (currentCheckedCount !== this.numberofCheckboxes && this.numberofCheckboxes === this.checkedCount) {
        this.selectAll.setChecked(true);
      }
    }

    if (this.options.checkEventCallback !== null) {
      this.options.checkEventCallback({
        checkedCount: this.checkedCount
      });
    }
  }

  _handleSelectAllChange() {
    if (this.selectAll.isChecked()) {
      this.element.query('tbody tr > td input[type="checkbox"]').each(function(e) {
        if (!e.isChecked()) {
          e.setChecked(true);
          this.checkedCount++;
        }
      }.bind(this));
    } else {
      this.element.query('tbody tr > td input[type="checkbox"]').each(function(e) {
        if (e.isChecked()) {
          e.setChecked(false);
          this.checkedCount--;
        }
      }.bind(this));
    }

    if (this.options.checkEventCallback !== null) {
      this.options.checkEventCallback({
        checkedCount: this.checkedCount
      });
    }
  }

  /**
   * Handle the click event on the sortable column.
   * @param event {MouseEvent} the click event
   * @private
   */
  _handleSortableColumnClick(event) {
    const target = new PrimeElement(event.currentTarget);
    this.column = target;
    this.columnIndex = this._getColumnIndex(target);

    this.sort();
  }

  /**
   * Add the click event listener to the column unless it matches the ignore selector.
   * @param column {PrimeElement} the column element to initialize.
   * @private
   */
  _initializeColumn(column) {
    if (!column.is('[data-sortable="false"]') && column.queryFirst('input[type="checkbox"]') === null) {
      column.addClass('sortable').addEventListener('click', this._handleSortableColumnClick);
    }
  }

  _initializeSort() {
    this.thead.query('th').each(this._initializeColumn);

    if (PrimeStorage.supported && this.options.localStorageKey !== null) {
      const state = PrimeStorage.getSessionObject(this.options.localStorageKey);
      if (state !== null) {
        this.columnIndex = state.columnIndex;
        this.sortAscending = state.sortAscending;

        this.column = this.thead.query('th')[this.columnIndex];
        if (this.sortAscending) {
          this.column.addClass('sort-down');
        } else {
          this.column.addClass('sort-up');
        }

        this.sort();
      }
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      localStorageKey: null,
      checkEventCallback: null
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }

  // noinspection JSMethodCanBeStatic
  _toNumber(value) {
    const number = Number(value);
    if (isNaN(value)) {
      console.error(new Error('Expected value [' + value + '] to be a number.'));
      return value;
    }
    return number;
  }
}

export {Table};
