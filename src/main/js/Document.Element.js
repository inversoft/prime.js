/*
 * Copyright (c) 2013-2015, Inversoft Inc., All Rights Reserved
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
Prime.Document = Prime.Document || {};


/**
 * Creates an Element class for the given DOM element.
 *
 * @constructor
 * @param {Element} element The element
 */
Prime.Document.Element = function(element) {
  if (typeof element.nodeType === 'undefined' || element.nodeType !== 1) {
    throw new TypeError('You can only pass in DOM element Node objects to the Prime.Document.Element constructor');
  }

  this.domElement = element;
  this.domElement.customEventListeners = [];
  this.domElement.eventListeners = {};
};

/**
 * Regular expression that captures the tagnames of all the block elements in HTML5.
 *
 * @type {RegExp}
 */
Prime.Document.Element.blockElementRegexp = /^(?:ARTICLE|ASIDE|BLOCKQUOTE|BODY|BR|BUTTON|CANVAS|CAPTION|COL|COLGROUP|DD|DIV|DL|DT|EMBED|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HGROUP|HR|LI|MAP|OBJECT|OL|OUTPUT|P|PRE|PROGRESS|SECTION|TABLE|TBODY|TEXTAREA|TFOOT|TH|THEAD|TR|UL|VIDEO)$/;
Prime.Document.Element.mouseEventsRegexp = /^(?:click|dblclick|mousedown|mouseup|mouseover|mousemove|mouseout)$/;
Prime.Document.Element.htmlEventsRegexp = /^(?:abort|blur|change|error|focus|load|reset|resize|scroll|select|submit|unload)$/;
Prime.Document.Element.anonymousId = 1;
Prime.Document.Element.ieAlpaRegexp = /alpha\(opacity=(.+)\)/;

Prime.Document.Element.prototype = {
  /**
   * Adds the given class (or list of space separated classes) to this Element.
   *
   * @param {string} classNames The class name(s).
   * @returns {Prime.Document.Element} This Element.
   */
  addClass: function(classNames) {
    var currentClassName = this.domElement.className;
    if (currentClassName === '') {
      currentClassName = classNames;
    } else {
      var currentClassNameList = this.domElement.className.split(Prime.Utils.spaceRegex);
      var newClassNameList = classNames.split(Prime.Utils.spaceRegex);
      for (var i = 0; i < newClassNameList.length; i++) {
        if (currentClassNameList.indexOf(newClassNameList[i]) === -1) {
          currentClassNameList.push(newClassNameList[i]);
        }
      }

      currentClassName = currentClassNameList.join(' ');
    }

    this.domElement.className = currentClassName;
    return this;
  },

  /**
   * Attaches an event listener to this Element.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event listener function.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Element.
   * @returns {Prime.Document.Element} This Element.
   */
  addEventListener: function(event, listener, context) {
    var theContext = (arguments.length < 3) ? this : context;
    listener.primeProxy = Prime.Utils.proxy(listener, theContext);
    this.domElement.eventListeners[event] = this.domElement.eventListeners[event] || [];
    this.domElement.eventListeners[event].push(listener.primeProxy);

    if (event.indexOf(':') === -1) {
      // Traditional event
      if (this.domElement.addEventListener) {
        this.domElement.addEventListener(event, listener.primeProxy, false);
      } else if (this.domElement.attachEvent) {
        this.domElement.attachEvent('on' + event, listener.primeProxy);
      } else {
        throw new TypeError('Unable to set event onto the element. Neither addEventListener nor attachEvent methods are available');
      }
    } else {
      // Custom event
      this.domElement.customEventListeners[event] = this.domElement.customEventListeners[event] || [];
      this.domElement.customEventListeners[event].push(listener.primeProxy);
    }

    return this;
  },

  /**
   * Appends the given element to this element. If the given element already exists in the DOM, it is removed from its
   * current location and placed at the end of this element.
   *
   * @param {Prime.Document.Element|Node} element The element to append.
   * @returns {Prime.Document.Element} This Element.
   */
  appendElement: function(element) {
    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }

    this.domElement.appendChild(domElement);
    return this;
  },

  /**
   * Appends the given HTML string to this element.
   *
   * @param {string} html The HTML to append.
   * @returns {Prime.Document.Element} This Element.
   */
  appendHTML: function(html) {
    this.domElement.insertAdjacentHTML('beforeend', html);
    return this;
  },

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM inside at the very end of the given
   * element.
   *
   * @param {Prime.Document.Element|Node} element The element to insert this Element into.
   * @returns {Prime.Document.Element} This Element.
   */
  appendTo: function(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw new TypeError('You can only insert new Prime.Document.Elements for now');
    }

    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.appendChild(this.domElement);
    } else {
      throw new TypeError('The element you passed into appendTo is not in the DOM. You can\'t insert a Prime.Document.Element inside an element that isn\'t in the DOM yet.');
    }

    return this;
  },

  /**
   * Fires an event on the Element.
   *
   * @param {string} event The name of the event.
   * @param {Object} [memo] Assigned to the memo field of the event.
   * @param {Object} [target] The target.
   * @param {boolean} [bubbling] If the event is bubbling, defaults to true.
   * @param {boolean} [cancelable] If the event is cancellable, defaults to true.
   * @returns {Prime.Document.Element} This Element.
   */
  fireEvent: function(event, memo, target, bubbling, cancelable) {
    memo = typeof(memo) !== 'undefined' ? memo : {};
    target = typeof(target) !== 'undefined' ? target : this;
    bubbling = typeof(bubbling) !== 'undefined' ? bubbling : true;
    cancelable = typeof(cancelable) !== 'undefined' ? cancelable : true;

    var evt;
    if (event.indexOf(':') === -1) {
      // Traditional event
      if (document.createEventObject) {
        // Dispatch for IE
        evt = document.createEventObject();
        evt.memo = memo || {};
        evt.cancelBubble = !bubbling;
        this.domElement.fireEvent('on' + event, evt);
      } else if (document.createEvent) {
        // Dispatch for others
        if (Prime.Document.Element.mouseEventsRegexp.exec(event)) {
          evt = document.createEvent("MouseEvents");
          evt.initMouseEvent(event, bubbling, cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        } else if (Prime.Document.Element.htmlEventsRegexp.exec(event)) {
          evt = document.createEvent("HTMLEvents");
          evt.initEvent(event, bubbling, cancelable);
        } else {
          throw new TypeError('Invalid event [' + event + ']');
        }

        evt.memo = memo || {};
        this.domElement.dispatchEvent(evt);
      } else {
        throw new TypeError('Unable to fire event. Neither createEventObject nor createEvent methods are available');
      }
    } else {
      // Custom event
      this.domElement.customEventListeners[event] = this.domElement.customEventListeners[event] || [];
      evt = {'event': event, 'memo': memo, 'target': target};
      for (index in this.domElement.customEventListeners[event]) {
        if (this.domElement.customEventListeners[event].hasOwnProperty(index)) {
          this.domElement.customEventListeners[event][index](evt);
        }
      }
    }

    return this;
  },

  /**
   * Puts the focus on this element.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  focus: function() {
    this.domElement.focus();
    return this;
  },

  /**
   * Returns the absolute top of this element relative to the document.
   *
   * @returns {number} The number of pixels that this element is from the top of the document.
   */
  getAbsoluteTop: function() {
    var top = 0;
    var e = this.domElement;
    while (e) {
      top += e.offsetTop;
      e = e.offsetParent;
    }

    return top;
  },

  /**
   * Returns the value of the given attribute.
   *
   * @param {string} name The attribute name.
   * @returns {string} This attribute value or null.
   */
  getAttribute: function(name) {
    var attr = this.domElement.attributes.getNamedItem(name);
    if (attr) {
      return attr.value;
    }

    return null;
  },

  /**
   * Returns all of the attributes on the element as an object.
   *
   * @returns {object} This attributes or an empty object if there are no attributes on this element.
   */
  getAttributes: function() {
    var attrs = {};
    if (this.domElement.hasAttributes()) {
      for (var i = 0; i < this.domElement.attributes.length; i++) {
        attrs[this.domElement.attributes[i].name] = this.domElement.attributes[i].value;
      }
    }

    return attrs;
  },

  /**
   * @returns {number} The bottom position (in pixels) of the current element.
   */
  getBottom: function() {
    return this.domElement.getBoundingClientRect().bottom;
  },

  /**
   * Gets the children elements of this Element, optionally reduced to those matching the optional selector.
   *
   * @param {string} selector The selector. If not provided all children will be returned.
   * @returns {Prime.Document.ElementList} The children.
   */
  getChildren: function(selector) {
    if (typeof selector === 'undefined' || selector === null) {
      return new Prime.Document.ElementList(this.domElement.children);
    }

    var matched = [];
    for (var i = 0; i < this.domElement.children.length; i++) {
      var child = this.domElement.children[i];
      if (child.matches(selector)) {
        matched.push(child);
      }
    }

    return new Prime.Document.ElementList(matched);
  },

  /**
   * Gets the class value of the current element. This might be a single class or multiple class names.
   *
   * @returns {string} The class.
   */
  getClass: function() {
    return this.domElement.className;
  },

  /**
   * Gets the computed style information for this Element.
   *
   * @returns {IEElementStyle|CSSStyleDeclaration} The style information.
   */
  getComputedStyle: function() {
    return (this.domElement.currentStyle) ? this.domElement.currentStyle : document.defaultView.getComputedStyle(this.domElement, null);
  },

  /**
   * Returns the dataset if it exists, otherwise, this creates a new dataset object and returns it.
   *
   * @returns {object} This dataset object.
   */
  getDataSet: function() {
    if (this.domElement.dataset) {
      return this.domElement.dataset;
    }

    this.domElement.dataset = {};
    var attrs = this.getAttributes();
    for (var prop in attrs) {
      if (attrs.hasOwnProperty(prop) && prop.indexOf('data-') === 0) {
        var dataName = prop.substring(5).replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        this.domElement.dataset[dataName] = attrs[prop];
      }
    }
    return this.domElement.dataset;
  },

  /**
   * Gets the height of the Element as an integer value. This does not the border but does include any scroll bars. This
   * is often called the innerHeight of the element.
   *
   * @returns {number} The height as pixels (number) or a string.
   */
  getHeight: function() {
    var computedStyle = this.getComputedStyle();
    var offsetHeight = this.domElement.offsetHeight;
    var borderTop = computedStyle['borderTopWidth'];
    var borderBottom = computedStyle['borderBottomWidth'];
    return offsetHeight - Prime.Utils.parseCSSMeasure(borderTop) - Prime.Utils.parseCSSMeasure(borderBottom);
  },

  /**
   * Gets the inner HTML content of the Element.
   *
   * @returns {string} The HTML content.
   */
  getHTML: function() {
    return this.domElement.innerHTML;
  },

  /**
   * Gets the ID of this element from the domElement.
   *
   * @returns {string} ID The id of the domElement if it exists.
   */
  getID: function() {
    return this.domElement.id;
  },

  /**
   * @returns {number} The left position (in pixels) of the current element.
   */
  getLeft: function() {
    return this.domElement.getBoundingClientRect().left;
  },

  /**
   * @returns {Prime.Document.Element} This elements next sibling or null.
   */
  getNextSibling: function() {
    var sibling = this.domElement.nextSibling;
    while (sibling !== null && sibling.nodeType !== 1) {
      sibling = sibling.nextSibling;
    }

    if (sibling === null) {
      return null;
    }

    return new Prime.Document.Element(sibling);
  },

  /**
   * The elements offset top in pixels.
   *
   * @returns {number} The offset top.
   */
  getOffsetTop: function() {
    return this.domElement.offsetTop;
  },

  /**
   * Retrieves the opacity value for the Element. This handles the IE alpha filter.
   *
   * @returns {number} The opacity value.
   */
  getOpacity: function() {
    var computedStyle = this.getComputedStyle();
    var opacity = 1.0;
    if (Prime.Browser.name === 'Explorer' && Prime.Browser.version < 9) {
      var filter = computedStyle['filter'];
      if (filter !== undefined && filter !== '') {
        var matches = Prime.Document.Element.ieAlpaRegexp.match(filter);
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
   * @returns {Prime.Document.ElementList} If this element is a select box, this returns the options of the select box in
   *          an ElementList.
   */
  getOptions: function() {
    if (this.getTagName() !== 'SELECT') {
      throw new TypeError('You can only get the options for select elements');
    }

    return new Prime.Document.ElementList(this.domElement.options);
  },

  /**
   * Gets the outer height of the element, including the margins and the border.
   *
   * @returns {number} The outer height of the element.
   */
  getOuterHeight: function() {
    var computedStyle = this.getComputedStyle();
    var offsetHeight = this.domElement.offsetHeight;
    var marginTop = computedStyle['marginTop'];
    var marginBottom = computedStyle['marginBottom'];
    return offsetHeight + Prime.Utils.parseCSSMeasure(marginTop) + Prime.Utils.parseCSSMeasure(marginBottom);
  },

  /**
   * Gets the outer width of the element, including the margins. This does not include the padding or borders.
   *
   * @returns {number} The outer width of the element.
   */
  getOuterWidth: function() {
    var computedStyle = this.getComputedStyle();
    var offsetWidth = this.domElement.offsetWidth;
    var marginLeft = computedStyle['marginLeft'];
    var marginRight = computedStyle['marginRight'];
    return offsetWidth + Prime.Utils.parseCSSMeasure(marginLeft) + Prime.Utils.parseCSSMeasure(marginRight);
  },

  /**
   * @returns {Prime.Document.Element} This elements previous sibling or null.
   */
  getPreviousSibling: function() {
    var sibling = this.domElement.previousSibling;
    while (sibling !== null && sibling.nodeType !== 1) {
      sibling = sibling.previousSibling;
    }

    if (sibling === null) {
      return null;
    }

    return new Prime.Document.Element(sibling);
  },

  /**
   * @returns {number} The right position (in pixels) of the current element.
   */
  getRight: function() {
    return this.domElement.getBoundingClientRect().right;
  },

  /**
   * @returns {number} The scroll top position of this element.
   */
  getScrollTop: function() {
    return this.domElement.scrollTop;
  },

  /**
   * @returns {boolean} True if the element is an option or radio and is selected, otherwise undefined.
   */
  isSelected: function() {
    return this.domElement.selected;
  },

  /**
   * Retrieves the selected texts of this Element, if the element is a select. If it is anything else this returns
   * null.
   *
   * @returns {Array} The texts of this Element.
   */
  getSelectedTexts: function() {
    var texts;
    if (this.domElement.tagName === 'SELECT') {
      texts = [];
      for (var i = 0; i < this.domElement.options.length; i++) {
        if (this.domElement.options[i].selected) {
          texts.push(this.domElement.options[i].text);
        }
      }
    } else {
      texts = null;
    }

    return texts;
  },

  /**
   * Retrieves the values of this Element, if the element is a checkbox or select. If it is anything else this returns
   * null.
   *
   * @returns {Array} The values of this Element.
   */
  getSelectedValues: function() {
    var values;
    if (this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio')) {
      values = [];
      var name = this.domElement.name;
      var form = Prime.Document.queryUp('form', this.domElement);
      Prime.Document.query('input[name=' + name + ']', form).each(function(element) {
        if (element.isChecked()) {
          values.push(element.getValue());
        }
      });
    } else if (this.domElement.tagName === 'SELECT') {
      values = [];
      for (var i = 0; i < this.domElement.length; i++) {
        if (this.domElement.options[i].selected) {
          values.push(this.domElement.options[i].value);
        }
      }
    } else {
      values = null;
    }

    return values;
  },

  /**
   * Gets value of a style attribute.
   *
   * @returns {string} The style value.
   */
  getStyle: function(name) {
    name = Prime.Utils.convertStyleName(name);
    return this.domElement.style[name];
  },

  /**
   * @returns {string} The tag name of this element as a string. This is always uppercase.
   */
  getTagName: function() {
    return this.domElement.tagName;
  },

  /**
   * Retrieves the text content of this Element.
   *
   * @returns {string} The text contents of this Element.
   */
  getTextContent: function() {
    return this.domElement.innerText ? this.domElement.innerText : this.domElement.textContent;
  },

  /**
   * @returns {number} The top position (in pixels) of the current element.
   */
  getTop: function() {
    return this.domElement.getBoundingClientRect().top;
  },

  /**
   * Gets the width of the Element as an integer value. This does not include the borders but does including any scroll
   * bars. This is often called the innerWidth of the element.
   *
   * @returns {number} The height in pixels.
   */
  getWidth: function() {
    var computedStyle = this.getComputedStyle();
    var offsetWidth = this.domElement.offsetWidth;
    var borderLeft = computedStyle['borderLeftWidth'];
    var borderRight = computedStyle['borderRightWidth'];
    return offsetWidth - Prime.Utils.parseCSSMeasure(borderLeft) - Prime.Utils.parseCSSMeasure(borderRight);
  },

  /**
   * Retrieves the value attribute of this Element. This works on all checkboxes, radio buttons, text, text areas, and
   * options. However, this does not retrieve the selected options in a select box, checked checkboxes or checked radio
   * buttons. Use the getSelectedValues function for that.
   *
   * @returns {string} The value of this Element.
   */
  getValue: function() {
    return this.domElement.value;
  },

  /**
   * Returns true if the element has one or all class names
   *
   * @param {string} classNames The class name(s) in a string.
   * @returns {boolean} True if all class names are present.
   */
  hasClass: function(classNames) {
    var currentClassNames = this.domElement.className;
    if (currentClassNames === '') {
      return classNames === '';
    }

    var currentClassNameList = currentClassNames.split(Prime.Utils.spaceRegex);
    var findClassNameList = classNames.split(Prime.Utils.spaceRegex);
    for (var i = 0; i < findClassNameList.length; i++) {
      if (currentClassNameList.indexOf(findClassNameList[i]) === -1) {
        return false;
      }
    }

    return true;
  },

  /**
   * Hides the Element by setting the display style to none.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  hide: function() {
    this.domElement.style.display = 'none';
    return this;
  },

  /**
   * Inserts this Element into the DOM after the given element, removing it from it's parent if it's an existing element.
   *
   * @param {Element} element The element to insert this Element after.
   * @returns {Prime.Document.Element} This Element.
   */
  insertAfter: function(element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
    var parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement.nextSibling);
    } else {
      throw new TypeError('The element you passed into insertAfter is not in the DOM. You can\'t insert a Prime.Document.Element after an element that isn\'t in the DOM yet.');
    }

    return this;
  },

  /**
   * Inserts this Element into the DOM before the given element, removing it from it's parent if it's an existing element.
   *
   * @param {Element} element The element to insert this Element before.
   * @returns {Prime.Document.Element} This Element.
   */
  insertBefore: function(element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
    var parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement);
    } else {
      throw new TypeError('The element you passed into insertBefore is not in the DOM. You can\'t insert a Prime.Document.Element before an element that isn\'t in the DOM yet.');
    }

    return this;
  },

  /**
   * Inserts the given text after this Element.
   *
   * @param {string} text The text to insert.
   * @returns {Prime.Document.Element} This Element.
   */
  insertTextAfter: function(text) {
    if (!this.domElement.parentNode) {
      throw new TypeError('This Element is not currently in the DOM');
    }

    var textNode = document.createTextNode(text);
    this.domElement.parentNode.insertBefore(textNode, this.domElement.nextSibling);

    return this;
  },

  /**
   * Inserts the given text before this Element.
   *
   * @param {string} text The text to insert.
   * @returns {Prime.Document.Element} This Element.
   */
  insertTextBefore: function(text) {
    if (!this.domElement.parentNode) {
      throw new TypeError('This Element is not currently in the DOM');
    }

    var textNode = document.createTextNode(text);
    this.domElement.parentNode.insertBefore(textNode, this.domElement);

    return this;
  },

  /**
   * Returns true if the element matches the provided selector.
   *
   * @param {string} selector to match against the Element
   * @returns {boolean} True if the element matches the selector, false if it does not match the selector.
   */
  is: function(selector) {
    return this.domElement.matches(selector);
  },

  /**
   * Returns whether or not the element is checked. If the element is not a checkbox or a radio this returns false.
   *
   * @returns {boolean} True if the element is selected, false if it isn't or is not a checkbox or a radio.
   */
  isChecked: function() {
    return this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio') && this.domElement.checked;
  },

  /**
   * Determines if this element is a child of the given element.
   *
   * @param {Prime.Document.Element|Node} element The element to check to see if this element is a child of.
   * @returns {boolean} True if this element is a child of the given element, false otherwise.
   */
  isChildOf: function(element) {
    var domElement = element instanceof Prime.Document.Element ? element.domElement : element;
    var parent = this.domElement.parentNode;
    while (domElement !== parent && parent !== null) {
      parent = parent.parentNode;
    }

    return domElement === parent;
  },

  /**
   * @returns {boolean} Whether or not this element is disabled according to the disabled property.
   */
  isDisabled: function() {
    return this.domElement.disabled;
  },

  /**
   * @returns {boolean} True if this element has focus.
   */
  isFocused: function() {
    return document.activeElement === this.domElement;
  },

  /**
   * Returns whether or not the element is selected. If the element is not an option this returns false.
   *
   * @returns {boolean} True if the element is selected, false if it isn't or is not an option.
   */
  isSelected: function() {
    return this.domElement.tagName === 'OPTION' && this.domElement.selected;
  },

  /**
   * Determines if the element is visible using its display and visibility styles.
   *
   * @returns {boolean} True if the element is visible, false otherwise. This might return an invalid value if the element
   * is absolutely positioned and off the screen, but is still technically visible.
   */
  isVisible: function() {
    var computedStyle = this.getComputedStyle();
    return computedStyle['display'] !== 'none' && computedStyle['visibility'] !== 'hidden';
  },

  /**
   * Returns this element's parent as  Prime.Document.Element.
   *
   * @returns {Prime.Document.Element} this element's parent or null if there is no parent
   */
  parent: function() {
    if (this.domElement.parentNode !== null) {
      return new Prime.Document.Element(this.domElement.parentNode);
    } else {
      return null;
    }
  },

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM inside at the very beginning of the given
   * element.
   *
   * @param {Element} element The element to insert this Element into.
   * @returns {Prime.Document.Element} This Element.
   */
  prependTo: function(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw new TypeError('You can only insert new Prime.Document.Elements for now');
    }

    var domElement = (element instanceof Prime.Document.Element) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.insertBefore(this.domElement, domElement.firstChild);
    } else {
      throw new TypeError('The element you passed into prependTo is not in the DOM. You can\'t insert a Prime.Document.Element inside an element that isn\'t in the DOM yet.');
    }

    return this;
  },

  /**
   * Queries the DOM using the given selector starting at this element and returns all the matched elements.
   *
   * @param {string} selector The selector.
   * @returns {Prime.Document.ElementList} An element list.
   */
  query: function(selector) {
    return Prime.Document.query(selector, this);
  },

  /**
   * Queries the DOM using the given selector starting at this element and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @returns {Prime.Document.Element} An element or null.
   */
  queryFirst: function(selector) {
    return Prime.Document.queryFirst(selector, this);
  },

  /**
   * Queries the DOM using the given selector starting at this element and returns the last matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @returns {Prime.Document.Element} An element or null.
   */
  queryLast: function(selector) {
    return Prime.Document.queryLast(selector, this);
  },

  /**
   * Traverses up the DOM from this element and looks for a match to the selector.
   *
   * @param {string} selector The selector.
   * @returns {Prime.Document.Element} An element or null.
   */
  queryUp: function(selector) {
    return Prime.Document.queryUp(selector, this);
  },

  /**
   * Removes all of the event listeners for the given element.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  removeAllEventListeners: function() {
    for (event in this.domElement.eventListeners) {
      if (this.domElement.eventListeners.hasOwnProperty(event)) {
        for (var i = 0; i < this.domElement.eventListeners[event].length; i++) {
          var listener = this.domElement.eventListeners[event][i];
          var proxy = listener.primeProxy ? listener.primeProxy : listener;
          this._internalRemoveEventListener(event, proxy);
        }
      }
    }

    this.domElement.eventListeners = {};

    return this;
  },

  /**
   * Removes an attribute from the Element
   *
   * @param {string} name The name of the attribute.
   * @returns {Prime.Document.Element} This Element.
   */
  removeAttribute: function(name) {
    this.domElement.removeAttribute(name);
    return this;
  },

  /**
   * Removes the given class (or list of space separated classes) from this Element.
   *
   * @param {string} classNames The class name(s).
   * @returns {Prime.Document.Element} This Element.
   */
  removeClass: function(classNames) {
    var currentClassName = this.domElement.className;
    if (currentClassName === '') {
      return this;
    }

    var currentClassNameList = currentClassName.split(Prime.Utils.spaceRegex);
    var removeClassNameList = classNames.split(Prime.Utils.spaceRegex);
    for (var i = 0; i < removeClassNameList.length; i++) {
      Prime.Utils.removeFromArray(currentClassNameList, removeClassNameList[i]);
    }

    this.domElement.className = currentClassNameList.join(' ');
    return this;
  },

  /**
   * Removes an event listener for a specific event from this Element, you must have attached using addEventListener
   *
   * @param {string} event The name of the event.
   * @param {*} listener The event listener that was bound.
   * @returns {Prime.Document.Element} This Element.
   */
  removeEventListener: function(event, listener) {
    var proxy = listener.primeProxy ? listener.primeProxy : listener;
    var listeners = this.domElement.eventListeners[event];
    if (listeners) {
      Prime.Utils.removeFromArray(listeners, proxy);
    }

    this._internalRemoveEventListener(event, proxy);

    return this;
  },

  /**
   * Removes all of the event listeners for the given event from this element.
   *
   * @param {string} event The name of the event to remove the listeners for.
   * @returns {Prime.Document.Element} This Element.
   */
  removeEventListeners: function(event) {
    if (this.domElement.eventListeners[event]) {
      for (var i = 0; i < this.domElement.eventListeners[event].length; i++) {
        var listener = this.domElement.eventListeners[event][i];
        var proxy = listener.primeProxy ? listener.primeProxy : listener;
        this._internalRemoveEventListener(event, proxy);
      }

      delete this.domElement.eventListeners[event];
    }

    return this;
  },

  /**
   * Removes this Element from the DOM. If the Element isn't in the DOM this does nothing.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  removeFromDOM: function() {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    return this;
  },

  /**
   * Scrolls this element to the given position.
   *
   * @param {number} position The position to scroll the element to.
   * @returns {Prime.Document.Element} This Element.
   */
  scrollTo: function(position) {
    this.domElement.scrollTop = position;
    return this;
  },

  /**
   * Scrolls this element to the bottom.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  scrollToBottom: function() {
    this.domElement.scrollTop = this.domElement.scrollHeight;
    return this;
  },

  /**
   * Scrolls this element to the top.
   *
   * @returns {Prime.Document.Element} This Element.
   */
  scrollToTop: function() {
    this.domElement.scrollTop = 0;
    return this;
  },

  /**
   * Sets an attribute of the Element.
   *
   * @param {string} name The attribute name
   * @param {number|string} value The attribute value
   * @returns {Prime.Document.Element} This Element.
   */
  setAttribute: function(name, value) {
    if (typeof value === "number") {
      value = value.toString();
    }
    if (this.domElement.setAttribute) {
      this.domElement.setAttribute(name, value);
    } else {
      var attribute = document.createAttribute(name);
      attribute.nodeValue = value;
      this.domElement.setAttributeNode(attribute);
    }

    return this;
  },

  /**
   * Sets multiple attributes of the Element from the hash
   *
   * @param {Object} attributes An object of key value style pairs.
   * @returns {Prime.Document.Element} This Element.
   */
  setAttributes: function(attributes) {
    for (key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  },

  /**
   * If this element is a checkbox or radio button, this sets the checked field on the DOM object equal to the given
   * value.
   *
   * @param {boolean} value The value to set the checked state of this element to.
   * @returns {Prime.Document.Element} This Element.
   */
  setChecked: function(value) {
    this.domElement.checked = value;
    return this;
  },

  /**
   * Sets if this element is disabled or not. This works with any element that responds to the disabled property.
   *
   * @param {boolean} value The value to set the disabled state of this element to.
   * @returns {Prime.Document.Element} This Element.
   */
  setDisabled: function(value) {
    this.domElement.disabled = value;
    return this;
  },

  /**
   * Sets the height of this element using the height style.
   *
   * @param {number|string} height The new height as a number (for pixels) or string.
   * @returns {Prime.Document.Element} This Element.
   */
  setHeight: function(height) {
    if (typeof(height) == 'number') {
      height = height + 'px';
    }

    this.setStyle('height', height);
    return this;
  },

  /**
   * Sets the inner HTML content of the Element.
   *
   * @param {string|Prime.Document.Element} newHTML The new HTML content for the Element.
   * @returns {Prime.Document.Element} This Element.
   */
  setHTML: function(newHTML) {
    if (newHTML !== null) {
      if (newHTML instanceof Prime.Document.Element) {
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
   * @param {string} id The ID.
   * @returns {Prime.Document.Element} This Element.
   */
  setID: function(id) {
    this.domElement.id = id;
    return this;
  },

  /**
   * Sets left position of the element.
   *
   * @param {number|string} left The left position of the element in pixels or as a string.
   * @returns {Prime.Document.Element} This Element.
   */
  setLeft: function(left) {
    var leftString = left;
    if (typeof(left) === 'number') {
      leftString = left + 'px';
    }

    this.setStyle('left', leftString);
    return this;
  },

  /**
   * Sets the opacity of the element. This also sets the IE alpha filter for IE version 9 or younger.
   *
   * @param {number} opacity The opacity.
   * @returns {Prime.Document.Element} This Element.
   */
  setOpacity: function(opacity) {
    if (Prime.Browser.name === 'Explorer' && Prime.Browser.version < 9) {
      this.domElement.style.filter = 'alpha(opacity=' + opacity + ')';
    } else {
      this.domElement.style.opacity = opacity;
    }

    return this;
  },

  /**
   * Sets the selected value on the element. If the element is not an option or radio, this does nothing.
   *
   * @param {boolean} selected Selected value.
   */
  setSelected: function(selected) {
    this.domElement.selected = selected;
  },

  /**
   * Sets the selected value(s) of this element. This works on selects, checkboxes, and radio buttons.
   *
   * @param {string} [arguments] The value(s) to select (var args).
   * @returns {Prime.Document.Element} This Element.
   */
  setSelectedValues: function() {
    // Handle the case where they passed in an array
    var values = null;
    if (arguments.length === 1 && Prime.Utils.isArray(arguments[0])) {
      values = arguments[0];
    } else {
      values = Array.prototype.slice.call(arguments, 0);
    }

    if (this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio')) {
      var name = this.domElement.name;
      var form = Prime.Document.queryUp('form', this.domElement);
      Prime.Document.query('input[name=' + name + ']', form).each(function(element) {
        element.setChecked(values.indexOf(element.getValue()) !== -1);
      });
    } else if (this.domElement.tagName === 'SELECT') {
      for (var i = 0; i < this.domElement.length; i++) {
        this.domElement.options[i].selected = values.indexOf(this.domElement.options[i].value) !== -1;
      }
    }

    return this;
  },

  /**
   * Sets the style for the name of this Element.
   *
   * @param {string} name The style name.
   * @param {number|string} value The style value.
   * @returns {Prime.Document.Element} This Element.
   */
  setStyle: function(name, value) {
    if (typeof value === "number") {
      value = value.toString();
    }
    this.domElement.style[name] = value;
    return this;
  },

  /**
   * Sets multiple styles of this Element.
   *
   * @param {Object} styles An object with key value pairs for the new style names and values.
   * @returns {Prime.Document.Element} This Element.
   */
  setStyles: function(styles) {
    for (key in styles) {
      if (styles.hasOwnProperty(key)) {
        this.setStyle(key, styles[key]);
      }
    }
    return this;
  },

  /**
   * Sets top position of the element.
   *
   * @param {number|string} top The top position of the element in pixels or as a string.
   * @returns {Prime.Document.Element} This Element.
   */
  setTop: function(top) {
    var topString = top;
    if (typeof(top) === 'number') {
      topString = top + 'px';
    }

    this.setStyle('top', topString);
    return this;
  },

  /**
   * Sets the value of this Element. This handles checkboxes, radio buttons, options, text inputs and text areas. This
   * works on checkboxes and radio buttons, but it change the value attribute on them rather than checking and unchecking
   * the buttons themselves. To check and uncheck the buttons, use the select method.
   *
   * @param {string} value The new value.
   * @returns {Prime.Document.Element} This Element.
   */
  setValue: function(value) {
    this.domElement.value = value;
    return this;
  },

  /**
   * Sets the width of this element using the height style.
   *
   * @param {number|string} width The new width as a number (for pixels) or string.
   * @returns {Prime.Document.Element} This Element.
   */
  setWidth: function(width) {
    if (typeof(width) == 'number') {
      width = width + 'px';
    }

    this.setStyle('width', width);
    return this;
  },

  /**
   * Shows the Element by setting the display style first to empty string. After this, the elements computed style is
   * checked to see if the element is still not visible. If that is true, the element must have a CSS style defined in
   * a stylesheet that is setting it to display: none. In this case, we determine if the element is a block level element
   * and either set the display to 'block' or 'inline'.
   *
   * @param {string} [displayValue] The display value to use for the show. This defaults to the W3C standard display
   * setting depending on the type of element you are showing. For example, INPUT is inline and DIV is block.
   * @returns {Prime.Document.Element} This Element.
   */
  show: function(displayValue) {
    if (typeof(displayValue) !== 'undefined') {
      this.domElement.style.display = displayValue;
      return this;
    }

    this.domElement.style.display = '';

    var computedDisplay = this.getComputedStyle()['display'];
    if (computedDisplay === 'none') {
      if (typeof(displayValue) === 'undefined') {
        displayValue = (Prime.Document.Element.blockElementRegexp.test(this.domElement.tagName)) ? 'block' : 'inline';
      }

      this.domElement.style.display = displayValue;
    }

    return this;
  },

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Changes a style property iteratively over a given period of time from one value to another value.
   *
   * @param {Object} config The configuration object for the iteration. This must contain the name of the style property
   *        being changed, the units of the property (px, em, etc), the defaultStartValue if the element doesn't have the
   *        style already, the end value, the duration, and the number of iterations.
   * @param {Function} [endFunction] Optional end function to call.
   * @param {Object} [context] Optional context for the function calls.
   * @private
   */
  _changeNumberStyleIteratively: function(config, endFunction, context) {
    var domElement = this.domElement;
    var currentValue = (domElement.style[config.name]) ? (domElement.style[config.name]) : config.defaultStartValue;
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

      domElement.style[config.name] = currentValue + config.units;

      // Handle the special opacity case for IE
      if (config.name === 'opacity') {
        domElement.style.filter = 'alpha(opacity=' + currentValue + config.units + ')';
      }
    };

    Prime.Utils.callIteratively(config.duration, config.iterations, stepFunction, endFunction, context);
  },

  /**
   * Removes the event listener proxy from this element.
   *
   * @param {string} event The event name.
   * @param {Function} proxy The proxy function.
   * @private
   */
  _internalRemoveEventListener: function(event, proxy) {
    if (event.indexOf(':') === -1) {
      // Traditional event
      if (this.domElement.removeEventListener) {
        this.domElement.removeEventListener(event, proxy, false);
      } else if (this.domElement.detachEvent) {
        this.domElement.detachEvent('on' + event, proxy);
      } else {
        throw new TypeError('Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available');
      }
    } else if (this.domElement.customEventListeners[event]) {
      // Custom event
      var customListeners = this.domElement.customEventListeners[event];
      Prime.Utils.removeFromArray(customListeners, proxy);
    }
  }
};


/* ===================================================================================================================
 * Polyfill
 * ===================================================================================================================*/

(function() {
  if (!Element.prototype.matches) {

    Element.prototype.matches = function(selector) {
      var domElement = this;
      var matches = (domElement.parentNode || domElement.document).querySelectorAll(selector);
      var i = 0;

      while (matches[i] && matches[i] !== domElement) {
        i++;
      }

      return matches[i] ? true : false;
    };
  }
})();
