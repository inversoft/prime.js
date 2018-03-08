/*
 * Copyright (c) 2018, Inversoft Inc., All Rights Reserved
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

describe('Overlay class tests', function() {
  it('body overflow style preserved', function() {

    let bodyStyle = Prime.Document.bodyElement.getStyle('overflow');
    let overlay = new Prime.Widgets.Overlay();
    overlay.open(100);

    assert.equal(Prime.Document.bodyElement.getStyle('overflow'), 'hidden');
    overlay.close();
    assert.equal(Prime.Document.bodyElement.getStyle('overflow'), bodyStyle);

    Prime.Document.bodyElement.setStyle('overflow', 'scroll');
    overlay.open(100);
    assert.equal(Prime.Document.bodyElement.getStyle('overflow'), 'hidden');
    overlay.close();
    assert.equal(Prime.Document.bodyElement.getStyle('overflow'), bodyStyle);

  });
});
