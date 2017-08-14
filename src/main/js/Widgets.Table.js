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

var Prime = Prime || {};

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new Table object for the given table element.
 *
 * @param {Prime.Document.Element|Element} element The table element.
 * @constructor
 */
Prime.Widgets.Table = function(element) {
  Prime.Utils.bindAll(this);

  this.column = null;
  this.columnIndex = 0;
  this.sortAscending = true;

  this.element = Prime.Document.Element.wrap(element);
  this.thead = this.element.queryFirst('thead');
  this.tbody = this.element.queryFirst('tbody');

  if (!this.element.is('table')) {
    throw new TypeError('The element you passed in is not a table element.');
  }

  this._setInitialOptions();
};

Prime.Widgets.Table.constructor = Prime.Widgets.Table;
Prime.Widgets.Table.prototype = {
  /**
   * Initializes the table widget.
   *
   * @returns {Prime.Widgets.Table} This.
   */
  initialize: function() {
    // Sortable by default unless it is disabled
    if (this.element.getDataAttribute('sortable') === 'false') {
      return this;
    }

    this.thead.query('th').each(this._initializeColumn);

    if (Prime.Storage.supported && this.options['localStorageKey'] !== null) {
      var state = Prime.Storage.getSessionObject(this.options['localStorageKey']);
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

    return this;
  },

  /**
   * Sort the table.
   */
  sort: function() {
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
    var rows = [];
    this.tbody.query('tr').each(function(element) {
      rows.push(element);
    });

    rows.sort(this._comparator);
    var i = 0, length = rows.length;
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
    if (Prime.Storage.supported && this.options['localStorageKey'] !== null) {
      var data = {
        "columnIndex": this.columnIndex,
        'sortAscending': this.sortAscending
      };
      Prime.Storage.setSessionObject(this.options['localStorageKey'], data);
    }
  },

  /**
   * Enables local storage of the sorted column. This key is required to enable local storage of the sorted column.
   *
   * @param {String} key The local storage key.
   * @returns {Prime.Widgets.Table} This.
   */
  withLocalStorageKey: function(key) {
    this.options['localStorageKey'] = key;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.Table} This.
   */
  withOptions: function(options) {
    if (!Prime.Utils.isDefined(options)) {
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
   * Remove the ascending and descending sort classes on every column except the current column being sorted.
   * @private
   */
  _clearSortIndicators: function() {
    this.thead.query('th').each((function(element) {
      if (element.domElement !== this.column.domElement) {
        element.removeClass('sort-up sort-down');
      }
    }).bind(this));
  },

  /**
   * Return the column index where 0 is the first column in the table.
   * @param column {Prime.Document.Element} the column to determine the index of
   * @returns {number} a positive integer representing the index of the column in the table.
   * @private
   */
  _getColumnIndex: function(column) {
    var columnIndex = 0;
    var current = column;
    var previous = column;
    while (previous !== null) {
      previous = current.getPreviousSibling();
      current = previous;
      columnIndex++;
    }

    return columnIndex - 1;
  },

  /**
   * Handle the click event on the sortable column.
   * @param event {MouseEvent} the click event
   * @private
   */
  _handleSortableColumnClick: function(event) {
    var target = new Prime.Document.Element(event.currentTarget);
    this.column = target;
    this.columnIndex = this._getColumnIndex(target);

    this.sort();
  },

  /**
   * Add the click event listener to the column unless it matches the ignore selector.
   * @param column {Prime.Document.Element} the column element to initialize.
   * @private
   */
  _initializeColumn: function(column) {
    if (!column.is('[data-sortable="false"]')) {
      column.addClass('sortable').addEventListener('click', this._handleSortableColumnClick);
    }
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'localStorageKey': null
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  },

  /**
   * Sort function to be used by the .sort() method.
   * @param a The first row to compare
   * @param b The second row to compare
   * @returns {number}
   * @private
   */
  _comparator: function(a, b) {
    var sortType = this.thead.query('th')[this.columnIndex].getDataAttribute('sortType') || 'string';
    if (sortType !== 'string' && sortType !== 'number') {
      throw new Error('Unsupported sort type. [string] or [number] are the two supported sort types.');
    }

    var cell1 = a.query('td')[this.columnIndex];
    var cell2 = b.query('td')[this.columnIndex];

    var sortValue1 = cell1.getDataAttribute('sortValue');
    var sortValue2 = cell2.getDataAttribute('sortValue');

    // Prefer the data-sort-value if provided
    var value1 = sortValue1 || cell1.getTextContent().toLowerCase();
    var value2 = sortValue2 || cell2.getTextContent().toLowerCase();

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
  },

  _toNumber: function(value) {
    // throw and catch our own exception so we can log a stack trace.
    try {
      var number = Number(value);
      if (isNaN(value)) {
        throw new Error('Expected value [' + value + '] to be a number.');
      }
      return number;
    } catch (err) {
      console.error(err);
    }

    return value;
  }
};