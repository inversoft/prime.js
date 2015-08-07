/*
 * Copyright (c) 2012-2015, Inversoft Inc., All Rights Reserved
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
 * The Prime.Document namespace. This namespace contains a number of classes (Element, ElementList, etc.) and a number of
 * namespace level functions.
 *
 * @namespace Prime.Document
 */
Prime.Document = Prime.Document || {};

Prime.Document.readyFunctions = [];
Prime.Document.tagRegexp = /^<(\w+)\s*\/?>.*(?:<\/\1>)?$/;

/**
 * Attaches an event listener to the document, returning the handler proxy.
 *
 * @param {string} event The name of the event.
 * @param {Function} handler The event handler.
 * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the
 *        function call). Defaults to this Element.
 * @returns {Function} The proxy handler.
 */
Prime.Document.addEventListener = function(event, handler, context) {
  var theContext = (arguments.length < 3) ? this : context;
  handler.primeProxy = Prime.Utils.proxy(handler, theContext);

  if (document.addEventListener) {
    document.addEventListener(event, handler.primeProxy, false);
  } else if (document.attachEvent) {
    document.attachEvent('on' + event, handler.primeProxy);
  } else {
    throw new TypeError('Unable to set event onto the element. Neither addEventListener nor attachEvent methods are available');
  }

  return handler.primeProxy;
};

/**
 * Returns the height of the document.
 *
 * @returns {number} The height of the document in pixels.
 */
Prime.Document.getHeight = function() {
  var body = document.body;
  var html = document.documentElement;

  return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
};

/**
 * Returns the height of the document.
 *
 * @returns {number} The height of the document in pixels.
 */
Prime.Document.getWidth = function() {
  var body = document.body;
  var html = document.documentElement;

  return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
};

/**
 * Builds a new element using the given HTML snippet (currently this only supports the tag).
 *
 * @param {string} elementString The element string.
 * @param {Object} [properties={}] The properties for the new element.
 * @returns {Prime.Document.Element} A new Prime.Document.Element.
 */
Prime.Document.newElement = function(elementString, properties) {
  properties = typeof properties !== 'undefined' ? properties : {};
  var result = Prime.Document.tagRegexp.exec(elementString);
  if (result === null) {
    throw new TypeError('Invalid string to create a new element [' + elementString + ']. It should look like <a/>');
  }

  var element = new Prime.Document.Element(document.createElement(result[1]));
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
Prime.Document.onReady = function(callback, context) {
  var theContext = (arguments.length < 2) ? this : context;
  if (document.readyState === 'complete') {
    callback.call(context);
  } else {
    // If this is the first call, register the event listener on the document
    if (this.readyFunctions.length === 0) {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', Prime.Document._callReadyListeners, false);
      } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', Prime.Document._callReadyListeners);
      } else {
        throw new TypeError('No way to attach an event to the document. What browser are you running?');
      }
    }

    // Add the callback
    this.readyFunctions.push(Prime.Utils.proxy(callback, theContext));
  }
};

/**
 * Take the HTML string and append it to the body.
 *
 * @param {string} html The HTML to append
 */
Prime.Document.appendHTML = function(html) {
  var domElement = document.body;
  var div = document.createElement('div');
  div.innerHTML = html;

  while (div.children.length > 0) {
    domElement.appendChild(div.children[0]);
  }
};

/**
 * Queries the DOM using the given selector starting at the given element and returns all the matched elements.
 *
 * @param {string} selector The selector.
 * @param {Element|Document|Prime.Document.Element} [element=document] The starting point for the search (defaults to document if not provided).
 * @returns {Prime.Document.ElementList} An element list.
 */
Prime.Document.query = function(selector, element) {
  var domElement = null;
  if (typeof element === 'undefined' || element === null) {
    domElement = document;
  } else {
    domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
  }

  var elements = domElement.querySelectorAll(selector);
  return new Prime.Document.ElementList(elements);
};

/**
 * Queries the DOM for an element that has the given ID.
 *
 * @param {string} id The ID.
 * @returns {Prime.Document.Element} The element or null.
 */
Prime.Document.queryByID = function(id) {
  var element = document.getElementById(id);
  if (!element) {
    return null;
  }

  return new Prime.Document.Element(element);
};

/**
 * Queries the DOM using the given selector starting at the given element and returns the first matched element
 * or null if there aren't any matches.
 *
 * @param {string} selector The selector.
 * @param {Element|Document|Prime.Document.Element} [element=document] The starting point for the search (defaults to document if not provided).
 * @returns {Prime.Document.Element} An element or null.
 */
Prime.Document.queryFirst = function(selector, element) {
  var domElement = null;
  if (typeof element === 'undefined' || element === null) {
    domElement = document;
  } else {
    domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
  }

  domElement = domElement.querySelector(selector);
  if (domElement === null) {
    return null;
  }

  return new Prime.Document.Element(domElement);
};

/**
 * Queries the DOM using the given selector starting at the given element and returns the last matched element
 * or null if there aren't any matches.
 *
 * @param {string} selector The selector.
 * @param {Element|Document|Prime.Document.Element} [element=document] The starting point for the search (defaults to document if not provided).
 * @returns {Prime.Document.Element} An element or null.
 */
Prime.Document.queryLast = function(selector, element) {
  var domElement = null;
  if (typeof element === 'undefined' || element === null) {
    domElement = document;
  } else {
    domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
  }

  var domElements = domElement.querySelectorAll(selector);
  if (domElements.length === 0) {
    return null;
  }

  return new Prime.Document.Element(domElements[domElements.length - 1]);
};

/**
 * Traverses up the DOM from the starting element and looks for a match to the selector.
 *
 * @param {string} selector The selector.
 * @param {Prime.Document.Element|Element} element The starting point for the upward traversal.
 * @returns {Prime.Document.Element} An element or null.
 */
Prime.Document.queryUp = function(selector, element) {
  var domElement = null;
  if (typeof element === 'undefined' || element === null) {
    domElement = document;
  } else {
    domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
  }

  domElement = domElement.parentNode;
  while (domElement !== null && !domElement.matches(selector)) {
    domElement = domElement.parentNode;
  }

  if (domElement !== null) {
    return new Prime.Document.Element(domElement);
  }

  return null;
};

/**
 * Removes an event handler for a specific event from the document that you attached using addEventListener
 *
 * @param {string} event The name of the event.
 * @param {Object} handler The handler.
 */
Prime.Document.removeEventListener = function(event, handler) {
  var proxy = handler.primeProxy ? handler.primeProxy : handler;
  if (document.removeEventListener) {
    document.removeEventListener(event, proxy, false);
  } else if (document.detachEvent) {
    document.detachEvent('on' + event, proxy);
  } else {
    throw new TypeError('Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available');
  }
};

/* ===================================================================================================================
 * Private Methods
 * ===================================================================================================================*/

/**
 * Calls all the registered document ready listeners.
 *
 * @private
 */
Prime.Document._callReadyListeners = function() {
  if (document.addEventListener || document.readyState === 'complete') {
    var readyFunction;
    while (readyFunction = Prime.Document.readyFunctions.shift()) {
      readyFunction();
    }
  }

  if (document.removeEventListener) {
    document.removeEventListener('DOMContentLoaded', Prime.Document._callReadyListeners, false);
  } else {
    document.detachEvent('onreadystatechange', Prime.Document._callReadyListeners);
  }
};