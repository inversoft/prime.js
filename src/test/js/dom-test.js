var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase("DOM tests", {
  /**
   * Tests selecting element(s).
   */
  "query": function() {
    var list = Prime.Dom.query('div');
    assert.equals(list.length, 3);
    assert.equals(list[0].id, 'one');
    assert.equals(list[0].domElement.id, 'one');
    assert.equals(list[1].id, 'two');
    assert.equals(list[1].domElement.id, 'two');
    assert.equals(list[2].id, 'three');
    assert.equals(list[2].domElement.id, 'three');
  },

  /**
   * Tests selecting one element.
   */
  "queryFirst": function() {
    var element = Prime.Dom.queryFirst('div');
    refute.isNull(element);
    assert.equals(element.id, 'one');
    assert.equals(element.domElement.id, 'one');

    element = Prime.Dom.queryFirst('div#one');
    refute.isNull(element);
    assert.equals(element.id, 'one');
    assert.equals(element.domElement.id, 'one');

    element = Prime.Dom.queryFirst('#one');
    refute.isNull(element);
    assert.equals(element.id, 'one');
    assert.equals(element.domElement.id, 'one');

    element = Prime.Dom.queryFirst('#invalid');
    assert.isNull(element);
  },

  /**
   * Tests selecting by ID.
   */
  "queryByID": function() {
    var element = Prime.Dom.queryByID('one');
    refute.isNull(element);
    assert.equals(element.id, 'one');
    assert.equals(element.domElement.id, 'one');

    element = Prime.Dom.queryFirst('invalid');
    assert.isNull(element);
  }
});