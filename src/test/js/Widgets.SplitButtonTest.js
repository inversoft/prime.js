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

describe('SplitButton class tests', function() {
  beforeEach(function() {
    this.splitButton1 = Prime.Document.queryById('split-button-test1');
    this.splitButton2 = Prime.Document.queryById('split-button-test2');

    this.splitButtonWidget1 = new Prime.Widgets.SplitButton(this.splitButton1).initialize();
    this.splitButtonWidget2 = new Prime.Widgets.SplitButton(this.splitButton2).initialize();

    this.dropDown1 = this.splitButton1.queryFirst('.menu');
    this.dropDown2 = this.splitButton2.queryFirst('.menu');
  });

  afterEach(function() {
    this.splitButtonWidget1.destroy();
    this.splitButtonWidget2.destroy();
    this.splitButtonWidget1 = null;
    this.splitButtonWidget2 = null;
  });

  it('splitButton constructed ok', function() {
    assert.isFalse(this.dropDown1.isVisible());
    assert.isFalse(this.dropDown2.isVisible());
  });

  it('clicking button opens drop down', function(done) {
    let button1 = this.splitButton1.queryFirst('button');
    button1.fireEvent('click', null, button1, false, true);

    let button2 = this.splitButton2.queryFirst('button');
    button2.fireEvent('click', null, button2, false, true);
    setTimeout(function() {
      assert.isTrue(this.dropDown1.isVisible());
      assert.isTrue(this.dropDown2.isVisible());
      done();
    }.bind(this), 5);
  });
});

