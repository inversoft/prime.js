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
   * @return {*}
   */
  getRequestHeader:function (name) {
    return this.headers[name];
  },
  /** private methods **/
  init:function () {
    this.headers = {};
  }
};
