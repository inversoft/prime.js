/*
 * Copyright (c) 2012-2018, Inversoft Inc., All Rights Reserved
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

import {PrimeElementList} from "./Document/PrimeElementList";
import {PrimeElement} from "./Document/PrimeElement";
import {Utils} from "./Utils";

const readyFunctions = [];
const tagRegexp = /^<(\w+)\s*\/?>.*(?:<\/\1>)?$/;

/**
 * The Body element as a PrimeElement object.
 *
 * @type {?PrimeElement}
 */
let bodyElement = null;

class PrimeDocument {

  static get Element() {
    return PrimeElement;
  }

  static get ElementList() {
    return PrimeElementList;
  }

  static get readyFunctions() {
    return readyFunctions;
  }

  static get tagRegexp() {
    return tagRegexp;
  }

  /**
   * @returns {?PrimeElement} the Prime body element
   */
  static get bodyElement() {
    if (bodyElement === null) {
      bodyElement = new PrimeElement(document.body);
    }
    return bodyElement;
  }

  /**
   * Set the body element
   * @param {?PrimeElement} body the Prime body element
   */
  static set bodyElement(body) {
    bodyElement = body;
  }

  /**
   * Attaches an event listener to the document body and will only invoke the listener when the event target matches
   * the provided selector.
   *
   * The intent of this function is to provide a delegated listener and handle events from nested elements.
   *
   * @param {string} event The name of the event
   * @param  {string} selector The selector to match against the Element
   * @param {Function} listener The event listener function
   */
  static addDelegatedEventListener(event, selector, listener) {
    PrimeDocument.bodyElement.addDelegatedEventListener(event, selector, listener);
  }

  /**
   * Attaches an event listener to the document, returning the handler proxy.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event listener function.
   * @returns {PrimeDocument} The PrimeDocument object so you can chain method calls together.
   */
  static addEventListener(event, listener) {
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

    return PrimeDocument;
  }

  /**
   * Returns the height of the document.
   *
   * @returns {number} The height of the document in pixels.
   */
  static getHeight() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  }

  /**
   * Returns the width of the document.
   *
   * @returns {number} The width of the document in pixels.
   */
  static getWidth() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
  }

  /**
   * Builds a new document using the given HTML document.
   *
   * @param {string} documentString The HTML string to build the document.
   * @returns {Document} A new document.
   */
  static newDocument(documentString) {
    return new DOMParser().parseFromString(documentString, "text/html");
  }

  /**
   * Builds a new element using the given HTML snippet (currently this only supports the tag).
   *
   * @param {string} elementString The element string.
   * @param {Object} [properties={}] The properties for the new element.
   * @returns {PrimeElement} A new PrimeElement.
   */
  static newElement(elementString, properties) {
    properties = Utils.isDefined(properties) ? properties : {};
    const result = PrimeDocument.tagRegexp.exec(elementString);
    if (result === null) {
      throw new TypeError('Invalid string to create a new element [' + elementString + ']. It should look like <a/>');
    }

    const element = new PrimeElement(document.createElement(result[1]));
    for (let key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key === 'id') {
          element.setId(properties[key]);
        } else {
          element.setAttribute(key, properties[key]);
        }
      }
    }

    return element;
  }

  /**
   * Adds the given callback function to the list of functions to invoke when the document is ready. If the document is
   * already fully loaded, this simply invokes the callback directly.
   *
   * @param {Function} callback The callback function.
   */
  static onReady(callback) {
    if (document.readyState === 'complete') {
      callback();
    } else {
      // If this is the first call, register the event listener on the document
      if (this.readyFunctions.length === 0) {
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', PrimeDocument._callReadyListeners, false);
        } else if (document.attachEvent) {
          document.attachEvent('onreadystatechange', PrimeDocument._callReadyListeners);
        } else {
          throw new TypeError('No way to attach an event to the document. What browser are you running?');
        }
      }

      // Add the callback
      PrimeDocument.readyFunctions.push(callback);
    }
  }

  /**
   * Take the HTML string and append it to the body.
   *
   * @param {string} html The HTML to append
   */
  static appendHTML(html) {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Moves the given element by appending it to the element provided by the second argument.
   *
   * @param {Element|PrimeElement} element The element to move.
   * @param {Element|PrimeElement} appendToElement [appendToElement=body] The element to append to, defaults to the body if not provided.
   * @returns {PrimeElement} The element that has been moved.
   */
  static move(element, appendToElement) {
    element = (element instanceof PrimeElement) ? element : new PrimeElement(element);

    if (!Utils.isDefined(appendToElement)) {
      appendToElement = new PrimeElement(document.body);
    } else {
      appendToElement = (appendToElement instanceof PrimeElement) ? appendToElement : new PrimeElement(appendToElement);
    }

    appendToElement.appendHTML(element.getOuterHTML());
    element.removeFromDOM();
    return appendToElement.getLastChild();
  }

  /**
   * Queries the DOM using the given selector starting at the given element and returns all the matched elements.
   *
   * @param {string} selector The selector.
   * @param {Element|Document|PrimeElement} [element=document] The starting point for the search (defaults to document if not provided).
   * @returns {PrimeElementList} An element list.
   */
  static query(selector, element) {
    let domElement = null;
    if (!Utils.isDefined(element)) {
      domElement = document;
    } else {
      domElement = (element instanceof PrimeElement) ? element.domElement : element;
    }

    const elements = domElement.querySelectorAll(selector);
    return new PrimeElementList(elements);
  }

  /**
   * Queries the DOM for an element that has the given ID.
   *
   * @param {string} id The ID.
   * @returns {PrimeElement} The element or null.
   */
  static queryById(id) {
    let element = document.getElementById(id);
    if (!element) {
      return null;
    }

    return new PrimeElement(element);
  }

  /**
   * Queries the DOM using the given selector starting at the given element and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @param {Element|Document|PrimeElement} [element=document] The starting point for the search (defaults to document if not provided).
   * @returns {PrimeElement} An element or null.
   */
  static queryFirst(selector, element) {
    let domElement = null;
    if (!Utils.isDefined(element)) {
      domElement = document;
    } else {
      domElement = (element instanceof PrimeElement) ? element.domElement : element;
    }

    domElement = domElement.querySelector(selector);
    if (domElement === null) {
      return null;
    }

    return new PrimeElement(domElement);
  }

  /**
   * Queries the DOM using the given selector starting at the given element and returns the last matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @param {Element|Document|PrimeElement} [element=document] The starting point for the search (defaults to document if not provided).
   * @returns {PrimeElement} An element or null.
   */
  static queryLast(selector, element) {
    let domElement = null;
    if (!Utils.isDefined(element)) {
      domElement = document;
    } else {
      domElement = (element instanceof PrimeElement) ? element.domElement : element;
    }

    const domElements = domElement.querySelectorAll(selector);
    if (domElements.length === 0) {
      return null;
    }

    return new PrimeElement(domElements[domElements.length - 1]);
  }

  /**
   * Traverses up the DOM from the starting element and looks for a match to the selector.
   *
   * @param {string} selector The selector.
   * @param {PrimeElement|Element} element The starting point for the upward traversal.
   * @returns {PrimeElement} An element or null.
   */
  static queryUp(selector, element) {
    let domElement = null;
    if (!Utils.isDefined(element)) {
      throw new SyntaxError('Missing required parameter. The element is required.');
    } else {
      domElement = (element instanceof PrimeElement) ? element.domElement : element;
    }

    domElement = domElement.parentNode;
    while (domElement !== null && !domElement.matches(selector)) {
      domElement = domElement.parentNode;
      if (domElement === document) {
        domElement = null;
      }
    }

    if (domElement !== null) {
      return new PrimeElement(domElement);
    }

    return null;
  }

  /**
   * Removes an event handler for a specific event from the document that you attached using addEventListener
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The listener function.
   */
  static removeEventListener(event, listener) {
    if (document.removeEventListener) {
      document.removeEventListener(event, listener, false);
    } else if (document.detachEvent) {
      document.detachEvent('on' + event, listener);
    } else {
      throw new TypeError('Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available');
    }
  }

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Calls all the registered document ready listeners.
   *
   * @private
   */
  static _callReadyListeners() {
    if (document.addEventListener || document.readyState === 'complete') {
      let readyFunction;
      while (readyFunction = PrimeDocument.readyFunctions.shift()) {
        readyFunction();
      }
    }

    if (document.removeEventListener) {
      document.removeEventListener('DOMContentLoaded', PrimeDocument._callReadyListeners, false);
    } else {
      document.detachEvent('onreadystatechange', PrimeDocument._callReadyListeners);
    }
  }
}

/* ===================================================================================================================
 * Polyfill
 * ===================================================================================================================*/

/* https://developer.mozilla.org/en-US/docs/Web/API/DOMParser */
(function(DOMParser) {
  const proto = DOMParser.prototype;
  const nativeParse = proto.parseFromString;

  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if ((new DOMParser()).parseFromString('', 'text/html')) {
      // text/html parsing is natively supported
      return;
    }
  } catch (ex) {
  }

  proto.parseFromString = function(markup, type) {
    if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
      const doc = document.implementation.createHTMLDocument('');
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

export {PrimeDocument};
