/*
 * Copyright (c) 2013, Inversoft Inc., All Rights Reserved
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
Prime.Dom = Prime.Dom || {};


/**
 * Constructs an ElementList object using the given array of DOMElements or Prime.Dom.Elements.
 *
 * @constructor
 * @param {Array} elements The array of DOMElement or Prime.Dom.Element objects.
 */
Prime.Dom.ElementList = function(elements) {
  this.length = elements.length;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] instanceof Prime.Dom.Element) {
      this[i] = elements[i];
    } else {
      this[i] = new Prime.Dom.Element(elements[i]);
    }
  }
};

Prime.Dom.ElementList.prototype = {
  /**
   * Iterates over each of the Prime.Dom.Element objects in this ElementList and calls the given function for each one.
   * The 'this' variable inside the function will be the current Prime.Dom.Element unless a context value is provided
   * when calling this function.
   *
   * The function can optionally take two parameters. The first parameter is the current element. The second parameter
   * is the current index.
   *
   * @param {Function} iterationFunction The function to call.
   * @param {Object} [context=the-current-element] The context for the function call (sets the this variable).
   * @return {Prime.Dom.ElementList} This ElementList.
   */
  each: function(iterationFunction, context) {
    for (var i = 0; i < this.length; i++) {
      var theContext = (arguments.length < 2) ? this[i] : context;
      iterationFunction.call(theContext, this[i], i);
    }

    return this;
  },

  /**
   * Returns the indexOf the element that matches the parameter, either Prime Element or DOMElement.
   *
   * @param {Prime.Dom.Element|Element} element The element to look for
   * @return {number} The position of the element in the list, or -1 if not present.
   */
  indexOf: function(element) {
    var domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;

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
   * @return {Prime.Dom.ElementList} This ElementList.
   */
  removeAllFromDOM: function() {
    for (var i = 0; i < this.length; i++) {
      this[i].removeFromDOM();
    }

    return this;
  }
};
