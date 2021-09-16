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
    this.copyButton1 = Prime.Document.queryById('copy-button-test1');
    this.copyButtonWidget1 = new Prime.Widgets.CopyButton(this.copyButton1).initialize();
  });

  afterEach(function() {
    this.copyButtonWidget1.destroy();
    this.copyButtonWidget1 = null;
  });

  it('clicking button copies to the clipboard', async function(done) {
    console.log("starting brett's test");
    let button1 = this.copyButton1.queryFirst('button');
    button1.fireEvent('click', null, button1, false, true);
    console.log("Reading the clipboard");
    let resp = await navigator.clipboard.readText();
    assert.equal(resp, 'My copy text value');
  });
});

