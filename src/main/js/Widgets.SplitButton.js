/*
 * Copyright (c) 2014, Inversoft Inc., All Rights Reserved
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
 * Constructs a new SplitButton object for the given ul element.
 *
 * The markup must be a ul element with one or more items containing an a tag with an href.
 * You may optionally add a 'default' class on one of the items to indicate this is the default action.
 * If this is not provided the first item will be considered the default action.
 *
 * <pre>
 *   &lt;ul&gt;
 *     &lt;li&gt;&lt;a href="/admin/foo/delete/"&gt;Delete&lt;/a&gt;&lt;/li&gt;
 *     &lt;li class="default"&gt;&lt;a href="/admin/foo/edit/"&gt;Edit&lt;/a&gt;&lt;/li&gt;
 *   &lt;/ul&gt;
 * </pre>
 *
 * @param button {Prime.Document.Element} The ul element to transform into a split button.
 * @constructor
 */
Prime.Widgets.SplitButton = function(element) {

  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);
  if (this.element.domElement.nodeName.toLowerCase() !== 'ul') {
    throw new TypeError('SplitButton requires a ul element. The passed element type is <' + element.domElement.nodeType.toLowerCase() + '>');
  }

  this.element = element;
  this.element.hide().addClass('prime-split-button prime-initialized');
  this.container = Prime.Document.queryUp('div,td', this.element);

  // If a default action was not found, use the first one
  this.defaultAction = Prime.Document.queryFirst('> li.default a', this.element);
  if (this.defaultAction === null) {
    this.defaultAction = Prime.Document.queryFirst('> li a', this.element);
  }

  // Build the split button markup and add listeners
  this._buildSplitButton();
  this.splitButton.addEventListener('mouseover', this._handleMouseOver, this);
  this.splitButton.addEventListener('mouseout', this._handleMouseOut, this);
  this.element.addEventListener('mouseout', this._handleMouseOut, this);
  this.dropDown.addEventListener('click', this._handleDropDownClick, this);

  // Register a single global listener to handle closing buttons
  var body = new Prime.Document.Element(document.body);
  if (!body.getAttribute('data-prime-split-button-handler')) {
    body.addEventListener('click', this._hideAllButtons, this);
    body.setAttribute('data-prime-split-button-handler', 'true');
  }
};

Prime.Widgets.SplitButton.constructor = Prime.Widgets.SplitButton;

Prime.Widgets.SplitButton.prototype = {

  /**
   * Handle the split button click to expand the action list.
   * @private
   */
  _handleDropDownClick: function(event) {

    this._clearActiveMarker();
    this._setActiveMarker();
    this._hideAllButtons();

    if (this.element.isVisible()) {
      this.element.hide();
      this.splitButton.addClass('prime-inactive')
    } else {
      this.element.setStyle('margin-top', this.dropDownDiv.getHeight() + 2 + 'px');
      this.element.show();
      this.splitButton.removeClass('prime-inactive')
    }

    event.stopPropagation();
    return false;
  },

  /**
   * Handles the mouse over event.
   *
   * @private
   */
  _handleMouseOver: function() {
    this.splitButton.removeClass('prime-inactive')
  },

  /**
   * Handles the mouse out event.
   *
   * @private
   */
  _handleMouseOut: function() {
    if (!this.element.isVisible()) {
      this.splitButton.addClass('prime-inactive')
    }
  },

  /**
   * Build the necessary markup to transform the ul to a split button action.
   * @private
   */
  _buildSplitButton: function() {

    var div = Prime.Document.newElement('<div>');
    div.addClass('prime-split-button prime-inactive');
    div.prependTo(this.container);

    // set a reference to this object
    this.splitButton = Prime.Document.queryFirst('div.prime-split-button', this.container);

    var buttonDiv = Prime.Document.newElement('<div>');
    var button = Prime.Document.newElement('<a>');

    button.addClass('prime-split-button-default');
    button.setAttribute('href', this.defaultAction.getAttribute('href'));
    button.setHTML(this.defaultAction.getHTML());

    var dropDownDiv = Prime.Document.newElement('<div>');
    var dropDown = Prime.Document.newElement('<a>');
    dropDown.addClass('prime-drop-down');

    dropDownDiv.prependTo(this.splitButton);
    // re-assign reference to the DOM element
    dropDownDiv = Prime.Document.queryLast('div', this.splitButton);
    dropDown.prependTo(dropDownDiv.domElement);

    buttonDiv.prependTo(this.splitButton);
    // re-assign reference to the DOM element
    buttonDiv = Prime.Document.queryFirst('div', this.splitButton);
    button.prependTo(buttonDiv.domElement);

    this.dropDown = Prime.Document.queryFirst('a.prime-drop-down', this.splitButton);
    this.dropDownDiv = Prime.Document.queryUp('div', this.dropDown);
    this.element.setStyle('margin-top', this.dropDown.getHeight() + '');

  },

  /**
   * Clear the active marker.
   * @private
   */
  _clearActiveMarker: function() {
    Prime.Document.query('ul.prime-split-button.prime-initialized[data-prime-active]').each(function(element) {
      element.removeAttribute('data-prime-active');
    }, this);
  },

  /**
   * Hide all visible split buttons on the page. And ensure all are set to inactive.
   * @param event
   * @private
   */
  _hideAllButtons: function(event) {
    Prime.Document.query('ul.prime-split-button.prime-initialized').each(function(element) {
      if (typeof event === 'undefined') {
        if (!element.domElement.hasAttribute('data-prime-active') && element.isVisible()) {
          element.hide();
        }
      } else {
        if (element.isVisible()) {
          element.hide();
        }
      }

    }, this);

    Prime.Document.query('div.prime-split-button:not(.prime-inactive)').each(function(element) {
      element.addClass('prime-inactive');
    }, this);
  },

  /**
   * Set the active split button.
   * @private
   */
  _setActiveMarker: function() {
    this.element.setAttribute('data-prime-active', 'true');
  }
}