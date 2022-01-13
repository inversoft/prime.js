/*
 * Copyright (c) 2015-2016, Inversoft Inc., All Rights Reserved
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

describe('CopyButton class tests', function() {
  beforeEach(function() {

    this.copyButton = Prime.Document.queryById("clipboard-button");
    this.copySpan1 = Prime.Document.queryById("clipboard-span-field");
    this.copyButton2 = Prime.Document.queryById("clipboard-button2")
    this.ddField = Prime.Document.queryById("dd-field")

    this.clipboard = new Prime.Widgets.Clipboard(this.copyButton).initialize();
    this.clipboardButton2 = new Prime.Widgets.Clipboard(this.copyButton2).initialize();
    this.clipboardSpan1 = new Prime.Widgets.Clipboard(this.copySpan1).initialize();
    this.clipboardDDField = new Prime.Widgets.Clipboard(this.ddField).initialize();
  });

  afterEach(function() {

  });

  context('[data-copy] assigned to a button', function() {
    it('clicking button selects target text', function() {
      Prime.Document.queryById("clipboard-text").setValue("cfd65a5c-af8d-46b4-aff2-31b0a33578d6");

      let button1 = this.copyButton;
      button1.fireEvent('click', null, button1, false, true);

      assert.equal(this.clipboard.selectedText, 'cfd65a5c-af8d-46b4-aff2-31b0a33578d6');
    });
  });

  it("mouseenter selects text", function() {
    this.copySpan1.fireEvent('mouseenter', null, this.copySpan1, false, true);

    assert.equal(this.clipboardSpan1.selectedText, 'Clipboard span 1 text');
  });

  it("selects text within a table data element", function() {
    this.copyButton2.fireEvent('click', null, this.copyButton2, false, true);

    assert.equal(this.clipboardButton2.selectedText, 'Clipboard table data1');
  });

  it("removes \\n, \&nbsp; characters and trims selected text", function() {
    this.ddField.fireEvent('mouseenter', null, this.ddField, false, true);
    assert.equal(this.clipboardDDField.selectedText, 'admin@fusionauth.io');
  })
});

