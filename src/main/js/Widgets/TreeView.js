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

import {PrimeElement} from "../Document/PrimeElement";
import {Utils} from "../Utils";

class TreeView {
  /**
   * Constructs a new TreeView object for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the TreeView widget.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);
    this.element = PrimeElement.wrap(element);
    this._setInitialOptions();
  }

  /**
   * Initializes the element by traverse its children to find all of the anchor tags with the folder-toggle class (or
   * whatever you set the class to).
   *
   * @returns {TreeView} This.
   */
  initialize() {
    this.element.query('a.' + this.options.folderToggleClassName).each(function(e) {
      e.addEventListener('click', this._handleClick);
    }.bind(this));
    return this;
  }

  /**
   * Sets the folder toggle class name.
   *
   * @param className {String} The class name.
   * @returns {TreeView} This.
   */
  withFolderToggleClassName(className) {
    this.options.folderToggleClassName = className;
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  // noinspection JSMethodCanBeStatic
  /**
   * Handles the click event.
   * @private
   */
  _handleClick(event) {
    Utils.stopEvent(event);
    const a = PrimeElement.wrap(event.target);
    const li = a.getParent();
    if (a.hasClass('open')) {
      a.removeClass('open');
      li.removeClass('open');
    } else {
      a.addClass('open');
      li.addClass('open');
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      folderToggleClassName: 'prime-folder-toggle'
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (const option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {TreeView};
