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
Prime.Ajax = Prime.Ajax || {};

/**
 * Makes a new AJAX request.
 *
 * @param {String} [url] The URL to call. This can be left out for sub-classing but should otherwise be provided.
 * @param {String} [method] The HTTP method to use. You can specify GET, POST, PUT, DELETE, HEAD, SEARCH, etc. This
 * defaults to GET.
 * @constructor
 */
Prime.Ajax.Request = function(url, method) {
  this.xhr = new XMLHttpRequest();
  this.async = true;
  this.body = null;
  this.queryParams = null;
  this.contentType = null;
  this.context = this;
  this.errorHandler = this.onError;
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
   * @param {String} url The new URL to call.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  forURL: function(url) {
    this.url = url;
    return this;
  },

  /**
   * Invokes the AJAX request. If the URL is not set, this throws an exception.
   *
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  go: function() {
    if (!this.url) {
      throw 'No URL set for AJAX request';
    }

    var requestUrl = this.url;
    if ((this.method == 'GET' || this.method == 'DELETE') && this.queryParams != null) {
      if (requestUrl.indexOf('?') == -1) {
        requestUrl += '?' + this.queryParams;
      } else {
        requestUrl += '&' + this.queryParams;
      }
    }

    if (this.async) {
      this.xhr.onreadystatechange = Prime.Utils.proxy(this.handler, this);
    }

    this.xhr.open(this.method, requestUrl, this.async, this.username, this.password);

    if (this.contentType) {
      this.xhr.setRequestHeader('Content-Type', this.contentType);
    }

    if (this.body) {
      this.xhr.setRequestHeader('Content-Length', this.body.length);
    }

//    this.xhr.setRequestHeader('Connection', 'close');
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
   * Sets the method used to make the AJAX request.
   *
   * @param {String} method The HTTP method.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  usingMethod: function(method) {
    this.method = method;
    return this;
  },

  /**
   * Sets the request body for the request.
   *
   * @param {String} body The request body.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withBody: function(body) {
    this.body = body;
    return this;
  },

  /**
   * Sets the content type for the request.
   *
   * @param {String} contentType The contentType.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withContentType: function(contentType) {
    this.contentType = contentType;
    return this;
  },

  /**
   * Sets the context for the AJAX handler functions. The object set here will be the "this" reference inside the handler
   * functions.
   *
   * @param {Object} context The context object.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withContext: function(context) {
    this.context = context;
    return this;
  },

  /**
   * Sets the data object for the request. Will store the values for query parameters or post data depending on the
   * method that is set.  If the method is a post or put, will also set content-type to x-www-form-urlencoded.
   *
   * @param {Object} data The data object.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withData: function(data) {
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        if (this.method == 'PUT' || this.method == 'POST') {
          if (this.body) {
            this.body += '&' + encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
          } else {
            this.body = encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
          }
        } else {
          if (this.queryParams == null) {
            this.queryParams = encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
          } else {
            this.queryParams += '&' + encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
          }
        }
      }
    }

    if (this.method == "PUT" || this.method == "POST") {
      this.contentType = 'application/x-www-form-urlencoded';
    }
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "complete" and the HTTP status in the response is
   * not 2xx.
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withErrorHandler: function(func) {
    this.errorHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "loading".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withLoadingHandler: function(func) {
    this.loadingHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "open".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withOpenHandler: function(func) {
    this.openHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "send".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
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
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withSuccessHandler: function(func) {
    this.successHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "unset".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withUnsetHandler: function(func) {
    this.unsetHandler = func;
    return this;
  },

  /**
   * Resets the Request back to a base state (basically just the URL + method).  This can be
   * useful if a component is going to make many requests to the same endpoint with different parameters.
   *
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  reset: function() {
    this.queryParams = null;
    this.data = null;
    this.body = null;
    this.contentType = null;
    return this;
  },

  /**
   * @private
   */
  handler: function() {
    if (this.xhr.readyState === 0) {
      this.unsetHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 1) {
      this.openHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 2) {
      this.sendHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 3) {
      this.loadingHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 4) {
      if (this.xhr.status >= 200 && this.xhr.status <= 299) {
        this.successHandler.call(this.context, this.xhr);
      } else {
        this.errorHandler.call(this.context, this.xhr);
      }
    }
  }
};/*
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
Prime.Browser = Prime.Browser || {};

Prime.Browser = {
  /**
   * Detects the browser name and version.
   */
  detect: function() {
    this.name = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
    this.os = this.searchString(this.dataOS) || "an unknown OS";
  },


  /*
   * Private functions.
   */

  /**
   * @private
   * @param {Object} data The data array.
   * @return {String} The browser identity String.
   */
  searchString: function(data) {
    for (var i = 0; i < data.length; i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString && dataString.indexOf(data[i].subString) != -1) {
        return data[i].identity;
      } else if (dataProp) {
        return data[i].identity;
      }
    }

    return null;
  },

  /**
   * @private
   * @param {String} dataString The browser data string.
   * @return {Number} The version or null.
   */
  searchVersion: function(dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) {
      return null;
    }

    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
  },

  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {
      string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {    // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {     // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS: [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
      string: navigator.userAgent,
      subString: "iPhone",
      identity: "iPhone/iPod"
    },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]
};
Prime.Browser.detect();

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

/**
 * The DOM namespace.
 *
 * @type {Object}
 */
Prime.Dom = {
  readyFunctions: [],
  tagRegexp: /^<(\w+)\s*\/?>.*(?:<\/\1>)?$/,

  /**
   * Builds a new element using the given HTML snippet (currently this only supports the tag).
   *
   * @param {String} elementString The element string.
   * @return {Prime.Dom.Element} A new Prime.DOM.Element.
   */
  newElement: function (elementString, properties) {
    properties = typeof properties !== 'undefined' ? properties : {};
    var result = Prime.Dom.tagRegexp.exec(elementString);
    if (result == null) {
      throw 'Invalid element string [' + elementString + ']';
    }

    var element = new Prime.Dom.Element(document.createElement(result[1]));
    for (key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'id') {
          element.setID(properties[key]);
        } else {
          element.setAttribute(key, properties[key]);
        }
      }
    }

//    if (typeof element.id === 'undefined' || element.id == null || element.id == '') {
//      this.setID("id", "anonymous_element_" + Prime.Dom.Element.anonymousId++);
//    }

    return element;
  },

  /**
   * Adds the given callback function to the list of functions to invoke when the document is ready. If the document is
   * already fully loaded, this simply invokes the callback directly.
   *
   * @param {Function} callback The callback function.
   * @param {Object} [context] The context for the function call (sets the this variable).
   */
  onDocumentReady: function (callback, context) {
    var theContext = (arguments.length < 2) ? this : context;
    if (document.readyState === 'complete') {
      callback.call(context);
    } else {
      // If this is the first call, register the event listener on the document
      if (this.readyFunctions.length == 0) {
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', Prime.Dom.callReadyListeners, false);
        } else if (document.attachEvent) {
          document.attachEvent('onreadystatechange', Prime.Dom.callReadyListeners);
        } else {
          throw 'No way to attach an event to the document. What browser are you running?';
        }
      }

      // Add the callback
      this.readyFunctions.push(Prime.Utils.proxy(callback, theContext));
    }
  },

  /**
   * Queries the DOM using the given Sizzle selector starting at the given element and returns all the matched elements.
   *
   * @param {String} selector The selector.
   * @param {Element|Document} [element] The starting point for the search (defaults to document if not provided).
   * @return {Prime.Dom.ElementList} An element list.
   */
  query: function (selector, element) {
    var domElement = null;
    if (element != null) {
      domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    }

    return new Prime.Dom.ElementList(Sizzle(selector, domElement));
  },

  /**
   * Queries the DOM for an element that has the given ID.
   *
   * @param {String} id The ID.
   * @return {Prime.Dom.Element} The element or null.
   */
  queryByID: function (id) {
    var element = document.getElementById(id);
    if (!element) {
      return null;
    }

    return new Prime.Dom.Element(element);
  },

  /**
   * Queries the DOM using the given Sizzle selector starting at the given element and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {String} selector The selector.
   * @param {Element|Document|Prime.Dom.Element} [element] The starting point for the search (defaults to document if not provided).
   * @return {Prime.Dom.Element} An element or null.
   */
  queryFirst: function (selector, element) {
    var domElement = null;
    if (element != null) {
      domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    }

    var domElements = Sizzle(selector, domElement);
    if (domElements.length === 0) {
      return null;
    }

    return new Prime.Dom.Element(domElements[0]);
  },

  /**
   * Traverses up the DOM from the starting element and looks for a Sizzle match to the selector.  Only supports single
   * element selectors right now, ie 'div.even' or '#id', etc, will throw an exception if the selector has a space in it.
   *
   * @param {String} selector The selector.
   * @param {Prime.Dom.Element | Element} element The starting point for the upward traversal.
   * @return {Prime.Dom.Element} An element or null.
   */
  queryUp: function (selector, element) {
    if (selector.match(Prime.Utils.spaceRegex)) {
      throw "ancestor selector must not contain a space";
    }

    var domElement = null;
    if (element != null) {
      domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    }

    domElement = domElement.parentNode;
    while (domElement != null && !Sizzle.matchesSelector(domElement, selector)) {
      domElement = domElement.parentNode;
    }
    if (domElement != null) {
      return new Prime.Dom.Element(domElement);
    }
    return null;
  },

  /*
   * Private methods
   */

  /**
   * Calls all the registered document ready listeners.
   *
   * @private
   */
  callReadyListeners: function () {
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
  }
};


/**
 * Constructs an ElementList object using the given array of DOMElements or Prime.Dom.Elements.
 *
 * @param {Array} elements The array of DOMElement or Prime.Dom.Element objects.
 * @constructor
 */
Prime.Dom.ElementList = function (elements) {
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
   * The 'this' variable inside the function will be the current Prime.Dom.Element. The function can optionally take a
   * single parameter that is the current index.
   *
   * @param {Function} iterationFunction The function to call.
   * @param {Object} [context] The context for the function call (sets the this variable).
   * @return {Prime.Dom.ElementList} This ElementList.
   */
  each: function (iterationFunction, context) {
    for (var i = 0; i < this.length; i++) {
      var theContext = (arguments.length < 2) ? this[i] : context;
      iterationFunction.call(theContext, this[i], i);
    }

    return this;
  },

  /**
   * Removes all the matched elements in the ElementList from the DOM.
   *
   * @return {Prime.Dom.ElementList} This ElementList.
   */
  removeAllFromDOM: function () {
    for (var i = 0; i < this.length; i++) {
      this[i].removeFromDOM();
    }

    return this;
  },

  /**
   * Returns the indexOf the element that matches the parameter, either Prime Element or DOMElement.
   *
   * @param {Prime.Dom.Element|DOMElement} element The element to look for
   * @return {Integer} The position of the element in the list, or -1 if not present.
   */
  indexOf: function (element) {
    var domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;

    for (var i = 0; i < this.length; i++) {
      if (this[i].domElement == domElement) {
        return i;
      }
    }

    return -1;
  }
};


/**
 * Creates an Element class for the given DOM element.
 *
 * @param {Element} element The element
 * @constructor
 */
Prime.Dom.Element = function (element) {
  if (typeof element.nodeType === 'undefined' || element.nodeType !== 1) {
    throw 'You can only pass in DOM element Node objects to the Prime.Dom.Element constructor';
  }

  this.domElement = element;

  this.domElement.customEvents = {};
  this.domElement.eventListeners = {};
};

/**
 * Regular expression that captures the tagnames of all the block elements in HTML5.
 *
 * @type {RegExp}
 */
Prime.Dom.Element.blockElementRegexp = /^(?:ARTICLE|ASIDE|BLOCKQUOTE|BODY|BR|BUTTON|CANVAS|CAPTION|COL|COLGROUP|DD|DIV|DL|DT|EMBED|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HGROUP|HR|LI|MAP|OBJECT|OL|OUTPUT|P|PRE|PROGRESS|SECTION|TABLE|TBODY|TEXTAREA|TFOOT|TH|THEAD|TR|UL|VIDEO)$/;
Prime.Dom.Element.anonymousId = 1;
Prime.Dom.Element.ieAlpaRegexp = /alpha\(opacity=(.+)\)/;

Prime.Dom.Element.prototype = {
  /**
   * Adds the given class (or list of space separated classes) to this Element.
   *
   * @param {String} classNames The class name(s).
   * @return {Prime.Dom.Element} This Element.
   */
  addClass: function (classNames) {
    var currentClassName = this.domElement.className;
    if (currentClassName === '') {
      currentClassName = classNames;
    } else {
      var classNamesList = classNames.split(Prime.Utils.spaceRegex);
      for (var i = 0; i < classNamesList.length; i++) {
        if (currentClassName.indexOf(classNamesList[i]) < 0) {
          currentClassName = currentClassName + ' ' + classNamesList[i];
        }
      }
    }

    this.domElement.className = currentClassName;
    return this;
  },

  /**
   * Attaches an event listener to this Element.
   *
   * @param {String} event The name of the event.
   * @param {Function} listener The event listener function.
   * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Element.
   * @return {Prime.Dom.Element} This Element.
   */
  addEventListener: function (event, listener, context) {
    var theContext = (arguments.length < 3) ? this : context;
    var proxy = Prime.Utils.proxy(listener, theContext);
    if (event.indexOf(':') == -1) {
      //traditional event
      if (this.domElement.addEventListener) {
        this.domElement.addEventListener(event, proxy, false);
      } else if (this.domElement.attachEvent) {
        this.domElement.attachEvent('on' + event, proxy);
      } else {
        throw 'Unable to set event onto the element. Neither addEventListener nor attachEvent methods are available';
      }
    } else {
      //custom event
      this.domElement.customEvents[event] = this.domElement.customEvents[event] || [];
      this.domElement.customEvents[event].push(proxy);
    }

    return this;
  },

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM after the given element.
   *
   * @param {Element} element The element to insert this Element after.
   * @return {Prime.Dom.Element} This Element.
   */
  appendTo: function (element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw 'You can only insert new Prime.Dom.Elements for now';
    }

    var domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.appendChild(this.domElement);
    } else {
      throw 'The element you passed into appendTo is not in the DOM. You can\'t insert a Prime.Dom.Element inside an element that isn\'t in the DOM yet.';
    }

    return this;
  },

  /**
   * Fires an event on the Element
   *
   * @param {String} event The name of the event.
   * @param {Object} memo Assigned to the memo field of the event, optional.
   * @param {boolean} bubbling If the event is bubbling, defaults to true.
   * @param {boolean} cancellable If the event is cancellable, defaults to true.
   * @return {Prime.Dom.Element} This Element.
   */
  fireEvent: function (event, memo, bubbling, cancellable) {
    bubbling = typeof bubbling !== 'undefined' ? bubbling : true;
    cancellable = typeof cancellable !== 'undefined' ? cancellable : true;

    var evt;
    if (event.indexOf(':') == -1) {
      //traditional event
      if (document.createEventObject) {
        // dispatch for IE
        evt = document.createEventObject();
        evt.memo = memo || {};
        this.domElement.fireEvent('on' + event, document.createEventObject())
      } else if (document.createEvent) {
        // dispatch for others
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, bubbling, cancellable); // event type,bubbling,cancelable
        evt.memo = memo || {};
        this.domElement.dispatchEvent(evt);
      } else {
        throw 'Unable to fire event.  Neither createEventObject nor createEvent methods are available';
      }
    } else {
      //custom event
      this.domElement.customEvents[event] = this.domElement.customEvents[event] || [];
      evt = {'event': event, 'memo': memo};
      for (index in this.domElement.customEvents[event]) {
        if (this.domElement.customEvents[event].hasOwnProperty(index)) {
          this.domElement.customEvents[event][index](evt);
        }
      }
    }

    return this;
  },

  /**
   * Returns the value of the given attribute.
   *
   * @param {String} name The attribute name.
   * @return {String} This attribute value or null.
   */
  getAttribute: function (name) {
    var attr = this.domElement.attributes.getNamedItem(name);
    if (attr) {
      return attr.value;
    }

    return null;
  },

  /**
   * Gets the computed style information for this Element.
   *
   * @return {IEElementStyle|CSSStyleDeclaration} The style information.
   */
  getComputedStyle: function () {
    return (this.domElement.currentStyle) ? this.domElement.currentStyle : document.defaultView.getComputedStyle(this.domElement, null);
  },

  /**
   * Gets the ID of this element from the domElement.
   *
   * @return {String} ID The id of the domElement if it exists.
   */
  getID: function () {
    return this.domElement.id;
  },

  /**
   * Gets the inner HTML content of the Element.
   *
   * @return {String} The HTML content.
   */
  getHTML: function () {
    return this.domElement.innerHTML;
  },

  /**
   * Retrieves the opacity value for the Element. This handles the IE alpha filter.
   *
   * @return {Number} The opacity value.
   */
  getOpacity: function () {
    var computedStyle = this.getComputedStyle();
    var opacity = 1.0;
    if (Prime.Browser.name === 'Explorer' && Prime.Browser.version < 9) {
      var filter = computedStyle['filter'];
      if (filter !== undefined && filter !== '') {
        var matches = Prime.Dom.Element.ieAlpaRegexp.match(filter);
        if (matches.length > 0) {
          opacity = parseFloat(matches[0]);
        }
      }
    } else {
      opacity = parseFloat(computedStyle['opacity']);
    }

    return opacity;
  },

  /**
   * Gets value of a style attribute
   *
   * @return {String} The style value.
   */
  getStyle: function (name) {
    return this.domElement.style[name];
  },

  /**
   * Retrieves the value of this Element.
   *
   * @return {String} The value of this Element.
   */
  getValue: function () {
    return this.domElement.value;
  },

  /**
   * Returns true if the element has one or all class names
   *
   * @param {String} classNames The class name(s).
   * @return {Boolean} true if all classnames are present.
   */
  hasClass: function (classNames) {
    var currentClassName = this.domElement.className;
    var classNamesList = classNames.split(Prime.Utils.spaceRegex);
    for (var i = 0; i < classNamesList.length; i++) {
      if (currentClassName.indexOf(classNamesList[i]) < 0) {
        return false;
      }
    }

    return true;
  },

  /**
   * Hides the Element by setting the display style to none.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  hide: function () {
    this.domElement.style.display = 'none';
    return this;
  },

  /**
   * Inserts this Element into the DOM after the given element, removing it from it's parent if it's an existing element.
   *
   * @param {Element} element The element to insert this Element after.
   * @return {Prime.Dom.Element} This Element.
   */
  insertAfter: function (element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    var domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    var parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement.nextSibling);
    } else {
      throw 'The element you passed into insertAfter is not in the DOM. You can\'t insert a Prime.Dom.Element after an element that isn\'t in the DOM yet.';
    }

    return this;
  },

  /**
   * Inserts this Element into the DOM before the given element, removing it from it's parent if it's an existing element.
   *
   * @param {Element} element The element to insert this Element before.
   * @return {Prime.Dom.Element} This Element.
   */
  insertBefore: function (element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    var domElement = (element instanceof Prime.Dom.Element) ? element.domElement : element;
    var parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement);
    } else {
      throw 'The element you passed into insertBefore is not in the DOM. You can\'t insert a Prime.Dom.Element before an element that isn\'t in the DOM yet.';
    }

    return this;
  },

  /**
   * Returns this element's parent as  Prime.Dom.Element.
   *
   * @return {Prime.Dom.Element} this element's parent or null if there is no parent
   */
  parent: function () {
    if (this.domElement.parentNode != null) {
      return new Prime.Dom.Element(this.domElement.parentNode);
    } else {
      return null;
    }
  },

  /**
   * Returns the computed top and left coordinates of this Element.
   *
   * @return {Hash} A Hash with top and left set
   */
  position: function () {
    var styles = this.getComputedStyle();
    var positionLeft = -(styles['margin-left']);
    var positionTop = -(styles['margin-top']);

    var element = this;
    var elements = [];
    do {
      elements.push(element);
      element = element.parent();
      if (element.domElement.type == 'body' || element.getStyle('position') !== 'static') {
        break;
      }
    } while (element);

    new Prime.Dom.ElementList(elements).each(function (element) {
      var elementStyle = element.getComputedStyle();
      positionLeft += elementStyle['offsetLeft'] || 0;
      positionTop += elementStyle['offsetTop'] || 0;
    });

    return {'top': positionTop, 'left': positionLeft};
  },

  /**
   * Removes an attribute from the Element
   *
   * @param {String} name The name of the attribute.
   * @return {Prime.Dom.Element} This Element.
   */
  removeAttribute: function (name) {
    this.domElement.removeAttribute(name);
    return this;
  },

  /**
   * Removes the given class (or list of space separated classes) from this Element.
   *
   * @param {String} classNames The class name(s).
   * @return {Prime.Dom.Element} This Element.
   */
  removeClass: function (classNames) {
    var currentClassName = this.domElement.className;
    if (currentClassName) {
      var classNamesList = classNames.split(Prime.Utils.spaceRegex);
      for (var i = 0; i < classNamesList.length; i++) {
        var aClass = classNamesList[i];
        var index = currentClassName.indexOf(aClass);
        if (index !== -1) {
          if (index === 0 && currentClassName.length === aClass.length) {
            currentClassName = '';
            break;
          } else if (index === 0) {
            currentClassName = currentClassName.substring(aClass.length + 1);
          } else if (index + aClass.length === currentClassName.length) {
            currentClassName = currentClassName.substring(0, index - 1);
          } else {
            currentClassName = currentClassName.substring(0, index - 1) + ' ' + currentClassName.substring(index + aClass.length + 1);
          }
        }
      }
    }

    this.domElement.className = currentClassName;
    return this;
  },

  /**
   * Removes an event handler for a specific event from this Element, you must have attached using addEventListener
   *
   * @param {String} event The name of the event.
   * @return {Prime.Dom.Element} This Element.
   */
  removeEventListener: function (event) {
    this.domElement.eventListeners[event] = this.domElement.eventListeners[event] || {};
    var proxies = this.domElement.eventListeners[event][this];
    delete this.domElement.eventListeners[event][this];

    if (event.indexOf(':') == -1) {
      //traditional event
      for (proxy in proxies) {
        if (proxies.hasOwnProperty(proxy)) {
          if (this.domElement.removeEventListener) {
            this.domElement.removeEventListener(event, proxy, false);
          } else if (this.domElement.detachEvent) {
            this.domElement.detachEvent('on' + event, proxy);
          } else {
            throw 'Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available';
          }
        }
      }
    } else {
      //custom event
      this.domElement.customEvents[event] = this.domElement.customEvents[event] || [];
      var newEvents = [];
      for (proxy in proxies) {
        if (proxies.hasOwnProperty(proxy)) {
          for (var ii = 0; ii < this.domElement.customEvents[event].length; ii++) {
            var handler = this.domElement.customEvents[event][ii];
            if (handler !== proxy) {
              newEvents.push(proxy);
            }
          }
        }
        this.domElement.customEvents[event] = newEvents;
      }
    }

    return this;
  },

  /**
   * Removes this Element from the DOM. If the Element isn't in the DOM this does nothing.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  removeFromDOM: function () {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    return this;
  },

  /**
   * Sets an attribute of the Element.
   *
   * @param {String} name The attribute name
   * @param {String} value The attribute value
   * @return {Prime.Dom.Element} This Element.
   */
  setAttribute: function (name, value) {
    var attribute = document.createAttribute(name);
    attribute.nodeValue = value;
    this.domElement.setAttributeNode(attribute);
    return this;
  },

  /**
   * Sets multiple attributes of the Element from the hash
   * @param {Hash} attributes a Hash of key value style pairs
   * @return {Prime.Dom.Element} This Element.
   */
  setAttributes: function (attributes) {
    for (key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  },

  /**
   * Sets the inner HTML content of the Element.
   *
   * @param {String|Prime.Dom.Element} newHTML The new HTML content for the Element.
   * @return {Prime.Dom.Element} This Element.
   */
  setHTML: function (newHTML) {
    if (newHTML != null) {
      if (newHTML instanceof Prime.Dom.Element) {
        this.domElement.innerHTML = newHTML.getHTML();
      } else {
        this.domElement.innerHTML = newHTML;
      }
    }
    return this;
  },

  /**
   * Sets the ID of the Element.
   *
   * @param {String} id The ID.
   * @return {Prime.Dom.Element} This Element.
   */
  setID: function (id) {
    this.domElement.id = id;
    return this;
  },

  /**
   * Sets the opacity of the element. This also sets the IE alpha filter for IE version 9 or younger.
   *
   * @param {Number} opacity The opacity.
   * @return {Prime.Dom.Element} This Element.
   */
  setOpacity: function (opacity) {
    if (Prime.Browser.name === 'Explorer' && Prime.Browser.version < 9) {
      this.domElement.style.filter = 'alpha(opacity=' + opacity + ')';
    } else {
      this.domElement.style.opacity = opacity;
    }

    return this;
  },

  /**
   * Sets the style for the name of this Element.
   *
   * @param {String} name The style name.
   * @param {String} value The style value.
   * @return {Prime.Dom.Element} This Element.
   */
  setStyle: function (name, value) {
    this.domElement.style[name] = value;
    return this;
  },

  /**
   * Sets multiple styles of this Element.
   *
   * @param {Hash} styles key value has of style names to new values.
   * @return {Prime.Dom.Element} This Element.
   */
  setStyles: function (styles) {
    for (key in styles) {
      if (styles.hasOwnProperty(key)) {
        this.setStyle(key, styles[key]);
      }
    }
    return this;
  },

  /**
   * Sets the value of this Element.
   *
   * @param {String} value The new value.
   * @return {Prime.Dom.Element} This Element.
   */
  setValue: function (value) {
    this.domElement.value = value;
    return this;
  },

  /**
   * Shows the Element by setting the display style first to empty string. After this, the elements computed style is
   * checked to see if the element is still not visible. If that is true, the element must have a CSS style defined in
   * a stylesheet that is setting it to display: none. In this case, we determine if the element is a block level element
   * and either set the display to 'block' or 'inline'.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  show: function () {
    this.domElement.style.display = '';

    var computedDisplay = this.getComputedStyle()['display'];
    if (computedDisplay === 'none') {
      this.domElement.style.display = (Prime.Dom.Element.blockElementRegexp.test(this.domElement.tagName)) ? 'block' : 'inline';
    }

    return this;
  },

  /*
   * Private methods
   */

  /**
   * Changes a style property iteratively over a given period of time from one value to another value.
   *
   * @private
   * @param {Object} config The configuration object for the iteration. This must contain the name of the style property
   *        being changed, the units of the property (px, em, etc), the defaultStartValue if the element doesn't have the
   *        style already, the end value, the duration, and the number of iterations.
   * @param {Function} [endFunction] Optional end function to call.
   * @param {Object} [context] Optional context for the function calls.
   */
  changeNumberStyleIteratively: function (config, endFunction, context) {
    var domElement = this.domElement;
    var currentValue = (domElement.style[config.name]) ? (domElement.style[config.name]) : config.defaultStartValue;
    var step = currentValue / config.iterations;
    var stepFunction = function (last) {
      if (last) {
        currentValue = config.endValue;
      } else {
        if (currentValue < config.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      domElement.style[config.name] = currentValue + config.units;

      // Handle the special opacity case for IE
      if (config.name === 'opacity') {
        domElement.style.filter = 'alpha(opacity=' + currentValue + config.units + ')';
      }
    };

    Prime.Utils.callIteratively(config.duration, config.iterations, stepFunction, endFunction, context);
  }
};


/**
 * Document object specific methods
 *
 * @constructor
 */
Prime.Dom.Document = {
  /**
   * Attaches an event listener to the document, returning the handler proxy.
   *
   * @param {String} event The name of the event.
   * @param {Function} handler The event handler.
   * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Element.
   * @return {function} The proxy handler.
   */
  addEventListener: function (event, handler, context) {
    var theContext = (arguments.length < 3) ? this : context;
    var proxy = Prime.Utils.proxy(handler, theContext);

    if (document.addEventListener) {
      document.addEventListener(event, proxy, false);
    } else if (document.attachEvent) {
      document.attachEvent('on' + event, proxy);
    } else {
      throw 'Unable to set event onto the element. Neither addEventListener nor attachEvent methods are available';
    }

    return proxy;
  },

  /**
   * Removes an event handler for a specific event from the document that you attached using addEventListener
   *
   * @param {String} event The name of the event.
   * @param {Object} handler The handler.
   */
  removeEventListener: function (event, handler) {
    if (document.removeEventListener) {
      document.removeEventListener(event, handler, false);
    } else if (document.detachEvent) {
      document.detachEvent('on' + event, handler);
    } else {
      throw 'Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available';
    }
  }
};

/**
 * A Javascript Object that can serve to generate Prime.Dom.Element from a source string
 * and optional parameters.
 *
 * @param template the String that defines the source of the template.
 * @constructor
 */
Prime.Dom.Template = function (template) {
  this.init(template);
};

Prime.Dom.Template.prototype = {
  init: function (template) {
    this.template = template;
  },

  /**
   * Generates a String from the given parameterHash.  Provide a hash of String keys to values.
   * Keys can be regular text strings, in which case it will look for and replace #{key} as with the value.  You can
   * also make the key a String "/key/", which will be converted to a Regex and run.
   *
   * For the value you can provide a straight up String, int, etc, or you can provide a function which will be called
   * to provide the value
   *
   * @param parameterHash
   * @return String
   */
  generate: function (parameterHash) {
    parameterHash = typeof parameterHash !== 'undefined' ? parameterHash : {};
    var templateCopy = new String(this.template);
    var key;
    for (key in parameterHash) {
      if (parameterHash.hasOwnProperty(key)) {
        var value = parameterHash[key];
        var expressedValue;
        if (typeof value === 'function') {
          expressedValue = value();
        } else {
          expressedValue = value;
        }
        if (key.indexOf('/') == 0 && key.lastIndexOf('/') == key.length - 1) {
          templateCopy = templateCopy.replace(new RegExp(key.substring(1, key.length - 1), "g"), expressedValue);
        } else {
          var expressedKey = "#{" + key + "}";
          while (templateCopy.indexOf(expressedKey) != -1) {
            templateCopy = templateCopy.replace(expressedKey, expressedValue);
          }
        }
      }
    }
    return templateCopy;
  },

  /**
   * Calls to generate and then appends the resulting value to the inner HTML of the provided primeElement.
   *
   * @param primeElement
   * @param parameterHash
   */
  appendTo: function (primeElement, parameterHash) {
    if (typeof primeElement !== 'undefined' && primeElement != null) {
      primeElement.setHTML(primeElement.getHTML() + this.generate(parameterHash));
    } else {
      throw "Please supply an element to append to"
    }
  },

  /**
   * Calls to generate and then inserts the resulting elements into the dom before the primeElement
   *
   * @param primeElement
   * @param parameterHash
   */
  insertBefore: function (primeElement, parameterHash) {
    if (typeof primeElement !== 'undefined' && primeElement != null) {
      var holder = document.createElement('div');
      holder.innerHTML = this.generate(parameterHash);
      new Prime.Dom.Element(holder.children[0]).insertBefore(primeElement);
    } else {
      throw "Please supply an element to append to"
    }
  },

  /**
   * Calls to generate and then inserts the resulting elements into the dom after the primeElement
   *
   * @param primeElement
   * @param parameterHash
   */
  insertAfter: function (primeElement, parameterHash) {
    if (typeof primeElement !== 'undefined' && primeElement != null) {
      var holder = document.createElement('div');
      holder.innerHTML = this.generate(parameterHash);
      new Prime.Dom.Element(holder.children[0]).insertAfter(primeElement);
    } else {
      throw "Please supply an element to append to"
    }
  }
};
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
Prime.Effects = Prime.Effects || {};


/**
 * Constructs a BaseTransition for the given element.
 *
 * @param {Prime.Dom.Element} element The Prime Element the effect will be applied to.
 * @constructor
 */
Prime.Effects.BaseTransition = function(element, endValue) {
  this.context = null;
  this.duration = 1000;
  this.element = element;
  this.endFunction = null;
  this.endValue = endValue;
  this.iterations = 20;
};

Prime.Effects.BaseTransition.prototype = {
  /**
   * Sets the function that is called when the effect has completed.
   *
   * @param {Function} endFunction The function that is called when the effect is completed.
   * @param {Object} [context] The context for the function call (sets the 'this' parameter). Defaults to the Element.
   * @return {Prime.Effects.BaseTransition} This Effect.
   */
  withEndFunction: function(endFunction, context) {
    this.endFunction = endFunction;
    this.context = context;
    return this;
  },

  /**
   * Sets the duration of the fade-out effect.
   *
   * @param {Number} duration The duration in milliseconds.
   * @return {Prime.Effects.BaseTransition} This Effect.
   */
  withDuration: function(duration) {
    if (duration < 100) {
      throw 'Duration should be greater than 100 milliseconds or it won\'t really be noticeable';
    }

    this.duration = duration;
    return this;
  },


  /*
  * Private functions
  */

  /**
   * Changes an integer style property of the Element iteratively over a given period of time from one value to another
   * value.
   *
   * @private
   * @param {Function} getFunction The function on the element to call to get the current value for the transition.
   * @param {Function} setFunction The function on the element to call to set the new value for the transition.
   */
  changeNumberStyleIteratively: function(getFunction, setFunction) {
    var currentValue = getFunction.call(this.element);
    var step = Math.abs(this.endValue - currentValue) / this.iterations;

    // Close around ourselves
    var self = this;
    var stepFunction = function(last) {
      if (last) {
        currentValue = self.endValue;
      } else {
        if (currentValue < self.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      console.log(currentValue);
      setFunction.call(self.element, currentValue);
    };

    Prime.Utils.callIteratively(this.duration, this.iterations, stepFunction, this.internalEndFunction, this);
  },

  /**
   * Handles the call back at the end.
   *
   * @private
   */
  internalEndFunction: function() {
    this.subclassEndFunction();
    var context = this.context || this.element;
    if (this.endFunction !== null) {
      this.endFunction.call(context);
    }
  }
};

/**
 * Constructs a new Fade for the given element. The fade effect uses the CSS opacity style and supports the IE alpha
 * style. The duration defaults to 1000 milliseconds (1 second). This changes the opacity over the duration from 1.0 to
 * 0.0. At the end, this hides the element so that it doesn't take up any space.
 *
 * @param {Prime.Dom.Element} element The Prime Element to fade out.
 * @constructor
 */
Prime.Effects.Fade = function(element) {
  Prime.Effects.BaseTransition.apply(this, [element, 0.0]);
};
Prime.Effects.Fade.prototype = new Prime.Effects.BaseTransition();
Prime.Effects.Fade.constructor = Prime.Effects.Fade;

/**
 * Internal call back at the end of the transition. This hides the element so it doesn't take up space.
 *
 * @private
 */
Prime.Effects.Fade.prototype.subclassEndFunction = function() {
  this.element.hide();
};

/**
 * Executes the fade effect on the element using the opacity style.
 */
Prime.Effects.Fade.prototype.go = function() {
  this.changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};


/**
 * Constructs a new Appear for the given element. The appear effect uses the CSS opacity style and supports the IE
 * alpha style. The duration defaults to 1000 milliseconds (1 second). This first sets the opacity to 0, then it shows
 * the element and finally it raises the opacity.
 *
 * @param {Prime.Dom.Element} element The Prime Element to appear.
 * @constructor
 */
Prime.Effects.Appear = function(element) {
  Prime.Effects.BaseTransition.apply(this, [element, 1.0]);
};
Prime.Effects.Appear.prototype = new Prime.Effects.BaseTransition();
Prime.Effects.Appear.constructor = Prime.Effects.Appear;

/**
 * Internal call back at the end of the transition. This does nothing since the Appear has no change at the end.
 *
 * @private
 */
Prime.Effects.Appear.prototype.subclassEndFunction = function() {
  // Nothing.
};

/**
 * Executes the appear effect on the element using the opacity style.
 */
Prime.Effects.Appear.prototype.go = function() {
  this.element.setOpacity(0.0);
  this.element.show();
  this.changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};/*
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
Prime.Utils = Prime.Utils || {};

Prime.Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Attempts to invoke a function iteratively in the background a specific number of times within a specific duration.
   * This might not complete in the specified duration. The functions passed in should be short functions that return as
   * quickly as possible. If you are using long functions, use the recursive setTimeout trick by-hand instance.
   *
   * @param {Number} totalDuration The duration in milliseconds.
   * @param {Number} timesToCall The number of times to call the function.
   * @param {Function} stepFunction The step function to call each iteration.
   * @param {Function} [endFunction] The function to invoke at the end.
   * @param {Object} [context] The context for the function calls (sets the 'this' parameter).
   */
  callIteratively: function(totalDuration, timesToCall, stepFunction, endFunction, context) {
    var theContext = (arguments.length < 5) ? this : context;
    var step = totalDuration / timesToCall;
    var count = 0;
    var id = setInterval(function() {
      count++;
      var last = (count >= timesToCall);
      stepFunction.call(theContext, last);
      if (last) {
        clearInterval(id);

        if (typeof endFunction !== 'undefined' && endFunction !== null) {
          endFunction.call(theContext);
        }
      }
    }, step - 1);
  },

  /**
   * Parses JSON.
   *
   * @param {String} json The JSON.
   * @return {Object} The JSON data as an object.
   */
  parseJSON: function(json) {
    return JSON.parse(json);
  },

  /**
   * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
   *
   * @param {Function} func The function to call.
   * @param {Object} context The "this" variable when the function is called.
   * @return {Function} An anonymous function.
   */
  proxy: function(func, context) {
    return function() {
      func.apply(context, arguments);
    }
  },

  type: function(object) {
    return Object.prototype.toString(object).match(Prime.Utils.typeRegex)[1];
  }
};
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function( window, undefined ) {

var document = window.document,
	docElem = document.documentElement,

	rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
	chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,

	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,

	toString = Object.prototype.toString,
	strundefined = "undefined",

	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/,

	// Used for testing something on an element
	assert = function( fn ) {
		var pass = false,
			div = document.createElement("div");
		try {
			pass = fn( div );
		} catch (e) {}
		// release memory in IE
		div = null;
		return pass;
	},

	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	assertGetIdNotName = assert(function( div ) {
		var pass = true,
			id = "script" + (new Date()).getTime();
		div.innerHTML = "<a name ='" + id + "'/>";

		// Inject it into the root element, check its status, and remove it quickly
		docElem.insertBefore( div, docElem.firstChild );

		if ( document.getElementById( id ) ) {
			pass = false;
		}
		docElem.removeChild( div );
		return pass;
	}),

	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return div.getElementsByTagName("*").length === 0;
	}),

	// Check to see if an attribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		if ( div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") !== "#" ) {
			return false;
		}
		return true;
	}),

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	assertFindSecondClassName = true,
	// Safari caches class attributes, doesn't catch changes (in 3.2)
	assertNoClassCache = assert(function( div ) {
		div.innerHTML = "<div class='test e'></div><div class='test'></div>";
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			assertFindSecondClassName = false;
		}

		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length !== 1;
	});


// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results ) {
	results = results || [];
	context = context || document;
	var match, elem, contextXML,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	contextXML = isXML( context );

	if ( !contextXML ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( match[1] ) {
				// Ensure context is a document
				if ( nodeType !== 9 ) {
					elem = context.ownerDocument && context.ownerDocument.getElementById( match[1] );
				} else {
					elem = context.getElementById( match[1] );
				}

				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				if ( elem && elem.parentNode ) {
					// Handle the case where IE, Opera, and Webkit return items
					// by name instead of ID
					if ( elem.id === match[1] ) {
						return results ? makeArray( [ elem ], results ) : [ elem ];
					}
				} else {
					return makeArray( [], results );
				}
			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				// Speed-up: Sizzle("body")
				if ( selector === "body" && context.body ) {
					return makeArray( [ context.body ], results );
				}
				return makeArray( context.getElementsByTagName( selector ), results );
			// Speed-up: Sizzle(".CLASS")
			} else if ( match[3] && context.getElementsByClassName && assertFindSecondClassName && assertNoClassCache ) {
				return makeArray( context.getElementsByClassName( match[3] ), results );
			}
		}
	}

	// All others
	return select( selector, context, results, undefined, contextXML );
};

var select = function( selector, context, results, seed, contextXML ) {
	var m, set, checkSet, extra, ret, cur, pop, i,
		origContext = context,
		prune = true,
		parts = [],
		soFar = selector;

	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];

			parts.push( m[1] );

			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed, contextXML );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}

				set = posProcess( selector, set, seed, contextXML );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				matchExpr.ID.test(parts[0]) && !matchExpr.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		select( extra, origContext, results, seed, contextXML );
		uniqueSort( results );
	}

	return results;
};

// Slice is no longer used
// It is not actually faster
// Results is expected to be an array or undefined
var makeArray = function( array, results ) {
	results = results || [];
	var i = 0,
		len = array.length;
	for (; i < len; i++) {
		results.push( array[i] );
	}
	return results;
};

var uniqueSort = Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

// Element contains another
var contains = Sizzle.contains = docElem.compareDocumentPosition ?
	function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	} :
	docElem.contains ?
	function( a, b ) {
		return a !== b && (a.contains ? a.contains( b ) : false);
	} :
	function( a, b ) {
		while ((b = b.parentNode)) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.matches = function( expr, set ) {
	return select( expr, document, [], set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return select( expr, document, [], [node], isXML( node ) ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];

		if ( (match = leftMatchExpr[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( matchExpr[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== strundefined ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = leftMatchExpr[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( matchExpr[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
	var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: assertHrefNotNormalized ?
			function( elem ) {
				return elem.getAttribute( "href" );
			} :
			function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
			}

			dirCheck( "parentNode", part, doneName, checkSet, nodeCheck, isXML, nodeCheck !== undefined );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
			}

			dirCheck( "previousSibling", part, doneName, checkSet, nodeCheck, isXML, nodeCheck !== undefined );
		}
	},

	find: {
		ID: assertGetIdNotName ?
			function( match, context, isXML ) {
				if ( typeof context.getElementById !== strundefined && !isXML ) {
					var m = context.getElementById(match[1]);
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( match, context, isXML ) {
				if ( typeof context.getElementById !== strundefined && !isXML ) {
					var m = context.getElementById(match[1]);

					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
						[];
				}
			},
		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: assertTagNameNoComments ?
			function( match, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( match[1] );
				}
			} :
			function( match, context ) {
				var results = context.getElementsByTagName( match[1] );

				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [];

					for ( var i = 0; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}

					results = tmp;
				}
				return results;
			}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\f\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not, isXML ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = select(match[3], document, [], curLoop, isXML);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, !not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},

	filters: {
		enabled: function( elem ) {
			return elem.disabled === false;
		},

		disabled: function( elem ) {
			return !!elem.disabled;
		},

		checked: function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		},

		active: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},

	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					if ( type === "first" ) {
						return true;
					}

					node = elem;

					/* falls through */
				case "last":
					while ( (node = node.nextSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}

					doneName = match[0];
					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;

						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: assertGetIdNotName ?
			function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			} :
			function( elem, match ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return elem.nodeType === 1 && node && node.nodeValue === match;
			},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},

		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

// Add getElementsByClassName if usable
if ( assertFindSecondClassName && assertNoClassCache ) {
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== strundefined && !isXML ) {
			return context.getElementsByClassName( match[1] );
		}
	};
}

// Build all of the regexes
var characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
	noBracketsParens = /(?![^\[]*\])(?![^\(]*\))/.source,
	matchExpr = Expr.match = {
		ID: new RegExp("#(" + characterEncoding + "+)"),
		CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
		NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
		TAG: new RegExp("^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)"),
		ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
	},
	leftMatchExpr = Expr.leftMatch = {},
	origPOS = matchExpr.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

// Modify the regexes ensuring the matches are not surrounded in brackets/parens
for ( var type in matchExpr ) {
	matchExpr[ type ] = new RegExp( matchExpr[ type ].source + noBracketsParens );
	leftMatchExpr[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace(/\\(\d+)/g, fescape) );
}
// Expose origPOS
// "global" as in regardless of relation to brackets/parens
matchExpr.globalPOS = origPOS;

var sortOrder, siblingCheck;

if ( docElem.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

if ( document.querySelectorAll ) {
	(function(){
		var oldSelect = select,
			id = "__sizzle__",
			rrelativeHierarchy = /^\s*[+~]/,
			rapostrophe = /'/g,
			rbuggyQSA = [];

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			div.innerHTML = "<select><option selected='selected'></option></select>";
			if ( !div.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push(":checked");
			}

			// assertQSAAttrEmptyValue
			// Opera 10/IE - ^= $= *= and empty values
			div.innerHTML = "<p class=''></p>";
			// Should not select anything
			if ( !!div.querySelectorAll("[class^='']").length ) {
				rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
			}

			// assertQSAHiddenEnabled
			// IE8 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			div.innerHTML = "<input type='hidden'>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, contextXML ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
				if ( context.nodeType === 9 ) {
					try {
						return makeArray( context.querySelectorAll(selector), results );
					} catch(qsaError) {}
				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						parent = context.parentNode,
						relativeHierarchySelector = rrelativeHierarchy.test( selector );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( rapostrophe, "\\$&" );
					}
					if ( relativeHierarchySelector && parent ) {
						context = parent;
					}

					try {
						if ( !relativeHierarchySelector || parent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + selector ), results );
						}
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, contextXML );
		};
	})();
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML, isNodeCheck ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[ elem.sizset ];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( isNodeCheck ) {
					if ( elem.nodeName.toLowerCase() === cur ) {
						match = elem;
						break;
					}
				} else if ( elem.nodeType === 1 ) {
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed, isXML ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = matchExpr.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( matchExpr.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		select( selector, root[i], tmpSet, seed, isXML );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})( window );
