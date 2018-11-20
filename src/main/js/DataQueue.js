/*
 * Copyright (c) 2016-2017, Inversoft Inc., All Rights Reserved
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

import {Utils} from "./Utils.js";

class DataQueue {
  /**
   * First-In-First-Out Queue implementation modeled after java.util.Deque interface.
   *
   * @constructor
   */
  constructor() {
    Utils.bindAll(this);
    this._elements = {};
    this._head = 0;
    this._tail = 0;
  }

  /**
   * Add the element to the head of the queue.
   *
   * @param {Object} element An object to store in the queue.
   * @returns {DataQueue} This Element.
   */
  add(element) {
    this._elements[this._head] = element;
    this._head++;

    return this;
  }

  /**
   * Return true if the queue is empty.
   *
   * @returns {boolean} True if the queue is empty, false if not.
   */
  isEmpty() {
    return this._head === this._tail;
  }

  /**
   * Return but do not remove the tail of the queue. This is the oldest element in the queue.
   *
   * @returns {Object} The object at the tail of the queue, or null if empty.
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }

    return this._elements[this._tail];
  }

  /**
   * Return and remove the tail of the queue. This is the oldest element in the queue.
   *
   * @returns {Object} the object at the tail of the queue, or null if the queue is empty.
   */
  poll() {
    if (this.isEmpty()) {
      return null;
    }

    const object = this._elements[this._tail];
    delete this._elements[this._tail];
    this._tail++;

    // The cursor should not go off the end of the queue
    if (this._cursor < this._tail) {
      this._cursor = this._tail;
    }

    return object;
  }

  /**
   * Return the size of the queue.
   *
   * @returns {Number} The size of the queue.
   */
  size() {
    return this._head - this._tail;
  }

}

export {DataQueue};
