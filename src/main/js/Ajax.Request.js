/*
 * Copyright (c) 2014-2016, Inversoft Inc., All Rights Reserved
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
 * The Prime.Ajax namespace. This namespace contains a single class (for now) called Request.
 *
 * @namespace Prime.Ajax
 */
Prime.Ajax = Prime.Ajax || {};

/**
 * Makes a new AJAX request.
 *
 * @constructor
 * @param {string} [url] The URL to call. This can be left out for sub-classing but should otherwise be provided.
 * @param {string} [method=GET] The HTTP method to use. You can specify GET, POST, PUT, DELETE, HEAD, SEARCH, etc.
 */
Prime.Ajax.Request = function(url, method) {
  Prime.Utils.bindAll(this);
  this.xhr = new XMLHttpRequest();
  this.async = true;
  this.body = null;
  this.queryParams = null;
  this.contentType = null;
  this.errorHandler = this.onError;
  this.headers = {};
  this.loadingHandler = this.onLoading;
  this.method = method || 'GET';
  this.openHandler = this.onOpen;
  this.password = null;
  this.sendHandler = this.onSend;
  this.successHandler = this.onSuccess;
  this.unsetHandler = this.onUnset;
  this.url = url;
  this.username = null;
};

Prime.Ajax.Request.prototype = {
  /**
   * Changes the URL to call.
   *
   * @param {string} url The new URL to call.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  forURL: function(url) {
    this.url = url;
    return this;
  },

  /**
   * Invokes the AJAX request. If the URL is not set, this throws an exception.
   *
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  go: function() {
    if (!this.url) {
      throw new TypeError('No URL set for AJAX request');
    }

    var requestUrl = this.url;
    if ((this.method === 'GET' || this.method === 'DELETE') && this.queryParams !== null) {
      if (requestUrl.indexOf('?') === -1) {
        requestUrl += '?' + this.queryParams;
      } else {
        requestUrl += '&' + this.queryParams;
      }
    }

    if (this.async) {
      this.xhr.onreadystatechange = this._handler.bind(this);
    }

    this.xhr.open(this.method, requestUrl, this.async, this.username, this.password);

    if (Object.keys(this.headers).length > 0) {
      for (var key in this.headers) {
        if (this.headers.hasOwnProperty(key)) {
          this.xhr.setRequestHeader(key, this.headers[key]);
        }
      }
    }

    if (this.contentType) {
      this.xhr.setRequestHeader('Content-Type', this.contentType);
    }

    this.xhr.send(this.body);

    return this;
  },

  /**
   * Default handler for the "completed" state and an HTTP response status of anything but 2xx. Sub-classes can override
   * this handler or you can pass in a handler function to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onError: function(xhr) {
  },

  /**
   * Default handler for the "loading" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withLoadingHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onLoading: function(xhr) {
  },

  /**
   * Default handler for the "open" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withOpenHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onOpen: function(xhr) {
  },

  /**
   * Default handler for the "send" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withSendHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onSend: function(xhr) {
  },

  /**
   * Default handler for the "complete" state and an HTTP response status of 2xx. Sub-classes can override this handler
   * or you can pass in a handler function to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onSuccess: function(xhr) {
  },

  /**
   * Default handler for the "unset" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onUnset: function(xhr) {
  },

  /**
   * Sets the async flag to false.
   *
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  synchronously: function() {
    this.async = false;
    return this;
  },

  /**
   * Sets the method used to make the AJAX request.
   *
   * @param {string} method The HTTP method.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  usingMethod: function(method) {
    this.method = method;
    return this;
  },

  /**
   * Sets the request body for the request.
   *
   * @param {string} body The request body.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withBody: function(body) {
    this.body = body;
    return this;
  },

  /**
   * Sets the content type for the request.
   *
   * @param {string} contentType The contentType.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withContentType: function(contentType) {
    this.contentType = contentType;
    return this;
  },

  /**
   * Sets the data object for the request. Will store the values for query parameters or post data depending on the
   * method that is set.  If the method is a post or put, will also set content-type to x-www-form-urlencoded.
   *
   * @param {Object} data The data object.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withData: function(data) {
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        if (this.method === 'PUT' || this.method === 'POST') {
          this.body = this._addDataValue(this.body, prop, data[prop]);
        } else {
          this.queryParams = this._addDataValue(this.queryParams, prop, data[prop]);
        }
      }
    }

    if (this.method === "PUT" || this.method === "POST") {
      this.contentType = 'application/x-www-form-urlencoded';
    }
    return this;
  },

  /**
   * Sets the data for the request using the form fields in the given form element. Will store the values for query
   * parameters or post data depending on the method that is set.  If the method is a post or put, will also set
   * content-type to x-www-form-urlencoded.
   *
   * @param {FormElement|Prime.Document.Element} form The form object.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withDataFromForm: function(form) {
    var domElement = form;
    if (form instanceof Prime.Document.Element) {
      domElement = form.domElement;
    }

    for (var i = 0; i < domElement.elements.length; i++) {
      var primeElement = new Prime.Document.Element(domElement.elements[i]);
      if (primeElement.isDisabled() || !primeElement.isInput()) {
        continue;
      }

      var type = primeElement.getAttribute('type');
      if (type !== null) {
        type = type.toLowerCase();
      }

      var values;
      if (primeElement.getTagName() === 'SELECT') {
        values = primeElement.getSelectedValues();
      } else if ((type === 'radio' || type === 'checkbox') && !primeElement.isChecked()) {
        continue;
      } else {
        values = primeElement.getValue();
      }

      var name = primeElement.domElement.name;
      if (this.method === 'PUT' || this.method === 'POST') {
        this.body = this._addDataValue(this.body, name, values)
      } else {
        this.queryParams = this._addDataValue(this.queryParams, name, values);
      }
    }

    if (this.method === "PUT" || this.method === "POST") {
      this.contentType = 'application/x-www-form-urlencoded';
    }

    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "complete" and the HTTP status in the response is
   * not 2xx.
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withErrorHandler: function(func) {
    this.errorHandler = func;
    return this;
  },

  /**
   * Sets the body of the AJAX request to the string value of the provided JSON object. The content-type of the request
   * will also be set to 'application/json'. The provided JSON object may be passed as a string or an object.
   *
   * @param {Object} json The JSON object.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withJSON: function(json) {
    this.body = typeof(json) === String ? json : JSON.stringify(json);
    this.contentType = 'application/json';
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "loading".
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withLoadingHandler: function(func) {
    this.loadingHandler = func;
    return this;
  },

  /**
   * Set the request headers using the key and value.
   *
   * @param {String} key The key name.
   * @param {String} value The value.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withHeader: function(key, value) {
    this.headers[key] = value;
    return this;
  },

  /**
   * Set the key value pairs provided as request headers.
   *
   * @param {Object} headers A map of key value pairs.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withHeaders: function(headers) {
    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        this.headers[key] = headers[key];
      }
    }
    return this;
  },

  /**
   * Sets the XMLHTTPRequest's response type field, which will control how the response is parsed.
   *
   * @param {string} responseType The response type.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withResponseType: function(responseType) {
    this.xhr.responseType = responseType;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "open".
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withOpenHandler: function(func) {
    this.openHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "send".
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withSendHandler: function(func) {
    this.sendHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "complete" and the HTTP status in the response is
   * 2xx.
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withSuccessHandler: function(func) {
    this.successHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "unset".
   *
   * @param {Function} func The handler function.
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withUnsetHandler: function(func) {
    this.unsetHandler = func;
    return this;
  },

  /**
   * Resets the Request back to a base state (basically just the URL + method).  This can be
   * useful if a component is going to make many requests to the same endpoint with different parameters.
   *
   * @returns {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  reset: function() {
    this.queryParams = null;
    this.data = null;
    this.body = null;
    this.contentType = null;
    return this;
  },

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

   /**
   * @private
   */
  _handler: function() {
    if (this.xhr.readyState === 0) {
      this.unsetHandler(this.xhr);
    } else if (this.xhr.readyState === 1) {
      this.openHandler(this.xhr);
    } else if (this.xhr.readyState === 2) {
      this.sendHandler(this.xhr);
    } else if (this.xhr.readyState === 3) {
      this.loadingHandler(this.xhr);
    } else if (this.xhr.readyState === 4) {
      if (this.xhr.status >= 200 && this.xhr.status <= 299) {
        this.successHandler(this.xhr);
      } else {
        this.errorHandler(this.xhr);
      }
    }
  },

  /**
   * Adds the given name-value pair to the given data String. If the value is an array, it adds multiple values for each
   * piece. Otherwise, it assumes value is a String or can be converted to a String.
   *
   * @param {string} dataString The data String used to determine if an ampersand is necessary.
   * @param {string} name The name of the name-value pair.
   * @param {string|Array} value The value of the name-value pair.
   * @returns {string} The new data string.
   * @private
   */
  _addDataValue: function(dataString, name, value) {
    var result = '';
    if (value instanceof Array) {
      for (var i = 0; i < value.length; i++) {
        result += encodeURIComponent(name) + '=' + encodeURIComponent(value[i]);
        if (i + 1 < value.length) {
          result += '&';
        }
      }
    } else {
      result = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    if (dataString !== null && result !== '') {
      result = dataString + '&' + result;
    } else if (dataString !== null && result === '') {
      result = dataString;
    }

    return result;
  }
};