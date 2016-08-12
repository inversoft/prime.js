/*
 * Copyright (c) 2012-2016, Inversoft Inc., All Rights Reserved
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
 * @param {Function} listener The event listener function.
 * @returns {Prime.Document} The Prime.Document object so you can chain method calls together.
 */
Prime.Document.addEventListener = function(event, listener) {
  if (event.indexOf(':') === -1) {
    // Traditional event
    document.eventListeners = document.eventListeners || {};
    document.eventListeners[event] = document.eventListeners[event] || [];
    document.eventListeners[event].push(listener);
    document.addEventListener(event, listener, false);
  } else {
    // Custom event
    document.customEventListeners = document.customEventListeners || {};
    document.customEventListeners[event] = document.customEventListeners[event] || [];
    document.customEventListeners[event].push(listener);
  }

  return Prime.Document;
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
 * Returns the width of the document.
 *
 * @returns {number} The width of the document in pixels.
 */
Prime.Document.getWidth = function() {
  var body = document.body;
  var html = document.documentElement;

  return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
};

/**
 * Builds a new document using the given HTML document.
 *
 * @param {string} documentString The HTML string to build the document.
 * @returns {Document} A new document.
 */
Prime.Document.newDocument = function(documentString) {
  return new DOMParser().parseFromString(documentString, "text/html");
};

/**
 * Builds a new element using the given HTML snippet (currently this only supports the tag).
 *
 * @param {string} elementString The element string.
 * @param {Object} [properties={}] The properties for the new element.
 * @returns {Prime.Document.Element} A new Prime.Document.Element.
 */
Prime.Document.newElement = function(elementString, properties) {
  properties = Prime.Utils.isDefined(properties) ? properties : {};
  var result = Prime.Document.tagRegexp.exec(elementString);
  if (result === null) {
    throw new TypeError('Invalid string to create a new element [' + elementString + ']. It should look like <a/>');
  }

  var element = new Prime.Document.Element(document.createElement(result[1]));
  for (var key in properties) {
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
 */
Prime.Document.onReady = function(callback) {
  if (document.readyState === 'complete') {
    callback();
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
    this.readyFunctions.push(callback);
  }
};

/**
 * Take the HTML string and append it to the body.
 *
 * @param {string} html The HTML to append
 */
Prime.Document.appendHTML = function(html) {
  document.body.insertAdjacentHTML('beforeend', html);
};

/**
 * Moves the given element by appending it to the element provided by the second argument.
 *
 * @param {Element|Prime.Document.Element} element The element to move.
 * @param {Element|Prime.Document.Element} appendToElement [appendToElement=body] The element to append to, defaults to the body if not provided.
 * @returns {Prime.Document.Element} The element that has been moved.
 */
Prime.Document.move = function(element, appendToElement) {
  element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element);

  if (!Prime.Utils.isDefined(appendToElement)) {
    appendToElement = new Prime.Document.Element(document.body);
  } else {
    appendToElement = (appendToElement instanceof Prime.Document.Element) ? appendToElement : new Prime.Document.Element(appendToElement);
  }

  appendToElement.appendHTML(element.getOuterHTML());
  element.removeFromDOM();
  return appendToElement.getLastChild();
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
  if (!Prime.Utils.isDefined(element)) {
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
Prime.Document.queryById = function(id) {
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
  if (!Prime.Utils.isDefined(element)) {
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
  if (!Prime.Utils.isDefined(element)) {
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
  if (!Prime.Utils.isDefined(element)) {
    throw new SyntaxError('Missing required parameter. The element is required.');
  } else {
    domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
  }

  domElement = domElement.parentNode;
  while (domElement !== null && !domElement.matches(selector)) {
    domElement = domElement.parentNode;
    if (domElement === document) {
      domElement = null;
    }
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
 * @param {Function} listener The listener function.
 */
Prime.Document.removeEventListener = function(event, listener) {
  if (document.removeEventListener) {
    document.removeEventListener(event, listener, false);
  } else if (document.detachEvent) {
    document.detachEvent('on' + event, listener);
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

/* ===================================================================================================================
 * Polyfill
 * ===================================================================================================================*/

/* https://developer.mozilla.org/en-US/docs/Web/API/DOMParser */
(function(DOMParser) {
  'use strict';

  var proto = DOMParser.prototype;
  var nativeParse = proto.parseFromString;

  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if ((new DOMParser()).parseFromString('', 'text/html')) {
      // text/html parsing is natively supported
      return;
    }
  } catch (ex) {}

  proto.parseFromString = function(markup, type) {
    if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
      var doc = document.implementation.createHTMLDocument('');
      if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        doc.documentElement.innerHTML = markup;
      } else {
        doc.body.innerHTML = markup;
      }
      return doc;
    } else {
      return nativeParse.apply(this, arguments);
    }
  };
}(DOMParser));