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

import {PrimeElement} from "../Document/PrimeElement.js";
import {PrimeDocument} from "../PrimeDocument.js";
import {Tooltip} from "./Tooltip.js";
import {Utils} from "../Utils.js";

class Clipboard {
  /**
   * Description, todo's, ramblings - BGUY
   *
   * 1. Currently, this widget binds to any element that has a 'data-copy' attribute.
   *    If the element is a BUTTON, data-copy must have a value that is used as a target. The target indicates the Id
   *    of the element to copy.
   *    Else, when you 'mouseenter' over the element containing data-copy, innerHTML is selected.
   *    The idea here is that we can leverage keyboard-driven copy, ie. you hover over text and all you have to do is press
   *    command+C
   *    I'm sure there are holes to fill, but this is what I was playing with.
   * 2. I'm referencing document directly: is there a more Prime'y way to do that?
   * 3. What are some other glaring "bad-practice" things am I doing?
   */

  /**
   * Constructs a new Clipboard object for the given element.
   *
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the Clipboard widget.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this.button = this.element.getTagName() === 'BUTTON' ? this.element : null;
    // TODO : Is this an option? Do we need this? Can we just check this.tooltip for null?
    this.showTooltip = false
    // TODO : Are there any default options? Can I set them using data- attributes?
    this.options = {};
    // TODO : Is this used?
    this.selectedText = "";
  }

  /**
   * Removes the event listeners.
   */
  destroy() {
    // TODO : What if you have not initialized the widget when this is called?
    if (this.button != null) {
      this.button.removeEventListener('click', this._handleButtonClick);
    } else {
      this.element.domElement.removeEventListener('mouseenter', this._handleMouseEnter);
      this.element.domElement.removeEventListener('mouseleave', this._handleMouseExit);
    }
    // TODO : Should we also destroy the tooltip if used?
  }

  withTooltip(tooltip) {
    this.showTooltip = true;
    this.element.domElement.setAttribute("data-tooltip", tooltip);

    this.tooltip = new Tooltip(this.element).hide();
    return this;
  }

  withCallback(callback) {
    this.callback = callback;
  }

  /**
   * Initializes the widget by attaching event listeners to the element.
   *
   * @returns {Clipboard} This.
   */
  initialize() {
    // TODO : Can I call initialize more than once?
    if (this.button != null) {
      this.button.addEventListener('click', this._handleButtonClick);
    } else {
      this.element.domElement.addEventListener('mouseenter', this._handleMouseEnter);
      this.element.domElement.addEventListener('mouseleave', this._handleMouseExit);
    }
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Sets focus and selects text.
   *
   * @param target The target element.
   * @private
   */
  _select(target) {
    if (target.domElement.nodeName === 'INPUT') {
      target.domElement.focus();
      target.domElement.select();
      target.domElement.setSelectionRange(0, 99999); /* For mobile devices */
      this.selectedText = target.domElement.value;
    } else {
      let range = new Range();
      let selection = document.getSelection();
      let node = Array.from(target.domElement.childNodes).find(node => this._sanitize(node.textContent) !== '');
      let text = this._sanitize(node.textContent);

      range.setStart(node, node.textContent.indexOf(text));
      range.setEnd(node, node.textContent.indexOf(text) + text.length);
      selection.removeAllRanges();
      selection.addRange(range);

      this.selectedText = selection.toString();
    }
  }

  /**
   * Removes special characters \n and &nbsp; and then trims a string of text.
   *
   * @param text The text to remove special characters and trim
   * @returns {string}
   * @private
   */
  _sanitize(text) {
    // TODO : Is this a security thing? What if I want to copy some text with a line return and a space?
    return text.replace("\n", "")
        .replace("&nbsp;", "")
        .trim();
  }

  /**
   * Handles the mouse enter event.
   *
   * @private
   */
  _handleMouseEnter() {
    if (this.element.getHTML() === "") {
      // TODO : What does this mean?
      throw new TypeError('You can only use [data-copy] attribute in input tags or tags that have innerHTML');
    }
    this._select(this.element)
  }

  /**
   * Handles the mouse exit event to hide the tooltip.
   *
   * @private
   */
  _handleMouseExit() {
    document.getSelection().empty();
  }

  /**
   * Called when a click event has completed successfully.
   *
   * @private
   */
  _handleSuccess() {
    if (this.showTooltip) {
      this.tooltip.show();
      // Doesn't the tooltip do this?
      setTimeout(function() {
        this.tooltip.hide();
      }.bind(this), 1000);
    }

    if (this.callback) {
      this.callback.call();
    }
  }

  /**
   * Handles the button click event.
   *
   * @private
   */
  _handleButtonClick() {
    // retrieve the target element with text to copy
    let copyId = this.button.getAttribute('data-copy');

    if (copyId == null) {
      throw new Error('A button with [data-copy] attribute must have a value');
    }
    let target = PrimeDocument.queryById(copyId);

    // highlight/select the text to copy
    this._select(target);

    // copy the text to the clipboard
    document.execCommand('copy');
    this._handleSuccess();
  }
}

export {Clipboard};
