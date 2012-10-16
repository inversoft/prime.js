/*
 * Helper functions
 */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('Fade tests', {
  setUp: function() {
    this.timeout = 2000;
  },

  'fade': function(done) {
    var called = false;
    var endFunction = function() {
      called = true;
    };

    var element = Prime.Dom.queryFirst('#hide');
    console.log("Test");
    console.log(element);
    new Prime.Effects.Fade(element).withDuration(500).withEndFunction(endFunction).go();

    setTimeout(function() {
      assert(called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  },

  'fadeContext': function(done) {
    var FadeClass = function() {
      this.called = false;
    };
    FadeClass.prototype = {
      handle: function() {
        this.called = true;
      }
    };

    var handler = new FadeClass();
    var element = Prime.Dom.queryFirst('#hide');
    var effect = new Prime.Effects.Fade(element);
    assert.equals(effect.duration, 1000);

    effect.withDuration(200);
    assert.equals(effect.duration, 200);

    effect.withEndFunction(handler.handle, handler);
    assert.equals(effect.endFunction, handler.handle);
    assert.equals(effect.context, handler);

    effect.go();

    setTimeout(function() {
      assert(handler.called);
      assert.equals(element.domElement.style.opacity, '0');
      assert.equals(element.domElement.style.display, 'none');
      done();
    }, 800);
  }
});
