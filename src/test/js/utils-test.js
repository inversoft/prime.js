var assert = buster.assertions.assert;

buster.testCase('Utils tests', {
  setUp: function() {
    this.timeout = 2000;
  },

  'callIteratively': function(done) {
    var count = 0;
    function call() {
      count++;
    }

    Prime.Utils.callIteratively(1000, 10, call);

    setTimeout(function() {
      assert.equals(count, 10);
      done();
    }, 1100);
  },

  'callIterativelyWithEndFunction': function(done) {
    var count = 0;
    function call() {
      count++;
    }

    var ended = false;
    function end() {
      ended = true;
    }

    Prime.Utils.callIteratively(1000, 10, call, end);

    setTimeout(function() {
      assert.equals(count, 10);
      assert(ended);
      done();
    }, 1100);
  },

  'callIterativelyWithEndFunctionAndContext': function(done) {
    var CallIterativelyClass = function() {
      this.count = 0;
      this.ended = false;
    };
    CallIterativelyClass.prototype = {
      call: function() {
        this.count++;
      },

      end: function() {
        this.ended = true;
      }
    };

    var instance = new CallIterativelyClass();
    Prime.Utils.callIteratively(1000, 10, instance.call, instance.end, instance);

    setTimeout(function() {
      assert.equals(instance.count, 10);
      assert(instance.ended);
      done();
    }, 1100);
  }
});