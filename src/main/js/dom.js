/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
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

Prime.Dom.readyFunctions = [];
Prime.Dom.tagRegexp = /^<(\w+)\s*\/?>.*(?:<\/\1>)?$/;

/**
 * Builds a new element using the given HTML snippet (currently this only supports the tag).
 *
 * @param {string} elementString The element string.
 * @param {Object} [properties={}] The properties for the new element.
 * @return {Prime.Dom.Element} A new Prime.DOM.Element.
 */
Prime.Dom.newElement = function(elementString, properties) {
  properties = typeof properties !== 'undefined' ? properties : {};
  var result = Prime.Dom.tagRegexp.exec(elementString);
  if (result === null) {
    throw new TypeError('Invalid string to create a new element [' + elementString + ']. It should look like <a/>');
  }

  var element = new Prime.Dom.Element(document.createElement(result[1]));
  for (key in properties) {
    if (properties.hasOwnProperty(key)) {
      if (key === 'id') {
        element.setID(properties[key]);
      } else {
        element.setAttribute(key, properties[key]);
      }
    }
  }

  return element;
};

/**
 * Adds the given callback function to the list of functions to invoke when the document is ready. If the document is
 * already fully loaded, this simply invokes the callback directly.
 *
 * @param {Function} callback The callback function.
 * @param {Object} [context] The context for the function call (sets the this variable).
 */
Prime.Dom.onDocumentReady = function(callback, context) {
  var theContext = (arguments.length < 2) ? this : context;
  if (document.readyState === 'complete') {
    callback.call(context);
  } else {
    // If this is the first call, register the event listener on the document
    if (this.readyFunctions.length === 0) {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', Prime.Dom.callReadyListeners, false);
      } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', Prime.Dom.callReadyListeners);
      } else {
        throw new TypeError('No way to attach an event to the document. What browser are you running?');
      }
    }

    // Add the callback
    this.readyFunctions.push(Prime.Utils.proxy(callback, theContext));
  }
};

/**
 * Queries the DOM using the given Sizzle selector starting at the given element and returns all the matched elements.
 *
 * @param {string} selector The selector.
 * @param {Element|Document} [element=document] The starting point for the search (defaults to document if not provided).
 * @return {Prime.Dom.ElementList} An element list.
 */
Prime.Dom.query = function(selector, element) {
  var domElement = null;
  if (element !== null) {
    domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
  }

  return new Prime.Dom.ElementList(Sizzle(selector, domElement));
};

/**
 * Queries the DOM for an element that has the given ID.
 *
 * @param {string} id The ID.
 * @return {Prime.Dom.Element} The element or null.
 */
Prime.Dom.queryByID = function(id) {
  var element = document.getElementById(id);
  if (!element) {
    return null;
  }

  return new Prime.Dom.Element(element);
};

/**
 * Queries the DOM using the given Sizzle selector starting at the given element and returns the first matched element
 * or null if there aren't any matches.
 *
 * @param {string} selector The selector.
 * @param {Element|Document|Prime.Dom.Element} [element=document] The starting point for the search (defaults to document if not provided).
 * @return {Prime.Dom.Element} An element or null.
 */
Prime.Dom.queryFirst = function(selector, element) {
  var domElement = null;
  if (element !== null) {
    domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
  }

  var domElements = Sizzle(selector, domElement);
  if (domElements.length === 0) {
    return null;
  }

  return new Prime.Dom.Element(domElements[0]);
};

/**
 * Traverses up the DOM from the starting element and looks for a Sizzle match to the selector.  Only supports single
 * element selectors right now, ie 'div.even' or '#id', etc, will throw an exception if the selector has a space in it.
 *
 * @param {string} selector The selector.
 * @param {Prime.Dom.Element|Element} element The starting point for the upward traversal.
 * @return {Prime.Dom.Element} An element or null.
 */
Prime.Dom.queryUp = function(selector, element) {
  if (selector.match(Prime.Utils.spaceRegex)) {
    throw new TypeError('Ancestor selector must not contain a space');
  }

  var domElement = null;
  if (element !== null) {
    domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
  }

  domElement = domElement.parentNode;
  while (domElement !== null && !Sizzle.matchesSelector(domElement, selector)) {
    domElement = domElement.parentNode;
  }

  if (domElement !== null) {
    return new Prime.Dom.Element(domElement);
  }

  return null;
};

/*
 * Private methods
 */

/**
 * Calls all the registered document ready listeners.
 *
 * @private
 */
Prime.Dom.callReadyListeners = function() {
  if (document.addEventListener || document.readyState === 'complete') {
    var readyFunction;
    while (readyFunction = Prime.Dom.readyFunctions.shift()) {
      readyFunction();
    }
  }

  if (document.removeEventListener) {
    document.removeEventListener('DOMContentLoaded', Prime.Dom.callReadyListeners, false);
  } else {
    document.detachEvent('onreadystatechange', Prime.Dom.callReadyListeners);
  }
};