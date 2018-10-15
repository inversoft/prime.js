/*
 * Copyright (c) 2017-2018, Inversoft Inc., All Rights Reserved
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

import {Browser} from "../Browser";
import {PrimeDocument} from "../PrimeDocument";
import {PrimeElementList} from "./PrimeElementList";
import {Utils} from "../Utils";

const blockElementRegexp = /^(?:ARTICLE|ASIDE|BLOCKQUOTE|BODY|BR|BUTTON|CANVAS|CAPTION|COL|COLGROUP|DD|DIV|DL|DT|EMBED|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HGROUP|HR|LI|MAP|OBJECT|OL|OUTPUT|P|PRE|PROGRESS|SECTION|TABLE|TBODY|TEXTAREA|TFOOT|TH|THEAD|TR|UL|VIDEO)$/;
const mouseEventsRegexp = /^(?:click|dblclick|mousedown|mouseup|mouseover|mousemove|mouseout|mouseenter|mouseleave)$/;
const htmlEventsRegexp = /^(?:abort|blur|change|error|focus|load|reset|resize|scroll|select|submit|unload)$/;
let anonymousId = 1;
const ieAlphaRegexp = /alpha\(opacity=(.+)\)/;

class PrimeElement {
  /**
   * Creates an Element class for the given DOM element.
   *
   * @constructor
   * @param {Element|EventTarget} element The element
   */
  constructor(element) {
    if (!Utils.isDefined(element.nodeType) || element.nodeType !== 1) {
      throw new TypeError('You can only pass in DOM element Node objects to the PrimeDocument.Element constructor');
    }

    Utils.bindAll(this);
    this.domElement = element;
    this.domElement.customEventListeners = [];
    this.domElement.eventListeners = {};
  }

  /**
   * Regular expression that captures the tagnames of all the block elements in HTML5.
   *
   * @type {RegExp}
   */
  static get blockElementRegexp() {
    return blockElementRegexp;
  }

  static get mouseEventsRegexp() {
    return mouseEventsRegexp;
  }

  static get htmlEventsRegexp() {
    return htmlEventsRegexp;
  }

  static get anonymousId() {
    return anonymousId;
  }

  static set anonymousId(value) {
    anonymousId = value;
  }

  static get ieAlphaRegexp() {
    return ieAlphaRegexp;
  }

  /**
   * Static method that wraps an element in a PrimeElement unless it is already wrapped. In that case, it simply
   * returns the element.
   *
   * @param {PrimeElement|Element|EventTarget} element The element to wrap.
   * @static
   */
  static wrap(element) {
    return (element instanceof PrimeElement) ? element : new PrimeElement(element);
  }

  /**
   * Static method that unwraps an element to a DOM element. This is the inverse of Element.wrap. If this is passed an
   * Element, it returns domElement. Otherwise, this just returns the element.
   *
   * @returns {PrimeElement} This Element.
   */
  static unwrap(element) {
    return (element instanceof PrimeElement) ? element.domElement : element;
  }

  /**
   * Adds the given class (or list of space separated classes) to this Element.
   *
   * @param {string} classNames The class name(s) separated by a space.
   * @returns {PrimeElement} This Element.
   */
  addClass(classNames) {
    let currentClassName = this.domElement.className;
    if (currentClassName === '') {
      currentClassName = classNames;
    } else {
      const currentClassNameList = this.domElement.className.split(Utils.spaceRegex);
      const newClassNameList = classNames.split(Utils.spaceRegex);
      for (let i = 0; i < newClassNameList.length; i++) {
        if (currentClassNameList.indexOf(newClassNameList[i]) === -1) {
          currentClassNameList.push(newClassNameList[i]);
        }
      }

      currentClassName = currentClassNameList.join(' ');
    }

    this.domElement.className = currentClassName;
    return this;
  }

  /**
   * Attaches an event listener to the element and will only invoke the listener when the event target matches
   * the provided selector.
   *
   * The intent of this function is to provide a delegated listener and handle events from nested elements.
   *
   * @param {string} event The name of the event
   * @param  {string} selector The selector to match against the Element
   * @param {Function} listener The event listener function
   */
  addDelegatedEventListener(event, selector, listener) {
    addEventListener(event, function(event) {
      if (event.target.matches(selector)) {
        listener(event);
      }
    });
  }

  /**
   * Attaches an event listener to this Element.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event listener function.
   * @returns {PrimeElement} This Element.
   */
  addEventListener(event, listener) {
    if (event.indexOf(':') === -1) {
      // Traditional event
      this.domElement.eventListeners = this.domElement.eventListeners || {};
      this.domElement.eventListeners[event] = this.domElement.eventListeners[event] || [];
      if (this.domElement.eventListeners[event].indexOf(listener) === -1) {
        this.domElement.eventListeners[event].push(listener);
      }
      this.domElement.addEventListener(event, listener, false);
    } else {
      // Custom event
      this.domElement.customEventListeners = this.domElement.customEventListeners || {};
      this.domElement.customEventListeners[event] = this.domElement.customEventListeners[event] || [];
      if (this.domElement.customEventListeners[event].indexOf(listener) === -1) {
        this.domElement.customEventListeners[event].push(listener);
      }
    }

    return this;
  }

  /**
   * Appends the given element to this element. If the given element already exists in the DOM, it is removed from its
   * current location and placed at the end of this element.
   *
   * @param {PrimeElement|Node} element The element to append.
   * @returns {PrimeElement} This Element.
   */
  appendElement(element) {
    const domElement = (element instanceof PrimeElement) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }

    this.domElement.appendChild(domElement);
    return this;
  }

  /**
   * Appends the given HTML string to this element.
   *
   * @param {string} html The HTML to append.
   * @returns {PrimeElement} This Element.
   */
  appendHTML(html) {
    this.domElement.insertAdjacentHTML('beforeend', html);
    return this;
  }

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM inside at the very end of the given
   * element.
   *
   * @param {PrimeElement|Node} element The element to insert this Element into.
   * @returns {PrimeElement} This Element.
   */
  appendTo(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw new TypeError('You can only insert new PrimeElements for now');
    }

    const domElement = (element instanceof PrimeElement) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.appendChild(this.domElement);
    } else {
      throw new TypeError('The element you passed into appendTo is not in the DOM. You can\'t insert a PrimeElement inside an element that isn\'t in the DOM yet.');
    }

    return this;
  }

  /**
   * Fires an event on the Element.
   *
   * @param {string} event The name of the event.
   * @param {Object} [memo] Assigned to the memo field of the event.
   * @param {Object} [target] The target.
   * @param {boolean} [bubbling] If the event is bubbling, defaults to true.
   * @param {boolean} [cancelable] If the event is cancellable, defaults to true.
   * @returns {PrimeElement} This Element.
   */
  fireEvent(event, memo, target, bubbling, cancelable) {
    memo = Utils.isDefined(memo) ? memo : {};
    target = Utils.isDefined(target) ? target : this;
    bubbling = Utils.isDefined(bubbling) ? bubbling : true;
    cancelable = Utils.isDefined(cancelable) ? cancelable : true;

    let evt;
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
        if (PrimeElement.mouseEventsRegexp.exec(event)) {
          evt = document.createEvent("MouseEvents");
          evt.initMouseEvent(event, bubbling, cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        } else if (PrimeElement.htmlEventsRegexp.exec(event)) {
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
      evt = {event: event, memo: memo, target: target};
      for (let index in this.domElement.customEventListeners[event]) {
        if (this.domElement.customEventListeners[event].hasOwnProperty(index)) {
          this.domElement.customEventListeners[event][index](evt);
        }
      }
    }

    return this;
  }

  /**
   * Fires a custom event on the Element using the given event object rather than creating a new event object. This is
   * useful for pass-through event handling.
   *
   * @param {string} event The name of the event.
   * @param {Object} eventObj The event object to pass to the handlers.
   * @returns {PrimeElement} This Element.
   */
  fireCustomEvent(event, eventObj) {
    eventObj = Utils.isDefined(eventObj) ? eventObj : {};
    if (event.indexOf(':') === -1) {
      throw new TypeError('This method can only be used for custom events');
    }

    // Custom event
    this.domElement.customEventListeners[event] = this.domElement.customEventListeners[event] || [];
    for (let index in this.domElement.customEventListeners[event]) {
      if (this.domElement.customEventListeners[event].hasOwnProperty(index)) {
        this.domElement.customEventListeners[event][index](eventObj);
      }
    }

    return this;
  }

  /**
   * Puts the focus on this element.
   *
   * @returns {PrimeElement} This Element.
   */
  focus() {
    this.domElement.focus();
    return this;
  }

  /**
   * Returns the absolute top of this element relative to the document.
   *
   * @returns {number} The number of pixels that this element is from the top of the document.
   */
  getAbsoluteTop() {
    let top = 0;
    let e = this.domElement;
    while (e) {
      top += e.offsetTop;
      e = e.offsetParent;
    }

    return top;
  }

  /**
   * Returns the value of the given attribute.
   *
   * @param {string} name The attribute name.
   * @returns {string} This attribute value or null.
   */
  getAttribute(name) {
    const attr = this.domElement.attributes.getNamedItem(name);
    if (attr) {
      return attr.value;
    }

    return null;
  }

  /**
   * Returns all of the attributes on the element as an object.
   *
   * @returns {object} This attributes or an empty object if there are no attributes on this element.
   */
  getAttributes() {
    const attrs = {};
    if (this.domElement.hasAttributes()) {
      for (let i = 0; i < this.domElement.attributes.length; i++) {
        attrs[this.domElement.attributes[i].name] = this.domElement.attributes[i].value;
      }
    }

    return attrs;
  }

  /**
   * Gets the viewable height of the Element as an integer value in pixels. This height includes border, padding and scroll bar but excludes the margins.
   *
   * @returns {number} The height as pixels (number) or a string.
   */
  getBorderedHeight() {
    return this.domElement.offsetHeight;
  }

  /**
   * Gets the width of the Element as an integer value. This width includes border, padding and scroll bar but excludes the margins.
   *
   * @returns {number} The height in pixels.
   */
  getBorderedWidth() {
    return this.domElement.offsetWidth;
  }

  /**
   * @returns {number} The bottom position (in pixels) of the current element.
   */
  getBottom() {
    return this.domElement.getBoundingClientRect().bottom;
  }

  /**
   * Gets the children elements of this Element, optionally reduced to those matching the optional selector.
   *
   * @param {string} [selector] The selector. Optional, if not provided all children will be returned.
   * @returns {PrimeElementList} The children.
   */
  getChildren(selector) {
    if (!Utils.isDefined(selector)) {
      return new PrimeElementList(this.domElement.children);
    }

    const matched = [];
    for (let i = 0; i < this.domElement.children.length; i++) {
      const child = this.domElement.children[i];
      if (child.matches(selector)) {
        matched.push(child);
      }
    }

    return new PrimeElementList(matched);
  }

  /**
   * Gets the class value of the current element. This might be a single class or multiple class names.
   *
   * @returns {string} The class.
   */
  getClass() {
    return this.domElement.className;
  }

  /**
   * Gets the computed style information for this Element.
   *
   * @returns {IEElementStyle|CSSStyleDeclaration} The style information.
   */
  getComputedStyle() {
    return (this.domElement.currentStyle) ? this.domElement.currentStyle : document.defaultView.getComputedStyle(this.domElement, null);
  }

  /**
   * Calculates the location of this element with respect to the document rather than the elements parent, offset parent
   * or scroll position.
   *
   * @returns {{top: number, left: number}}
   */
  getCoordinates() {
    const box = this.domElement.getBoundingClientRect();

    const body = document.body;
    const documentElement = document.documentElement;

    const scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;

    const clientTop = documentElement.clientTop || body.clientTop || 0;
    const clientLeft = documentElement.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return {top: Math.round(top), left: Math.round(left)};
  }

  /**
   * Returns the dataset if it exists, otherwise, this creates a new dataset object and returns it.
   *
   * @returns {object} This dataset object.
   */
  getDataSet() {
    if (this.domElement.dataset) {
      return this.domElement.dataset;
    }

    this.domElement.dataset = {};
    const attrs = this.getAttributes();
    for (let prop in attrs) {
      if (attrs.hasOwnProperty(prop) && prop.indexOf('data-') === 0) {
        const dataName = prop.substring(5).replace(/-([a-z])/g, function(g) {
          return g[1].toUpperCase();
        });
        this.domElement.dataset[dataName] = attrs[prop];
      }
    }
    return this.domElement.dataset;
  }

  /**
   * Returns the data value if it exists, otherwise returns null.
   *
   * @param {string} name The attribute name.
   * @returns {string} This attribute value or null.
   */
  getDataAttribute(name) {
    return this.getDataSet()[name] || null;
  }

  /**
   * Get the first child element of this Element, optionally filtered using the optional selector.
   *
   * @param {string} [selector] The selector. Optional.
   * @returns {PrimeElement} The first child element or null if the element has no children or a selector was provided and nothing matched the selector..
   */
  getFirstChild(selector) {
    const lastChild = this.getChildren(selector)[0];
    if (!Utils.isDefined(lastChild)) {
      return null;
    }
    return lastChild;
  }

  /**
   * Gets the viewable height of the Element as an integer value in pixels. This height includes padding and scroll bar
   * but excludes the margin and borders. This is often called the innerHeight of the element.
   *
   * @returns {number} The height as pixels (number) or a string.
   */
  getHeight() {
    const computedStyle = this.getComputedStyle();
    const offsetHeight = this.domElement.offsetHeight;
    const borderTop = computedStyle['borderTopWidth'];
    const borderBottom = computedStyle['borderBottomWidth'];
    return offsetHeight - Utils.parseCSSMeasure(borderTop) - Utils.parseCSSMeasure(borderBottom);
  }

  /**
   * Gets the inner HTML content of the Element.
   *
   * @returns {string} The HTML content.
   */
  getHTML() {
    return this.domElement.innerHTML;
  }

  /**
   * Gets the ID of this element from the domElement.
   *
   * @returns {string} ID The id of the domElement if it exists.
   */
  getId() {
    return this.domElement.id;
  }

  /**
   * Get the last child element of this Element, optionally filtered using the optional selector.
   *
   * @param {string} [selector] The selector. Optional.
   * @returns {PrimeElement} The last child element or null if the element has no children or a selector was provided and nothing matched the selector..
   */
  getLastChild(selector) {
    const elementList = this.getChildren(selector);
    if (elementList.length > 0) {
      return elementList[elementList.length - 1];
    }
    return null;
  }

  /**
   * @returns {number} The left position (in pixels) of the current element.
   */
  getLeft() {
    return this.domElement.getBoundingClientRect().left;
  }

  /**
   * @returns {PrimeElement} This elements next sibling or null.
   */
  getNextSibling() {
    let sibling = this.domElement.nextSibling;
    while (sibling !== null && sibling.nodeType !== 1) {
      sibling = sibling.nextSibling;
    }

    if (sibling === null) {
      return null;
    }

    return new PrimeElement(sibling);
  }

  /**
   * The elements offset left in pixels.
   *
   * @returns {number} The offset left.
   */
  getOffsetLeft() {
    return this.domElement.offsetLeft;
  }

  /**
   * The elements offset top in pixels.
   *
   * @returns {number} The offset top.
   */
  getOffsetTop() {
    return this.domElement.offsetTop;
  }

  /**
   * Retrieves the opacity value for the Element. This handles the IE alpha filter.
   *
   * @returns {number} The opacity value.
   */
  getOpacity() {
    const computedStyle = this.getComputedStyle();
    let opacity = 1.0;
    if (Browser.name === 'Explorer' && Browser.version < 9) {
      const filter = computedStyle['filter'];
      if (filter !== undefined && filter !== '') {
        const matches = PrimeElement.ieAlphaRegexp.match(filter);
        if (matches.length > 0) {
          opacity = parseFloat(matches[0]);
        }
      }
    } else {
      opacity = parseFloat(computedStyle['opacity']);
    }

    return opacity;
  }

  /**
   * @returns {PrimeElementList} If this element is a select box, this returns the options of the select box in
   *          an ElementList.
   */
  getOptions() {
    if (this.getTagName() !== 'SELECT') {
      throw new TypeError('You can only get the options for select elements');
    }

    return new PrimeElementList(this.domElement.options);
  }

  /**
   * Gets the outer height of the element, including the margins. This does not include the padding or borders.
   *
   * @returns {number} The outer height of the element.
   */
  getOuterHeight() {
    const computedStyle = this.getComputedStyle();
    const offsetHeight = this.domElement.offsetHeight;
    const marginTop = computedStyle['marginTop'];
    const marginBottom = computedStyle['marginBottom'];
    return offsetHeight + Utils.parseCSSMeasure(marginTop) + Utils.parseCSSMeasure(marginBottom);
  }

  /**
   * Gets the outer HTML content of the Element.
   *
   * @returns {string} The outer HTML content.
   */
  getOuterHTML() {
    return this.domElement.outerHTML;
  }

  /**
   * Gets the outer width of the element, including the margins. This does not include the padding or borders.
   *
   * @returns {number} The outer width of the element.
   */
  getOuterWidth() {
    const computedStyle = this.getComputedStyle();
    const offsetWidth = this.domElement.offsetWidth;
    const marginLeft = computedStyle['marginLeft'];
    const marginRight = computedStyle['marginRight'];
    return offsetWidth + Utils.parseCSSMeasure(marginLeft) + Utils.parseCSSMeasure(marginRight);
  }

  /**
   * Returns this element's parent as a PrimeElement.
   *
   * @returns {PrimeElement} This element's parent or null if there is no parent
   */
  getParent() {
    if (Utils.isDefined(this.domElement.parentElement)) {
      return new PrimeElement(this.domElement.parentElement);
    } else {
      return null;
    }
  }

  /**
   * @returns {PrimeElement} This elements previous sibling or null.
   */
  getPreviousSibling() {
    let sibling = this.domElement.previousSibling;
    while (sibling !== null && sibling.nodeType !== 1) {
      sibling = sibling.previousSibling;
    }

    if (sibling === null) {
      return null;
    }

    return new PrimeElement(sibling);
  }

  /**
   * @returns {number} The zIndex style of this element based on the element or the first positioned parent.
   */
  getRelativeZIndex() {
    let e = this;
    while (e !== null && e.getComputedStyle()['zIndex'] === 'auto') {
      e = e.getParent();
    }
    return e === null ? 0 : parseInt(e.getComputedStyle()['zIndex']);
  }

  /**
   * @returns {number} The right position (in pixels) of the current element.
   */
  getRight() {
    return this.domElement.getBoundingClientRect().right;
  }

  /**
   * @returns {number} The scroll height of this element.
   */
  getScrollHeight() {
    return this.domElement.scrollHeight;
  }

  /**
   * @returns {number} The scroll left position of this element.
   */
  getScrollLeft() {
    return this.domElement.scrollLeft;
  }

  /**
   * @returns {number} The scroll top position of this element.
   */
  getScrollTop() {
    return this.domElement.scrollTop;
  }

  /**
   * @returns {number} The scroll width of this element.
   */
  getScrollWidth() {
    return this.domElement.scrollWidth;
  }

  /**
   * Retrieves the selected texts of this Element, if the element is a select. If it is anything else this returns
   * null.
   *
   * @returns {Array} The texts of this Element.
   */
  getSelectedTexts() {
    let texts;
    if (this.domElement.tagName === 'SELECT') {
      texts = [];
      for (let i = 0; i < this.domElement.options.length; i++) {
        if (this.domElement.options[i].selected) {
          texts.push(this.domElement.options[i].text);
        }
      }
    } else {
      texts = null;
    }

    return texts;
  }

  /**
   * Retrieves the values of this Element, if the element is a checkbox or select. If it is anything else this returns
   * null.
   *
   * @returns {Array} The values of this Element.
   */
  getSelectedValues() {
    let values;
    if (this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio')) {
      values = [];
      const name = this.domElement.name;
      const form = PrimeDocument.queryUp('form', this.domElement);
      PrimeDocument.query('input[name="' + name + '"]', form).each(function(element) {
        if (element.isChecked()) {
          values.push(element.getValue());
        }
      });
    } else if (this.domElement.tagName === 'SELECT') {
      values = [];
      for (let i = 0; i < this.domElement.length; i++) {
        if (this.domElement.options[i].selected) {
          values.push(this.domElement.options[i].value);
        }
      }
    } else {
      values = null;
    }

    return values;
  }

  /**
   * Gets value of a style attribute.
   *
   * @returns {string} The style value.
   */
  getStyle(name) {
    name = Utils.convertStyleName(name);
    return this.domElement.style[name];
  }

  /**
   * @returns {string} The tag name of this element as a string. This is always uppercase.
   */
  getTagName() {
    return this.domElement.tagName;
  }

  /**
   * Retrieves the text content of this Element.
   *
   * @returns {string} The text contents of this Element.
   */
  getTextContent() {
    return this.domElement.innerText ? this.domElement.innerText : this.domElement.textContent;
  }

  /**
   * @returns {number} The top position (in pixels) of the current element.
   */
  getTop() {
    return this.domElement.getBoundingClientRect().top;
  }

  /**
   * Gets the width of the Element as an integer value. This width includes padding and scroll bar but excludes the margin and borders.
   * This is often called the innerWidth of the element.
   *
   * @returns {number} The height in pixels.
   */
  getWidth() {
    const computedStyle = this.getComputedStyle();
    const offsetWidth = this.domElement.offsetWidth;
    const borderLeft = computedStyle['borderLeftWidth'];
    const borderRight = computedStyle['borderRightWidth'];
    return offsetWidth - Utils.parseCSSMeasure(borderLeft) - Utils.parseCSSMeasure(borderRight);
  }

  /**
   * Retrieves the value attribute of this Element. This works on all checkboxes, radio buttons, text, text areas, and
   * options. However, this does not retrieve the selected options in a select box, checked checkboxes or checked radio
   * buttons. Use the getSelectedValues function for that.
   *
   * @returns {string} The value of this Element.
   */
  getValue() {
    return this.domElement.value;
  }

  /**
   * Returns true if the element has one or all class names
   *
   * @param {string} classNames The class name(s) in a string.
   * @returns {boolean} True if all class names are present.
   */
  hasClass(classNames) {
    const currentClassNames = this.domElement.className;
    if (currentClassNames === '') {
      return classNames === '';
    }

    const currentClassNameList = currentClassNames.split(Utils.spaceRegex);
    const findClassNameList = classNames.split(Utils.spaceRegex);
    for (let i = 0; i < findClassNameList.length; i++) {
      if (currentClassNameList.indexOf(findClassNameList[i]) === -1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Hides the Element by setting the display style to none.
   *
   * @returns {PrimeElement} This Element.
   */
  hide() {
    this.domElement.style.display = 'none';
    return this;
  }

  /**
   * Inserts this Element into the DOM after the given element, removing it from it's parent if it's an existing element.
   *
   * @param {PrimeElement|Element} element The element to insert this Element after.
   * @returns {PrimeElement} This Element.
   */
  insertAfter(element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    const domElement = (element instanceof PrimeElement) ? element.domElement : element;
    const parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement.nextSibling);
    } else {
      throw new TypeError('The element you passed into insertAfter is not in the DOM. You can\'t insert a PrimeElement after an element that isn\'t in the DOM yet.');
    }

    return this;
  }

  /**
   * Inserts this Element into the DOM before the given element, removing it from it's parent if it's an existing element.
   *
   * @param {PrimeElement|Element} element The element to insert this Element before.
   * @returns {PrimeElement} This Element.
   */
  insertBefore(element) {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    const domElement = (element instanceof PrimeElement) ? element.domElement : element;
    const parentElement = domElement.parentNode;
    if (parentElement) {
      parentElement.insertBefore(this.domElement, domElement);
    } else {
      throw new TypeError('The element you passed into insertBefore is not in the DOM. You can\'t insert a PrimeElement before an element that isn\'t in the DOM yet.');
    }

    return this;
  }

  /**
   * Inserts the given HTML snippet directly after this element.
   *
   * @param {string} html The HTML string.
   * @returns {PrimeElement} This Element.
   */
  insertHTMLAfter(html) {
    this.domElement.insertAdjacentHTML('afterend', html);
    return this;
  }

  /**
   * Inserts the given HTML snippet inside this element, before its first child.
   *
   * @param {string} html The HTML string.
   * @returns {PrimeElement} This Element.
   */
  insertHTMLAfterBegin(html) {
    this.domElement.insertAdjacentHTML('afterbegin', html);
    return this;
  }

  /**
   * Inserts the given text after this Element.
   *
   * @param {string} text The text to insert.
   * @returns {PrimeElement} This Element.
   */
  insertTextAfter(text) {
    if (!this.domElement.parentNode) {
      throw new TypeError('This Element is not currently in the DOM');
    }

    const textNode = document.createTextNode(text);
    this.domElement.parentNode.insertBefore(textNode, this.domElement.nextSibling);

    return this;
  }

  /**
   * Inserts the given text before this Element.
   *
   * @param {string} text The text to insert.
   * @returns {PrimeElement} This Element.
   */
  insertTextBefore(text) {
    if (!this.domElement.parentNode) {
      throw new TypeError('This Element is not currently in the DOM');
    }

    const textNode = document.createTextNode(text);
    this.domElement.parentNode.insertBefore(textNode, this.domElement);

    return this;
  }

  /**
   * Returns true if the element matches the provided selector.
   *
   * @param {string} selector to match against the Element
   * @returns {boolean} True if the element matches the selector, false if it does not match the selector.
   */
  is(selector) {
    return this.domElement.matches(selector);
  }

  /**
   * Returns whether or not the element is checked. If the element is not a checkbox or a radio this returns false.
   *
   * @returns {boolean} True if the element is selected, false if it isn't or is not a checkbox or a radio.
   */
  isChecked() {
    return this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio') && this.domElement.checked;
  }

  /**
   * Determines if this element is a child of the given element.
   *
   * @param {PrimeElement|Node} element The element to check to see if this element is a child of.
   * @returns {boolean} True if this element is a child of the given element, false otherwise.
   */
  isChildOf(element) {
    const domElement = element instanceof PrimeElement ? element.domElement : element;
    let parent = this.domElement.parentNode;
    while (domElement !== parent && parent !== null) {
      parent = parent.parentNode;
    }

    return domElement === parent;
  }

  /**
   * @returns {boolean} Whether or not this element is disabled according to the disabled property.
   */
  isDisabled() {
    return this.domElement.disabled;
  }

  /**
   * @returns {boolean} True if this element has focus.
   */
  isFocused() {
    return document.activeElement === this.domElement;
  }

  /**
   * @return {boolean} True if this element is an INPUT, SELECT or TEXTAREA.
   */
  isInput() {
    const tagName = this.getTagName();
    return tagName === 'SELECT' || tagName === 'INPUT' || tagName === 'TEXTAREA';
  }

  /**
   * Determines if the this element is inside the given element
   *
   * @param target {PrimeElement} The target element.
   * @returns {boolean} True if this element is inside the given element.
   */
  isInside(target) {
    if (this.domElement === document.body || this.domElement === document.documentElement || this.domElement === document) {
      return false;
    }

    let parent = this.getParent();
    while (parent.domElement !== document.body) {
      if (parent.domElement === target.domElement) {
        return true;
      }
      parent = parent.getParent();
    }

    return false;
  }

  /**
   * Returns whether or not the element is selected. If the element is not an option this returns false.
   *
   * @returns {boolean} True if the element is selected, false if it isn't or is not an option.
   */
  isSelected() {
    return this.domElement.tagName === 'OPTION' && this.domElement.selected;
  }

  /**
   * Determines if the element is visible using its display and visibility styles.
   *
   * @returns {boolean} True if the element is visible, false otherwise. This might return an invalid value if the element
   * is absolutely positioned and off the screen, but is still technically visible.
   */
  isVisible() {
    const computedStyle = this.getComputedStyle();
    return computedStyle['display'] !== 'none' && computedStyle['visibility'] !== 'hidden';
  }

  /**
   * Inserts this Element (which must be a newly created Element) into the DOM inside at the very beginning of the given
   * element.
   *
   * @param {PrimeElement|Element} element The element to insert this Element into.
   * @returns {PrimeElement} This Element.
   */
  prependTo(element) {
    // Error out for now if this element is in the document so we can punt on cloning for now
    if (this.domElement.parentNode) {
      throw new TypeError('You can only insert new PrimeElements for now');
    }

    const domElement = (element instanceof PrimeElement) ? element.domElement : element;
    if (domElement.parentNode) {
      domElement.insertBefore(this.domElement, domElement.firstChild);
    } else {
      throw new TypeError('The element you passed into prependTo is not in the DOM. You can\'t insert a PrimeElement inside an element that isn\'t in the DOM yet.');
    }

    return this;
  }

  /**
   * Queries the DOM using the given selector starting at this element and returns all the matched elements.
   *
   * @param {string} selector The selector.
   * @returns {PrimeElementList} An element list.
   */
  query(selector) {
    return PrimeDocument.query(selector, this);
  }

  /**
   * Queries the DOM using the given selector starting at this element and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @returns {PrimeElement} An element or null.
   */
  queryFirst(selector) {
    return PrimeDocument.queryFirst(selector, this);
  }

  /**
   * Queries the DOM using the given selector starting at this element and returns the last matched element
   * or null if there aren't any matches.
   *
   * @param {string} selector The selector.
   * @returns {PrimeElement} An element or null.
   */
  queryLast(selector) {
    return PrimeDocument.queryLast(selector, this);
  }

  /**
   * Traverses up the DOM from this element and looks for a match to the selector.
   *
   * @param {string} selector The selector.
   * @returns {PrimeElement} An element or null.
   */
  queryUp(selector) {
    return PrimeDocument.queryUp(selector, this);
  }

  /**
   * Removes all of the event listeners for the given element.
   *
   * @returns {PrimeElement} This Element.
   */
  removeAllEventListeners() {
    for (let event in this.domElement.eventListeners) {
      if (this.domElement.eventListeners.hasOwnProperty(event)) {
        for (let i = 0; i < this.domElement.eventListeners[event].length; i++) {
          this._internalRemoveEventListener(event, this.domElement.eventListeners[event][i]);
        }
      }
    }

    this.domElement.eventListeners = {};
    this.domElement.customEventListeners = {};

    return this;
  }

  /**
   * Removes an attribute from the Element
   *
   * @param {string} name The name of the attribute.
   * @returns {PrimeElement} This Element.
   */
  removeAttribute(name) {
    this.domElement.removeAttribute(name);
    return this;
  }

  /**
   * Removes the given class (or list of space separated classes) from this Element.
   *
   * @param {string} classNames The class name(s).
   * @returns {PrimeElement} This Element.
   */
  removeClass(classNames) {
    const currentClassName = this.domElement.className;
    if (currentClassName === '') {
      return this;
    }

    const currentClassNameList = currentClassName.split(Utils.spaceRegex);
    const removeClassNameList = classNames.split(Utils.spaceRegex);
    for (let i = 0; i < removeClassNameList.length; i++) {
      Utils.removeFromArray(currentClassNameList, removeClassNameList[i]);
    }

    this.domElement.className = currentClassNameList.join(' ');
    return this;
  }

  /**
   * Removes an event listener for a specific event from this Element, you must have attached using addEventListener
   *
   * @param {string} event The name of the event.
   * @param {*} listener The event listener that was bound.
   * @returns {PrimeElement} This Element.
   */
  removeEventListener(event, listener) {
    let listeners;
    if (event.indexOf(':') === -1) {
      this._internalRemoveEventListener(event, listener);
      listeners = this.domElement.eventListeners[event];
    } else {
      listeners = this.domElement.customEventListeners[event];
    }

    if (listeners) {
      Utils.removeFromArray(listeners, listener);
    }

    return this;
  }

  /**
   * Removes all of the event listeners for the given event from this element.
   *
   * @param {string} event The name of the event to remove the listeners for.
   * @returns {PrimeElement} This Element.
   */
  removeEventListeners(event) {
    if (event.indexOf(':') === -1) {
      if (this.domElement.eventListeners[event]) {
        for (let i = 0; i < this.domElement.eventListeners[event].length; i++) {
          this._internalRemoveEventListener(event, this.domElement.eventListeners[event][i]);
        }

        delete this.domElement.eventListeners[event];
      }
    } else {
      if (this.domElement.customEventListeners[event]) {
        delete this.domElement.customEventListeners[event];
      }
    }

    return this;
  }

  /**
   * Removes all of the event listeners for the given pattern from this element.
   *
   * @param {RegExp} pattern The regular expression that matches the names of the events to remove the listeners for.
   * @returns {PrimeElement} This Element.
   */
  removeEventListenersByPattern(pattern) {
    for (let event in this.domElement.eventListeners) {
      if (this.domElement.eventListeners.hasOwnProperty(event) && pattern.test(event)) {
        for (let i = 0; i < this.domElement.eventListeners[event].length; i++) {
          this._internalRemoveEventListener(event, this.domElement.eventListeners[event][i]);
        }

        delete this.domElement.eventListeners[event];
      }
    }

    for (let event in this.domElement.customEventListeners) {
      if (this.domElement.customEventListeners.hasOwnProperty(event) && pattern.test(event)) {
        delete this.domElement.customEventListeners[event];
      }
    }

    return this;
  }

  /**
   * Removes this Element from the DOM. If the Element isn't in the DOM this does nothing.
   *
   * @returns {PrimeElement} This Element.
   */
  removeFromDOM() {
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    return this;
  }

  /**
   * Create a selected range for this element.
   *
   * @returns {PrimeElement} This Element.
   */
  selectElementContents() {
    let range;
    let selection;

    if (document.body.createTextRange) {
      /* IE */
      range = document.body.createTextRange();
      range.moveToElementText(this.domElement);
      range.select();
    } else if (window.getSelection) {
      /* Rest of the world */
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(this.domElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return this;
  }

  /**
   * Scrolls this Element into the visible area of the browser window.
   *
   * @returns {PrimeElement} This Element.
   */
  scrollIntoView() {
    this.domElement.scrollIntoView();
    return this;
  }

  /**
   * Scrolls this element to the given horizontal position.
   *
   * @param {number} position The position to scroll the element to.
   * @returns {PrimeElement} This Element.
   */
  scrollLeftTo(position) {
    this.domElement.scrollLeft = position;
    return this;
  }

  /**
   * Scrolls this element to the given vertical position.
   *
   * @param {number} position The position to scroll the element to.
   * @returns {PrimeElement} This Element.
   */
  scrollTo(position) {
    this.domElement.scrollTop = position;
    return this;
  }

  /**
   * Scrolls this element to the bottom.
   *
   * @returns {PrimeElement} This Element.
   */
  scrollToBottom() {
    this.domElement.scrollTop = this.domElement.scrollHeight;
    return this;
  }

  /**
   * Scrolls this element to the top.
   *
   * @returns {PrimeElement} This Element.
   */
  scrollToTop() {
    this.domElement.scrollTop = 0;
    return this;
  }

  /**
   * Sets an attribute of the Element.
   *
   * @param {string} name The attribute name
   * @param {number|string} value The attribute value
   * @returns {PrimeElement} This Element.
   */
  setAttribute(name, value) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    if (this.domElement.setAttribute) {
      this.domElement.setAttribute(name, value);
    } else {
      const attribute = document.createAttribute(name);
      attribute.nodeValue = value;
      this.domElement.setAttributeNode(attribute);
    }

    return this;
  }

  /**
   * Sets a data- attribute of the Element.
   *
   * Example: setDataAttribute('fooBar', 'baz');
   *  is equivalent to calling setAttribute('data-foo-bar', 'baz');
   *
   * @param {string} name The attribute name
   * @param {number|string} value The attribute value
   * @returns {PrimeElement} This Element.
   */
  setDataAttribute(name, value) {
    const dataName = 'data-' + name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    return this.setAttribute(dataName, value);
  }

  /**
   * Sets multiple attributes of the Element from the hash
   *
   * @param {Object} attributes An object of key value style pairs.
   * @returns {PrimeElement} This Element.
   */
  setAttributes(attributes) {
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  }

  /**
   * If this element is a checkbox or radio button, this sets the checked field on the DOM object equal to the given
   * value.
   *
   * @param {boolean} value The value to set the checked state of this element to.
   * @returns {PrimeElement} This Element.
   */
  setChecked(value) {
    this.domElement.checked = value;
    return this;
  }

  /**
   * Sets if this element is disabled or not. This works with any element that responds to the disabled property.
   *
   * @param {boolean} value The value to set the disabled state of this element to.
   * @returns {PrimeElement} This Element.
   */
  setDisabled(value) {
    this.domElement.disabled = value;
    return this;
  }

  /**
   * Sets the height of this element using the height style.
   *
   * @param {number|string} height The new height as a number (for pixels) or string.
   * @returns {PrimeElement} This Element.
   */
  setHeight(height) {
    if (typeof(height) === 'number') {
      height = height + 'px';
    }

    this.setStyle('height', height);
    return this;
  }

  /**
   * Sets the inner HTML content of the Element.
   *
   * @param {string|PrimeElement} newHTML The new HTML content for the Element.
   * @returns {PrimeElement} This Element.
   */
  setHTML(newHTML) {
    if (newHTML !== null) {
      if (newHTML instanceof PrimeElement) {
        this.domElement.innerHTML = newHTML.getHTML();
      } else {
        this.domElement.innerHTML = newHTML;
      }
    }
    return this;
  }

  /**
   * Sets the ID of the Element.
   *
   * @param {string} id The ID.
   * @returns {PrimeElement} This Element.
   */
  setId(id) {
    this.domElement.id = id;
    return this;
  }

  /**
   * Sets left position of the element.
   *
   * @param {number|string} left The left position of the element in pixels or as a string.
   * @returns {PrimeElement} This Element.
   */
  setLeft(left) {
    let leftString = left;
    if (typeof(left) === 'number') {
      leftString = left + 'px';
    }

    this.setStyle('left', leftString);
    return this;
  }

  /**
   * Sets the opacity of the element. This also sets the IE alpha filter for IE version 9 or younger.
   *
   * @param {number} opacity The opacity.
   * @returns {PrimeElement} This Element.
   */
  setOpacity(opacity) {
    if (Browser.name === 'Explorer' && Browser.version < 9) {
      this.domElement.style.filter = 'alpha(opacity=' + opacity + ')';
    } else {
      this.domElement.style.opacity = opacity;
    }

    return this;
  }

  /**
   * Sets the selected value on the element. If the element is not an option or radio, this does nothing.
   *
   * @param {boolean} selected Selected value.
   */
  setSelected(selected) {
    this.domElement.selected = selected;
  }

  /**
   * Sets the selected value(s) of this element. This works on selects, checkboxes, and radio buttons.
   *
   * @param {string} [arguments] The value(s) to select (var args).
   * @returns {PrimeElement} This Element.
   */
  setSelectedValues() {
    // Handle the case where they passed in an array
    let values = null;
    if (arguments.length === 1 && Utils.isArray(arguments[0])) {
      values = arguments[0];
    } else {
      values = Array.prototype.slice.call(arguments, 0);
    }

    if (this.domElement.tagName === 'INPUT' && (this.domElement.type === 'checkbox' || this.domElement.type === 'radio')) {
      const name = this.domElement.name;
      const form = PrimeDocument.queryUp('form', this.domElement);
      PrimeDocument.query('input[name="' + name + '"]', form).each(function(element) {
        element.setChecked(values.indexOf(element.getValue()) !== -1);
      });
    } else if (this.domElement.tagName === 'SELECT') {
      for (let i = 0; i < this.domElement.length; i++) {
        this.domElement.options[i].selected = values.indexOf(this.domElement.options[i].value) !== -1;
      }
    }

    return this;
  }

  /**
   * Sets the style for the name of this Element.
   *
   * @param {string} name The style name.
   * @param {number|string} value The style value.
   * @returns {PrimeElement} This Element.
   */
  setStyle(name, value) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    this.domElement.style[name] = value;
    return this;
  }

  /**
   * Sets multiple styles of this Element.
   *
   * @param {Object} styles An object with key value pairs for the new style names and values.
   * @returns {PrimeElement} This Element.
   */
  setStyles(styles) {
    for (let key in styles) {
      if (styles.hasOwnProperty(key)) {
        this.setStyle(key, styles[key]);
      }
    }
    return this;
  }

  /**
   * Sets the textContent of the Element.
   *
   * @param {number|string|PrimeElement} newText The new text content for the Element.
   * @returns {PrimeElement} This Element.
   */
  setTextContent(newText) {
    if (newText !== null) {
      if (newText instanceof PrimeElement) {
        this.domElement.textContent = newText.getTextContent();
      } else {
        if (typeof newText === 'number') {
          newText = newText.toString();
        }
        this.domElement.textContent = newText;
      }
    }
    return this;
  }

  /**
   * Sets top position of the element.
   *
   * @param {number|string} top The top position of the element in pixels or as a string.
   * @returns {PrimeElement} This Element.
   */
  setTop(top) {
    let topString = top;
    if (typeof(top) === 'number') {
      topString = top + 'px';
    }

    this.setStyle('top', topString);
    return this;
  }

  /**
   * Sets the value of this Element. This handles checkboxes, radio buttons, options, text inputs and text areas. This
   * works on checkboxes and radio buttons, but it change the value attribute on them rather than checking and unchecking
   * the buttons themselves. To check and uncheck the buttons, use the select method.
   *
   * @param {number|string} value The new value.
   * @returns {PrimeElement} This Element.
   */
  setValue(value) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    this.domElement.value = value;
    return this;
  }

  /**
   * Sets the width of this element using the height style.
   *
   * @param {number|string} width The new width as a number (for pixels) or string.
   * @returns {PrimeElement} This Element.
   */
  setWidth(width) {
    if (typeof(width) === 'number') {
      width = width + 'px';
    }

    this.setStyle('width', width);
    return this;
  }

  /**
   * Shows the Element by setting the display style first to empty string. After this, the elements computed style is
   * checked to see if the element is still not visible. If that is true, the element must have a CSS style defined in
   * a stylesheet that is setting it to display: none. In this case, we determine if the element is a block level element
   * and either set the display to 'block' or 'inline'.
   *
   * @param {string} [displayValue] The display value to use for the show. This defaults to the W3C standard display
   * setting depending on the type of element you are showing. For example, INPUT is inline and DIV is block.
   * @returns {PrimeElement} This Element.
   */
  show(displayValue) {
    if (Utils.isDefined(displayValue)) {
      this.domElement.style.display = displayValue;
      return this;
    }

    this.domElement.style.display = '';

    const computedDisplay = this.getComputedStyle()['display'];
    if (computedDisplay === 'none') {
      if (!Utils.isDefined(displayValue)) {
        displayValue = (PrimeElement.blockElementRegexp.test(this.domElement.tagName)) ? 'block' : 'inline';
      }

      this.domElement.style.display = displayValue;
    }

    return this;
  }

  /**
   * Toggle the class on this element.
   *
   * @param {string} className The class name.
   * @returns {PrimeElement} This Element.
   */
  toggleClass(className) {
    if (this.hasClass(className)) {
      this.removeClass(className);
    } else {
      this.addClass(className);
    }

    return this;
  }

  /**
   * Removes this element from the DOM while preserving the inner HTML.
   *
   * Example, call unwrap on the italic element:
   *   <strong>Hello</strong><italic> World </italic> --> <strong>Hello</strong> World
   *
   * @returns {PrimeElement} This Element.
   */
  unwrap() {
    const parent = this.getParent().domElement;
    while (this.domElement.firstChild) {
      parent.insertBefore(this.domElement.firstChild, this.domElement);
    }

    this.removeFromDOM();
  }

  /**
   * Builds a new element using the given HTML snippet (currently this only supports the tag).
   *
   * @param {string} elementString The element string.
   * @param {Object} [properties={}] The properties for the new element.
   * @returns {PrimeElement} A new PrimeElement.
   */
  wrapInnerHTML(elementString, properties) {
    const element = PrimeDocument.newElement(elementString, properties);
    element.setHTML(this.getOuterHTML());
    this.domElement.outerHTML = element.domElement.outerHTML;
    return this;
  }

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Removes the event listener proxy from this element.
   *
   * @param {string} event The event name.
   * @param {Function} listener The listener function.
   * @private
   */
  _internalRemoveEventListener(event, listener) {
    if (event.indexOf(':') === -1) {
      // Traditional event
      if (this.domElement.removeEventListener) {
        this.domElement.removeEventListener(event, listener, false);
      } else if (this.domElement.detachEvent) {
        this.domElement.detachEvent('on' + event, listener);
      } else {
        throw new TypeError('Unable to remove event from the element. Neither removeEventListener nor detachEvent methods are available');
      }
    } else if (this.domElement.customEventListeners && this.domElement.customEventListeners[event]) {
      // Custom event
      const customListeners = this.domElement.customEventListeners[event];
      Utils.removeFromArray(customListeners, listener);
    }
  }
}


/* ===================================================================================================================
 * Polyfill
 * ===================================================================================================================*/

(function() {
  if (!Element.prototype.matches) {
    Element.prototype.matches = function(selector) {
      const domElement = this;
      const matches = (domElement.parentNode || domElement.document).querySelectorAll(selector);
      let i = 0;

      while (matches[i] && matches[i] !== domElement) {
        i++;
      }

      return !!matches[i];
    };
  }
})();

export {PrimeElement};
