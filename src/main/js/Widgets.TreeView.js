'use strict';

var Prime = Prime || {};

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new TreeView object for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the TreeView widget.
 * @constructor
 */
Prime.Widgets.TreeView = function(element) {
  Prime.Utils.bindAll(this);
  this.element = Prime.Document.Element.wrap(element);
  this._setInitialOptions();
};

Prime.Widgets.TreeView.constructor = Prime.Widgets.TreeView;

Prime.Widgets.TreeView.prototype = {
  /**
   * Initializes the element by traverse its children to find all of the anchor tags with the folder-toggle class (or
   * whatever you set the class to).
   *
   * @returns {Prime.Widgets.TreeView} This.
   */
  initialize: function() {
    this.element.query('a.' + this.options['folderToggleClassName']).each(function (e) {
      e.addEventListener('click', this._handleClick);
    }.bind(this));
    return this;
  },

  /**
   * Sets the folder toggle class name.
   *
   * @param className {String} The class name.
   * @returns {Prime.Widgets.TreeView} This.
   */
  withFolderToggleClassName: function(className) {
    this.options['folderToggleClassName'] = className;
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handles the click event.
   * @private
   */
  _handleClick: function(event) {
    var a = Prime.Document.Element.wrap(event.target);
    var li = a.getParent();
    if (a.hasClass('open')) {
      a.removeClass('open');
      li.removeClass('open');
    } else {
      a.addClass('open');
      li.addClass('open');
    }
    Prime.Utils.stopEvent(event);
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'folderToggleClassName': 'prime-folder-toggle'
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};
