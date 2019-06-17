/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
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

const PrimeStorage = {
  /**
   * True if local storage is supported.
   * @type {boolean} true if local storage is supported. Local in this case being used to indicate either type 'local' or 'session'.
   */
  supported: typeof(Storage) !== 'undefined',

  /**
   * Set an object into session storage.
   * @param key {string} the key to store the object.
   * @param object {object} the object to store.
   */
  setSessionObject: function(key, object) {
    PrimeStorage._setObject(sessionStorage, key, object);
  },

  /**
   * Retrieve an object from session storage.
   * @param key {string} the key that was used to store the object.
   * @return {object} the stored object or null if it does not exist or local storage is not supported.
   */
  getSessionObject: function(key) {
    return PrimeStorage._getObject(sessionStorage, key);
  },

  /**
   * Set an object into local storage storage.
   * @param key {string} the key to store the object.
   * @param object {object} the object to store.
   */
  setLocalObject: function(key, object) {
    PrimeStorage._setObject(localStorage, key, object);
  },

  /**
   * Retrieve an object from local storage.
   * @param key {string} the key that was used to store the object.
   * @return {object} the stored object or null if it does not exist or local storage is not supported.
   */
  getLocalObject: function(key) {
    return PrimeStorage._getObject(localStorage, key);
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  _getObject: function(storage, key) {
    if (PrimeStorage.supported) {
      const item = storage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    }

    return null;
  },

  _setObject: function(storage, key, object) {
    if (PrimeStorage.supported) {
      storage.setItem(key, JSON.stringify(object));
    }
  }
};

export {PrimeStorage};
