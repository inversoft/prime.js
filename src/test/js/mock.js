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

/**
 * Mock is a collection of Mock style objects for intercepting calls and verifying state changes.
 *
 */
var Mock = Mock || {};

/**
 * Mocks out the basics of an XMLHttpRequest, primarily for injecting into some component that uses XHR and
 * you want to test what gets called via that component.  Does not currently simulate responses.
 * @constructor
 */
Mock.XHR = function () {
  this.init();
};

Mock.XHR.prototype = {
  /**
   * Mocks out the xhr.open call, and just stores the values
   *
   * @param method
   * @param url
   * @param async
   * @param username
   * @param password
   */
  open:function (method, url, async, username, password) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.username = username;
    this.password = password;
  },

  /**
   * Mocks out the xhr.setRequestHeader method and stores the header value for retrieval via the {@link #getRequestHeader}
   * @param name
   * @param value
   */
  setRequestHeader:function (name, value) {
    this.headers[name] = value;
  },
  /**
   * Mocks out the xhr.send method to capture the body
   * @param body
   */
  send:function (body) {
    this.body = body;
  },
  /** test methods **/
  /**
   * Retrieves a set request header by name, useful for test assertions.
   * @param name
   * @returns {*}
   */
  getRequestHeader:function (name) {
    return this.headers[name];
  },
  /** private methods **/
  init:function () {
    this.headers = {};
  }
};
