/*
 * Copyright (c) 2016, Inversoft Inc., All Rights Reserved
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

var assert = buster.assertions.assert;

buster.testCase('Data.Queue Tests', {

  'queue': function() {
    var queue = new Prime.Data.Queue();

    assert.isTrue(queue.isEmpty());

    var object = "string";
    queue.add(object);

    assert.isFalse(queue.isEmpty());
    assert.equals(queue.size(), 1);
    var headObject = queue.peek();

    assert.equals(object, headObject);
    assert.equals(queue.size(), 1);

    headObject = queue.poll();
    assert.equals(object, headObject);
    assert.equals(queue.size(), 0);
    assert.isTrue(queue.isEmpty());

    queue.add("foo").add("bar").add("baz");
    assert.equals(queue.size(), 3);

    assert.equals(queue.peek(), "foo");
    assert.equals(queue.poll(), "foo");
    assert.equals(queue.peek(), "bar");
    assert.equals(queue.poll(), "bar");
    assert.equals(queue.poll(), "baz");
    assert.isTrue(queue.isEmpty());

    queue.add("foo").add("bar").add("baz");
    assert.equals(queue.size(), 3);

    var tailIndex = queue.getTailIndex();
    assert.equals(queue.size(), 3);
    assert.isFalse(queue.isIndexOutOfBounds(tailIndex));
    assert.isFalse(queue.isIndexOutOfBounds(tailIndex + 1));
    assert.isFalse(queue.isIndexOutOfBounds(tailIndex + 2));
    assert.isTrue(queue.isIndexOutOfBounds(tailIndex + 3));
  }
});
