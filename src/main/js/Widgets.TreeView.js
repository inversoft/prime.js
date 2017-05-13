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
  this.element = Prime.Document.Element.wrap(element);
  Prime.Utils.bindAll(this);
  this.element.query('a.folder-toggle').each(function (e) {
    e.addEventListener('click', this._handleClick);
  }.bind(this));
};

Prime.Widgets.TreeView.constructor = Prime.Widgets.TreeView;

Prime.Widgets.TreeView.prototype = {
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
    if (a.hasClass('active')) {
      a.removeClass('active');
      li.removeClass('active');
    } else {
      a.addClass('active');
      li.addClass('active');
    }
  }
};
