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
 * The Prime.Dom.Document namespace. This namespace contains a number of namespace level functions and no classes.
 *
 * @namespace Prime.Dom.Document
 */
Prime.Dom.Document = {
  /**
   * Attaches an event listener to the document, returning the handler proxy.
   *
   * @param {string} event The name of the event.
   * @param {Function} handler The event handler.
   * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Element.
   * @return {Function} The proxy handler.
   */
  addEventListener: function(event, handler, context) {
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
  },

  /**
   * Returns the height of the document.
   *
   * @returns {number} The height of the document in pixels.
   */
  getHeight: function() {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  },

  /**
   * Returns the height of the document.
   *
   * @returns {number} The height of the document in pixels.
   */
  getWidth: function() {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
  },

  /**
   * Removes an event handler for a specific event from the document that you attached using addEventListener
   *
   * @param {string} event The name of the event.
   * @param {Object} handler The handler.
   */
  removeEventListener: function(event, handler) {
    var proxy = handler.primeProxy ? handler.primeProxy : handler;
    if (document.removeEventListener) {
      document.removeEventListener(event, proxy, false);
    } else if (document.detachEvent) {
      document.detachEvent('on' + event, proxy);
    } else {
      throw new TypeError('Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available');
    }
  }
};
