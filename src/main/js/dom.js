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
   * Queries the DOM using the given Sizzle selector starting at the given context and returns all the matched elements.
   *
   * @param {String} selector The selector.
   * @param {Element|Document} [context] The context element (defaults to document if not provided).
   * @return {Prime.Dom.ElementList} An element list.
   */
  query: function(selector, context) {
    return new Prime.Dom.ElementList(Sizzle(selector, context));
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
   * Queries the DOM using the given Sizzle selector starting at the given context and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {String} selector The selector.
   * @param {Element|Document} [context] The context element (defaults to document if not provided).
   * @return {Prime.Dom.Element} An element or null.
   */
  queryFirst: function(selector, context) {
    var domElements = Sizzle(selector, context);
    if (domElements.length === 0) {
      return null;
    }

    return new Prime.Dom.Element(domElements[0]);
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
   * Hides the Element by setting the display style to none.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  hide: function() {
    this.domElement.style.display = 'none';
    return this;
  },

  /**
   * Sets the inner HTML content of the Element.
   *
   * @param {String} newHTML The new HTML content for the Element.
   * @return {Prime.Dom.Element} This Element.
   */
  html: function(newHTML) {
    this.domElement.innerHTML = newHTML;
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
   * Removes this Element from the DOM. If the Element isn't in the DOM yet this throws an exception.
   *
   * @return {Prime.Dom.Element} This Element.
   */
  removeFromDOM: function() {
    if (!this.domElement.parentNode) {
      throw 'Can\'t remove elements that aren\'t in the DOM.';
    }

    this.domElement.parentNode.removeChild(this.domElement);
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
   * @param {Object} [context] The context to use when invoking the handler (this sets the 'this' variable for the function call).
   * @return {Prime.Dom.Element} This Element.
   */
  withEventListener: function(event, handler, context) {
    var theContext = (arguments.length < 3) ? this.domElement : context;
    this.domElement.addEventListener(event, Prime.Utils.proxy(theContext, handler));
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
  }
};
