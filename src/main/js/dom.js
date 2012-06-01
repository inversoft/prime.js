/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var Prime = Prime || {};

/**
 * The DOM namespace.
 *
 * @type {Object}
 */
Prime.Dom = {
  readyFunctions: [],
  tagRegexp: /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

  /**
   * Builds a new element using the given HTML snippet (currently this only supports the tag).
   *
   * @param {String} elementString The element string.
   * @return {Prime.Dom.Element} A new Prime.DOM.Element.
   */
  newElement: function(elementString) {
    var result = Prime.Dom.tagRegexp.exec(elementString);
    if (result == null) {
      throw 'Invalid element string [' + elementString + ']';
    }

    return new Prime.Dom.Element(document.createElement(result[1]));
  },

  /**
   * Adds the given callback function to the list of functions to invoke when the document is ready. If the document is
   * already fully loaded, this simply invokes the callback directly.
   *
   * @param {Function} callback The callback function.
   * @param {Object} [context] The context for the function call (sets the this variable).
   */
  onDocumentReady: function(callback, context) {
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
  query: function(selector, element) {
    return new Prime.Dom.ElementList(Sizzle(selector, element));
  },

  /**
   * Queries the DOM for an element that has the given ID.
   *
   * @param {String} id The ID.
   * @return {Prime.Dom.Element} The element or null.
   */
  queryByID: function(id) {
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
   * @param {Element|Document} [element] The starting point for the search (defaults to document if not provided).
   * @return {Prime.Dom.Element} An element or null.
   */
  queryFirst: function(selector, element) {
    var domElements = Sizzle(selector, element);
    if (domElements.length === 0) {
      return null;
    }

    return new Prime.Dom.Element(domElements[0]);
  },


  /*
   * Private methods
   */

  /**
   * Calls all the registered document ready listeners.
   *
   * @private
   */
  callReadyListeners: function() {
    if (document.addEventListener || document.readyState === 'complete') {
      var readyFunction;
      while (readyFunction = Prime.Dom.readyFunctions.shift()) {
        readyFunction();
      }
    }

    document.removeEventListener(Prime.Dom.callReadyListeners);
  }
};


/**
 * Constructs an ElementList object using the given array of DOMElements.
 *
 * @param {Array} elements The array of DOMElement objects.
 * @constructor
 */
Prime.Dom.ElementList = function(elements) {
  this.init(elements);
};
Prime.Dom.ElementList.prototype = {
  init: function(elements) {
    this.length = elements.length;
    for (var i = 0; i < elements.length; i++) {
      this[i] = new Prime.Dom.Element(elements[i]);
    }
  },

  /**
   * Iterates over each of the Prime.Dom.Element objects in this ElementList and calls the given function for each one.
   * The 'this' variable inside the function will be the current Prime.Dom.Element. The function can optionally take a
   * single parameter that is the current index.
   *
   * @param {Function} iterationFunction The function to call.
   * @param {Object} [context] The context for the function call (sets the this variable).
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


/**
* Creates an Element class for the given DOM element.
*
* @param {Element} element The element
* @constructor
*/
Prime.Dom.Element = function(element) {
  this.init(element);
};
Prime.Dom.Element.prototype = {
  init: function(element) {
    if (!(element instanceof Node) || element.nodeType !== 1) {
      throw 'You can only pass in DOM element Node objects to the Prime.Dom.Element constructor';
    }

    this.domElement = element;
    this.id = element.id;
  },

  /**
   * Adds the given class (or list of space separated classes) to this Element.
   *
   * @param {String} classNames The class name(s).
   * @return {Prime.Dom.Element} This Element.
   */
  addClass: function(classNames) {
    var currentClassName = this.domElement.className;
    if (!currentClassName) {
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
   * Inserts this Element (which must be a newly created Element) into the DOM after the given element.
   *
   * @param {Element} element The element to insert this Element after.
   * @return {Prime.Dom.Element} This Element.
   */
  appendTo: function(element) {
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
   * Returns the value of the given attribute.
   *
   * @param {String} name The attribute name.
   * @return {String} This attribute value or null.
   */
  attribute: function(name) {
    var attr = this.domElement.attributes.getNamedItem(name);
    if (attr) {
      return attr.value;
    }

    return null;
  },

  /**
   * Fades this element out using the opacity style.
   *
   * @param {Number} duration The total duration to go from displayed to gone.
   * @param {Function} [endFunction] A function to call after the fadeOut is complete.
   * @param {Object} [context] The context for the function call (sets the 'this' parameter). Defaults to this Element.
   * @return {Prime.Dom.Element} This Element.
   */
  fadeOut: function(duration, endFunction, context) {
    if (duration < 100) {
      throw 'Duration should be greater than 100 milliseconds or it won\'t really be noticeable';
    }

    var self = this;
    var theContext = (arguments.length < 3) ? this : context;
    var internalEndFunction = function() {
      self.hide();
      if (typeof endFunction !== 'undefined' && endFunction !== null) {
        endFunction.call(theContext);
      }
    };

    this.changeStyleIteratively({
      name: 'opacity',
      units: '',
      defaultStartValue: 1.0,
      endValue: 0.0,
      duration: duration,
      iterations: 20
    }, internalEndFunction, theContext);
    return this;
  },

  /**
   * Gets the inner HTML content of the Element.
   *
   * @return {String} The HTML content.
   */
  getHTML: function() {
    return this.domElement.innerHTML;
  },

  /**
   * Retrieves the value of this Element.
   *
   * @return {String} The value of this Element.
   */
  getValue: function() {
    return this.domElement.value;
  },

  /**
   * Hides the Element by setting the display style to none.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  hide: function() {
    this.domElement.style.display = 'none';
    return this;
  },

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM after the given element.
   *
   * @param {Element} element The element to insert this Element after.
   * @return {Prime.Dom.Element} This Element.
   */
  insertAfter: function(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw 'You can only insert new Prime.Dom.Elements for now';
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
   * Inserts this Element (which must be a newly created Element) into the DOM before the given element.
   *
   * @param {Element} element The element to insert this Element before.
   * @return {Prime.Dom.Element} This Element.
   */
  insertBefore: function(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw 'You can only insert new Prime.Dom.Elements for now';
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
   * Removes the given class (or list of space separated classes) from this Element.
   *
   * @param {String} classNames The class name(s).
   * @return {Prime.Dom.Element} This Element.
   */
  removeClass: function(classNames) {
    var currentClassName = this.domElement.className;
    if (currentClassName) {
      var classNamesList = classNames.split(Prime.Utils.spaceRegex);
      for (var i = 0; i < classNamesList.length; i++) {
        var aClass = classNamesList[i];
        var index = currentClassName.indexOf(aClass);
        if (index === 0 && currentClassName.length === aClass.length) {
          currentClassName = null;
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

    this.domElement.className = currentClassName;
    return this;
  },

  /**
   * Removes this Element from the DOM. If the Element isn't in the DOM this does nothing.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  removeFromDOM: function() {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    return this;
  },

  /**
   * Sets the inner HTML content of the Element.
   *
   * @param {String} newHTML The new HTML content for the Element.
   * @return {Prime.Dom.Element} This Element.
   */
  setHTML: function(newHTML) {
    this.domElement.innerHTML = newHTML;
    return this;
  },

  /**
   * Sets the value of this Element.
   *
   * @param {String} value The new value.
   * @return {Prime.Dom.Element} This Element.
   */
  setValue: function(value) {
    this.domElement.value = value;
    return this;
  },

  /**
   * Shows the Element by setting the display style to null, which should revert to using the CSS. This does not support
   * setting the display property inline to control the rendering. I'm assuming anyone doing modern HTML/CSS will be using
   * CSS files.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  show: function() {
    this.domElement.style.display = null;
    return this;
  },

  /**
   * Attaches an event listener to this Element.
   *
   * @param {String} event The name of the event.
   * @param {Function} handler The event handler.
   * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Element.
   * @return {Prime.Dom.Element} This Element.
   */
  withEventListener: function(event, handler, context) {
    var theContext = (arguments.length < 3) ? this : context;
    this.domElement.addEventListener(event, Prime.Utils.proxy(handler, theContext));
    return this;
  },

  /**
   * Sets the ID of the Element.
   *
   * @param {String} id The ID.
   * @return {Prime.Dom.Element} This Element.
   */
  withID: function(id) {
    this.domElement.id = id;
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
  changeStyleIteratively: function(config, endFunction, context) {
    var domElement = this.domElement;
    var currentValue = config.defaultStartValue;
    if (domElement.style.getPropertyValue(config.name)) {
      currentValue = domElement.style.getPropertyValue(config.name);
    }

    var step = currentValue / config.iterations;
    var stepFunction = function(last) {
      if (last) {
        currentValue = config.endValue;
      } else {
        if (currentValue < config.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      domElement.style.setProperty(config.name, currentValue + config.units, null);

      // Handle the special opacity case for IE
      if (config.name === 'opacity') {
        domElement.style.filter = 'alpha(opacity=' + currentValue + config.units + ')';
      }
    };

    Prime.Utils.callIteratively(config.duration, config.iterations, stepFunction, endFunction, context);
  }
};
