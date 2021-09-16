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
    this.button = this.element.getTagName() === 'BUTTON' ? this.element.domElement : null;
    this.element.domElement.setAttribute("data-tooltip", "Copied!");
    this.tooltip = new Tooltip(this.element);
    this.options = {};
  }

  /**
   * Removes the event listeners.
   */
  destroy() {
    if (this.button != null) {
      this.button.removeEventListener('click', this._handleButtonClick);
    } else {
      this.element.domElement.removeEventListener('mouseenter', this._handleMouseEnter);
      this.element.domElement.removeEventListener('mouseleave', this._handleMouseExit);
    }
  }

  /**
   * Initializes the widget by attaching event listeners to the element.
   *
   * @returns {Clipboard} This.
   */
  initialize() {
    if(this.button != null) {
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

  _selectTextToCopy(target) {
    if(target.getTagName() === 'INPUT') {
      target.domElement.focus();
      target.domElement.select();
      target.domElement.setSelectionRange(0, 99999); /* For mobile devices */
    } else {
      let range = new Range();
      range.setStart(target.domElement.firstChild, 0);
      range.setEnd(target.domElement.firstChild, target.domElement.firstChild.length);
      document.getSelection().addRange(range);
    }
  }

  /**
   * Handles the mouse enter event.
   *
   * @private
   */
  _handleMouseEnter() {
    if(this.element.domElement.innerHTML === "") {
      throw new TypeError('You can only use [data-copy] attribute in input tags or tags that have innerHTML');
    }
    this._selectTextToCopy(this.element)
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
   * Handles a successful copy to the clipboard for a button click.
   *
   * @private
   */
  _handleSuccess() {
    this.tooltip.show();
    setTimeout(function() {
      this.tooltip.hide();
    }.bind(this), 1000);
  }

  /**
   * Handles the button click event.
   *
   * @private
   */
  _handleButtonClick() {
    // retrieve the target element with text to copy
    let copyId = this.button.getAttribute('data-copy');

    if(copyId == null) {
      throw new Error('A button with [data-copy] attribute must have a value');
    }
    let target = PrimeDocument.queryById(copyId);

    // get the text that we want to copy to the clipboard
    let copyText = target.getTagName() === 'INPUT' ? target.domElement.value : target.domElement.innerHTML;

    // highlight/select the text
    this._selectTextToCopy(target);

    // copy the text to the clipboard
    navigator.clipboard.writeText(copyText).then(this._handleSuccess()
    //     function() {
    //   this.tooltip.show();
    //   // TODO : fire an event? we will want to display a tooltip or something?
    //   // alert('Async: Copying to clipboard was successful!');
    // }
    , function(err) {
      alert('Could not copy text: '+ err);
    });
  }
}

export {Clipboard};
