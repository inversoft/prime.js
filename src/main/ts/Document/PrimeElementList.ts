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

import {PrimeElement} from "./PrimeElement.js";
import {Utils} from "../../ts/Utils.js";

class PrimeElementList {
  /**
   * Constructs an PrimeElementList object using the given array containing DOMElements or PrimeElement objects, or the NodeList containing Node objects.
   *
   * @constructor
   * @param {Array|NodeList} elements An array containing DOMElement or PrimeElement objects, or a NodeList containing Node objects.
   */
  constructor(elements) {
    Utils.bindAll(this);

    // NodeList does not inherit from Array so do not assume object type.
    this.length = elements.length;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] instanceof PrimeElement) {
        this[i] = elements[i];
      } else {
        this[i] = new PrimeElement(elements[i]);
      }
    }
  }

  /**
   * Shorthand for calling {@link PrimeElement.addClass} on each Element in the PrimeElementList.
   *
   * Adds the given class (or list of space separated classes) to all Elements in this PrimeElementList.
   *
   * @param {string} classNames The class name(s) separated by a space.
   * @returns {PrimeElementList} This PrimeElementList.
   */
  addClass(classNames) {
    return this._proxyToElement('addClass', classNames);
  }

  /**
   * Shorthand for calling {@link PrimeElement.addEventListener} on each Element in the PrimeElementList.
   *
   * Attaches an event listener to all Elements in this PrimeElementList.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event listener function.
   * @returns {PrimeElement|PrimeElementList} This Element.
   */
  addEventListener(event, listener) {
    return this._proxyToElement('addEventListener', event, listener);
  }

  /**
   * Iterates over each of the PrimeElement objects in this PrimeElementList and calls the given function for each one.
   * The <code>this</code> variable inside the function will be managed by the caller of this method. You should use the
   * <code>bind</code> method on the Function object if you want to manage the <code>this</code> reference.
   *
   * The function can optionally take two parameters. The first parameter is the current element. The second parameter
   * is the current index.
   *
   * @param {Function} iterationFunction The function to call.
   * @returns {PrimeElementList} This PrimeElementList.
   */
  each(iterationFunction) {
    for (let i = 0; i < this.length; i++) {
      iterationFunction(this[i], i);
    }

    return this;
  }

  /**
   * Shorthand for calling {@link PrimeElement.hide} on each Element in the PrimeElementList.
   *
   * Hides the Element by setting the display style to none.
   *
   * @returns {PrimeElementList} This PrimeElementList.
   */
  hide() {
    return this._proxyToElement('hide');
  }

  /**
   * Returns the indexOf the element that matches the parameter, either Prime Element or DOMElement.
   *
   * @param {PrimeElement|Element} element The element to look for
   * @returns {number} The position of the element in the list, or -1 if not present.
   */
  indexOf(element) {
    const domElement = (element instanceof PrimeElement) ? element.domElement : element;

    for (let i = 0; i < this.length; i++) {
      if (this[i].domElement === domElement) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Removes all the matched elements in the PrimeElementList from the DOM.
   *
   * @returns {PrimeElementList} This PrimeElementList.
   */
  removeAllFromDOM() {
    for (let i = 0; i < this.length; i++) {
      this[i].removeFromDOM();
    }

    return this;
  }

  /**
   * Shorthand for calling {@link PrimeElement.removeClass} on each Element in the PrimeElementList.
   *
   * Removes the given class (or list of space separated classes) from all Elements in this PrimeElementList.
   *
   * @param {string} classNames The class name(s) separated by a space.
   * @returns {PrimeElementList} This PrimeElementList.
   */
  removeClass(classNames) {
    return this._proxyToElement('removeClass', classNames);
  }

  /**
   * Shorthand for calling {@link PrimeElement.setChecked} on each Element in the PrimeElementList.
   *
   * If this element is a checkbox or radio button, this sets the checked field on the DOM object equal to the given
   * value.
   *
   * @param {boolean} value The value to set the checked state of this element to.
   * @returns {PrimeElementList} This PrimeElementList.
   */
  setChecked(value) {
    return this._proxyToElement('setChecked', value);
  }

  /**
   * Shorthand for calling {@link PrimeElement.setDisabled} on each Element in the PrimeElementList.
   *
   * Sets if this element is disabled or not. This works with any element that responds to the disabled property.
   *
   * @param {boolean} value The value to set the disabled state of this element to.
   * @returns {PrimeElementList} This PrimeElementList.
   */
  setDisabled(value) {
    return this._proxyToElement('setDisabled', value);
  }

  /**
   * Shorthand for calling {@link PrimeElement.show} on each Element in the PrimeElementList.
   *
   * Shows the element.
   *
   * @returns {PrimeElementList} This PrimeElementList.
   */
  show() {
    return this._proxyToElement('show');
  }

  /**
   * @callback PrimeElementListPredicate
   *
   * A function that defines a condition on a PrimeElement
   *
   * @param {PrimeElement} element
   * @returns {boolean} True if the element matches a condition
   */

  /**
   * A function that tests for any element that matches a condition.
   * @param {PrimeElementListPredicate} predicate A function that defines the condition to check
   * @returns {boolean} True if any element matches the predicate
   */
  some(predicate) {
    for (let i = 0; i < this.length; ++i) {
      if (predicate(this[i])) {
        return true;
      }
    }
    return false;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Proxy function calls to each Element in the PrimeElementList.
   * The first parameter is function name, followed by a variable length of arguments.
   *
   * Example usage: this._proxyToElement('addClass', classNames);
   *
   * @returns {PrimeElementList}
   * @private
   */
  _proxyToElement() {
    const args = Array.prototype.slice.apply(arguments);
    for (let i = 0; i < this.length; i++) {
      this[i][args[0]].apply(this[i], args.slice(1));
    }
    return this;
  }
}

export {PrimeElementList}
