/*
 * Copyright (c) 2013-2016, Inversoft Inc., All Rights Reserved
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
Prime.Document = Prime.Document || {};


/**
 * Constructs an ElementList object using the given array containing DOMElements or Prime.Document.Element objects, or the NodeList containing Node objects.
 *
 * @constructor
 * @param {Array|NodeList} elements An array containing DOMElement or Prime.Document.Element objects, or a NodeList containing Node objects.
 */
Prime.Document.ElementList = function(elements) {
  Prime.Utils.bindAll(this);

  // NodeList does not inherit from Array so do not assume object type.
  this.length = elements.length;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] instanceof Prime.Document.Element) {
      this[i] = elements[i];
    } else {
      this[i] = new Prime.Document.Element(elements[i]);
    }
  }
};

Prime.Document.ElementList.prototype = {

  /**
   * Shorthand for calling {@link Prime.Document.Element.addClass} on each Element in the ElementList.
   *
   * Adds the given class (or list of space separated classes) to all Elements in this ElementList.
   *
   * @param {string} classNames The class name(s) separated by a space.
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  addClass: function(classNames) {
    return this._proxyToElement('addClass', classNames);
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.addEventListener} on each Element in the ElementList.
   *
   * Attaches an event listener to all Elements in this ElementList.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event listener function.
   * @returns {Prime.Document.Element} This Element.
   */
  addEventListener: function(event, listener) {
    return this._proxyToElement('addEventListener', event, listener);
  },

  /**
   * Iterates over each of the Prime.Document.Element objects in this ElementList and calls the given function for each one.
   * The <code>this</code> variable inside the function will be managed by the caller of this method. You should use the
   * <code>bind</code> method on the Function object if you want to manage the <code>this</code> reference.
   *
   * The function can optionally take two parameters. The first parameter is the current element. The second parameter
   * is the current index.
   *
   * @param {Function} iterationFunction The function to call.
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  each: function(iterationFunction) {
    for (var i = 0; i < this.length; i++) {
      iterationFunction(this[i], i);
    }

    return this;
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.hide} on each Element in the ElementList.
   *
   * Hides the Element by setting the display style to none.
   *
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  hide: function() {
    return this._proxyToElement('hide');
  },

  /**
   * Returns the indexOf the element that matches the parameter, either Prime Element or DOMElement.
   *
   * @param {Prime.Document.Element|Element} element The element to look for
   * @returns {number} The position of the element in the list, or -1 if not present.
   */
  indexOf: function(element) {
    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;

    for (var i = 0; i < this.length; i++) {
      if (this[i].domElement == domElement) {
        return i;
      }
    }

    return -1;
  },

  /**
   * Removes all the matched elements in the ElementList from the DOM.
   *
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  removeAllFromDOM: function() {
    for (var i = 0; i < this.length; i++) {
      this[i].removeFromDOM();
    }

    return this;
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.removeClass} on each Element in the ElementList.
   *
   * Removes the given class (or list of space separated classes) from all Elements in this ElementList.
   *
   * @param {string} classNames The class name(s) separated by a space.
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  removeClass: function(classNames) {
    return this._proxyToElement('removeClass', classNames);
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.setChecked} on each Element in the ElementList.
   *
   * If this element is a checkbox or radio button, this sets the checked field on the DOM object equal to the given
   * value.
   *
   * @param {boolean} value The value to set the checked state of this element to.
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  setChecked: function(value) {
    return this._proxyToElement('setChecked', value);
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.setDisabled} on each Element in the ElementList.
   *
   * Sets if this element is disabled or not. This works with any element that responds to the disabled property.
   *
   * @param {boolean} value The value to set the disabled state of this element to.
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  setDisabled: function(value) {
    return this._proxyToElement('setDisabled', value);
  },

  /**
   * Shorthand for calling {@link Prime.Document.Element.show} on each Element in the ElementList.
   *
   * Shows the element.
   *
   * @returns {Prime.Document.ElementList} This ElementList.
   */
  show: function() {
    return this._proxyToElement('show');
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Proxy function calls to each Element in the ElementList.
   * The first parameter is function name, followed by a variable length of arguments.
   *
   * Example usage: this._proxyToElement('addClass', classNames);
   *
   * @returns {Prime.Document.ElementList}
   * @private
   */
  _proxyToElement: function() {
    var args = Array.prototype.slice.apply(arguments);
    for (var i = 0; i < this.length; i++) {
      this[i][args[0]].apply(this[i], args.slice(1));
    }
    return this;
  }
};