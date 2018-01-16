/*
 * Copyright (c) 2014-2017, Inversoft Inc., All Rights Reserved
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

import {PrimeDocument} from "../PrimeDocument";
import {PrimeElement} from "../Document/PrimeElement";
import {Utils} from "../Utils";

class SplitButton {
  /**
   * Constructs a new SplitButton object for the given ul element.
   *
   * The markup must be a ul element with one or more items containing an a tag with an href.
   * You may optionally add a 'default' class on one of the items to indicate this is the default action.
   * If this is not provided the first item will be considered the default action.
   *
   * Example 1, two actions the second action is set as default and shows on top w/out expansion.
   * <pre>
   *   &lt;ul&gt;
   *     &lt;li&gt;&lt;a href="/admin/foo/delete/"&gt;Delete&lt;/a&gt;&lt;/li&gt;
   *     &lt;li class="default"&gt;&lt;a href="/admin/foo/edit/"&gt;Edit&lt;/a&gt;&lt;/li&gt;
   *   &lt;/ul&gt;
   * </pre>
   *
   * Example 2, two actions w/out a default. The top level action causes the button to expand.
   * <pre>
   *   &lt;ul&gt;
   *     &lt;li&gt;&lt;a href="#"&gt;Select&hellip;&lt;/a&gt;&lt;/li&gt;
   *     &lt;li&gt;&lt;a href="/admin/foo/delete/"&gt;Delete&lt;/a&gt;&lt;/li&gt;
   *     &lt;li&gt;&lt;a href="/admin/foo/edit/"&gt;Edit&lt;/a&gt;&lt;/li&gt;
   *   &lt;/ul&gt;
   * </pre>
   *
   * @param element {PrimeElement|Element|EventTarget} The ul element to transform into a split button.
   * @constructor
   */
  constructor(element) {
    this.element = PrimeElement.wrap(element);
    const nodeName = this.element.domElement.nodeName.toLowerCase();
    if (nodeName !== 'ul') {
      throw new TypeError('SplitButton requires a ul element. The passed element type is <' + nodeName + '>');
    }

    if (this.element.hasClass('prime-initialized')) {
      throw new Error('This element has already been initialized. Call destroy before initializing again.');
    }

    Utils.bindAll(this);

    this.element.hide().addClass('prime-split-button');
    this.container = PrimeDocument.queryUp('div,td', this.element);

    // If a default action was not found, use the first one
    this.defaultAction = this.element.queryFirst('ul > li.default a');
    if (this.defaultAction === null) {
      this.defaultAction = this.element.queryFirst('ul > li a');
    }

    // Build the split button markup and add listeners
    this._buildSplitButton();
    this.splitButton.addEventListener('mouseover', this._handleMouseOver);
    this.splitButton.addEventListener('mouseout', this._handleMouseOut);
    this.element.addEventListener('mouseout', this._handleMouseOut);
    this.dropDown.addEventListener('click', this._handleDropDownClick);
    this.dropDownDiv.addEventListener('click', this._handleDropDownClick);
    this.defaultButton.addEventListener('click', this._handleDefaultButton);

    // Register a single global listener to handle closing buttons
    const body = new PrimeElement(document.body);
    if (!body.getAttribute('data-prime-split-button-handler')) {
      body.addEventListener('click', this._hideAllButtons);
      body.setAttribute('data-prime-split-button-handler', 'true');
    }
    this.element.addClass('prime-initialized');
  }

  /**
   * Destroy the the SplitButton widget
   */
  destroy() {
    this.splitButton.removeAllEventListeners();
    this.dropDown.removeAllEventListeners();
    this.splitButton.removeFromDOM();

    this.element.removeEventListener('mouseout', this._handleMouseOut);
    this.element.removeAttribute('data-prime-active');
    this.element.setStyle('margin-top', '');
    this.element.removeClass('prime-initialized prime-split-button').show();
    this.defaultAction.show();
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  // noinspection JSMethodCanBeStatic
  /**
   * Clear the active marker.
   * @private
   */
  _clearActiveMarker() {
    PrimeDocument.query('ul.prime-split-button.prime-initialized[data-prime-active]').each(function(element) {
      element.removeAttribute('data-prime-active');
    });
  }

  /**
   * Handle the default button click
   * @param {MouseEvent} event the click event.
   * @private
   */
  _handleDefaultButton(event) {
    Utils.stopEvent(event);
    this.defaultAction.fireEvent('click', null, null, false, true);
  }

  /**
   * Handle the split button click to expand the action list.
   * @param {MouseEvent} event the click event.
   * @private
   */
  _handleDropDownClick(event) {
    Utils.stopEvent(event);
    this._clearActiveMarker();
    this._setActiveMarker();
    this._hideAllButtons();

    if (this.element.isVisible()) {
      this.element.hide();
      this.splitButton.addClass('prime-inactive')
    } else {
      this.element.setStyle('margin-top', this.dropDownDiv.getHeight() + 2 + 'px');
      this.element.show();
      let width = 1;
      this.splitButton.getChildren('div').each(function(element) {
        width += element.getWidth();
      });
      this.element.setWidth(width);
      this.splitButton.removeClass('prime-inactive')
    }
  }

  /**
   * Handles the mouse over event.
   *
   * @private
   */
  _handleMouseOver() {
    this.splitButton.removeClass('prime-inactive')
  }

  /**
   * Handles the mouse out event.
   *
   * @private
   */
  _handleMouseOut() {
    if (!this.element.isVisible()) {
      this.splitButton.addClass('prime-inactive')
    }
  }

  /**
   * Build the necessary markup to transform the ul to a split button action.
   * @private
   */
  _buildSplitButton() {

    const div = PrimeDocument.newElement('<div>');
    div.addClass('prime-split-button prime-inactive');
    div.prependTo(this.container);

    // set a reference to this object
    this.splitButton = PrimeDocument.queryFirst('div.prime-split-button', this.container);

    let buttonDiv = PrimeDocument.newElement('<div>');
    const button = PrimeDocument.newElement('<a>');

    button.addClass('prime-split-button-default');
    button.setAttribute('href', this.defaultAction.getAttribute('href'));
    button.setHTML(this.defaultAction.getHTML());
    // Setting href to '#' will expand the button and remove it from the expanded list
    if (button.getAttribute('href') === '#') {
      button.addEventListener('click', this._handleDropDownClick);
      this.defaultAction.getParent().hide();
    }

    let dropDownDiv = PrimeDocument.newElement('<div>');
    const dropDown = PrimeDocument.newElement('<a>');
    dropDown.addClass('prime-drop-down');

    dropDownDiv.prependTo(this.splitButton);
    // re-assign reference to the DOM element
    dropDownDiv = PrimeDocument.queryLast('div', this.splitButton);
    dropDown.prependTo(dropDownDiv.domElement);

    buttonDiv.prependTo(this.splitButton);
    // re-assign reference to the DOM element
    buttonDiv = PrimeDocument.queryFirst('div', this.splitButton);
    button.prependTo(buttonDiv.domElement);

    this.defaultButton = PrimeDocument.queryFirst('div', this.splitButton);
    this.dropDown = PrimeDocument.queryFirst('a.prime-drop-down', this.splitButton);
    this.dropDownDiv = PrimeDocument.queryUp('div', this.dropDown);
    this.element.setStyle('margin-top', this.dropDown.getHeight() + '');
  }

  /**
   * Hide all visible split buttons on the page. And ensure all are set to inactive.
   * @param {Event} [event] The JavaScript event - this parameter is optional.
   * @private
   */
  _hideAllButtons(event) {
    PrimeDocument.query('ul.prime-split-button.prime-initialized').each(function(element) {
      if (!Utils.isDefined(event)) {
        if (!element.domElement.hasAttribute('data-prime-active') && element.isVisible()) {
          element.hide();
        }
      } else {
        if (element.isVisible()) {
          element.hide();
        }
      }

    });

    PrimeDocument.query('div.prime-split-button:not(.prime-inactive)').each(function(element) {
      element.addClass('prime-inactive');
    });
  }

  /**
   * Set the active split button.
   * @private
   */
  _setActiveMarker() {
    this.element.setAttribute('data-prime-active', 'true');
  }
}

export {SplitButton};
