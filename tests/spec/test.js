/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:2, maxdepth:2,
  maxstatements:39, maxcomplexity:4 */

/*global module, require, describe, it, returnExports, JSON:true */

(function () {
  'use strict';

  var rxTest = /test/,
    assert;

  if (typeof module === 'object' && module.exports) {
    require('es5-shim');
    if (typeof JSON === 'undefined') {
      JSON = {};
    }
    require('json3').runInContext(null, JSON);
    assert = require('../../index.js');
  } else {
    assert = returnExports;
  }

  function noop() {}

  function NameBuilder(first, last) {
    this.first = first;
    this.last = last;
  }

  NameBuilder.prototype = {
    toString: function () {
      return this.first + ' ' + this.last;
    }
  };

  function NameBuilder2(first, last) {
    this.first = first;
    this.last = last;
  }

  describe('AssertionError', function () {
    it('should not throw an error in each case', function () {
      assert.strictEqual(
        assert.AssertionError.prototype.constructor,
        assert.AssertionError
      );
    });

    it('should throw an error in each case', function () {
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: false,
          expected: false,
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: true,
          expected: true,
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: true,
          expected: false,
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: false,
          expected: true,
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: '',
          expected: 'test',
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: 'test',
          expected: '',
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: 'test',
          expected: 'test',
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          message: 'assert.AssertionError is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError({
          actual: 'assert.AssertionError',
          expected: 'is an Error function'
        });
      }, assert.AssertionError, 'assert.AssertionError');
      assert.throws(function () {
        throw new assert.AssertionError();
      }, assert.AssertionError, 'assert.AssertionError');
    });
  });

  describe('assert.ok', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.ok(false);
      }, assert.AssertionError, 'ok(false)');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.ok(true);
      }, 'ok(true)');

      assert.doesNotThrow(function () {
        assert.ok('test');
      }, 'ok("test")');
    });
  });

  describe('assert.notOk', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.notOk(true);
      }, assert.AssertionError, 'notOk(true)');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.notOk(false);
      }, assert.AssertionError, 'notOk(false)');
      assert.doesNotThrow(function () {
        assert.notOk();
      }, 'notOk()');
    });
  });

  describe('assert.equal', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.equal(true, false);
      }, assert.AssertionError, 'equal');
      assert.throws(function () {
        assert.notEqual(true, true);
      }, assert.AssertionError, 'notEqual');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.equal(null, null);
      }, 'equal');
      assert.doesNotThrow(function () {
        assert.equal(undefined, undefined);
      }, 'equal');
      assert.doesNotThrow(function () {
        assert.equal(null, undefined);
      }, 'equal');
      assert.doesNotThrow(function () {
        assert.equal(true, true);
      }, 'equal');
      assert.doesNotThrow(function () {
        assert.equal(2, '2');
      }, 'equal');
      assert.doesNotThrow(function () {
        assert.notEqual(true, false);
      }, 'notEqual');
    });
  });

  describe('assert.strictEqual', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.strictEqual(2, '2');
      }, assert.AssertionError, 'strictEqual');
      assert.throws(function () {
        assert.strictEqual(null, undefined);
      }, assert.AssertionError, 'strictEqual');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.notStrictEqual(2, '2');
      }, 'notStrictEqual');
    });
  });

  describe('assert.deepEqual - 7.2', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepEqual(new Date(), new Date(2000, 3, 14));
      }, assert.AssertionError, 'deepEqual date');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
      }, 'deepEqual date');
    });
  });

  describe('assert.deepEqual - 7.3', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepEqual(/ab/, /a/);
      });
      assert.throws(function () {
        assert.deepEqual(/a/g, /a/);
      });
      assert.throws(function () {
        assert.deepEqual(/a/i, /a/);
      });
      assert.throws(function () {
        assert.deepEqual(/a/m, /a/);
      });
      assert.throws(function () {
        assert.deepEqual(/a/igm, /a/im);
      });
      var re1 = /a/;
      re1.lastIndex = 3;
      assert.throws(function () {
        assert.deepEqual(re1, /a/);
      });
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepEqual(/a/, /a/);
      });
      assert.doesNotThrow(function () {
        assert.deepEqual(/a/g, /a/g);
      });
      assert.doesNotThrow(function () {
        assert.deepEqual(/a/i, /a/i);
      });
      assert.doesNotThrow(function () {
        assert.deepEqual(/a/m, /a/m);
      });
      assert.doesNotThrow(function () {
        assert.deepEqual(/a/igm, /a/igm);
      });
    });
  });

  describe('assert.deepEqual - 7.4', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepEqual(4, '5');
      }, assert.AssertionError, 'deepEqual == check');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepEqual(4, '4');
      }, 'deepEqual == check');

      assert.doesNotThrow(function () {
        assert.deepEqual(true, 1);
      }, 'deepEqual == check');
    });
  });

  describe('assert.deepEqual - 7.5', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepEqual({
          a: 4
        }, {
          a: 4,
          b: true
        });
      }, assert.AssertionError);
      assert.throws(function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];
        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        assert.deepEqual(Object.keys(a1), Object.keys(a2));
      }, assert.AssertionError);
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepEqual({
          a: 4
        }, {
          a: 4
        });
      });
      assert.doesNotThrow(function () {
        assert.deepEqual({
          a: 4,
          b: '2'
        }, {
          a: 4,
          b: '2'
        });
      });
      assert.doesNotThrow(function () {
        assert.deepEqual([4], ['4']);
      });
      assert.doesNotThrow(function () {
        assert.deepEqual(['a'], {
          0: 'a'
        });
      });
      assert.doesNotThrow(function () {
        assert.deepEqual({
          a: 4,
          b: '1'
        }, {
          b: '1',
          a: 4
        });
      });
      assert.doesNotThrow(function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];
        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        assert.deepEqual(a1, a2);
      });
    });
  });

  describe('assert.deepEqual - instances', function () {
    it('should throw an error in each case', function () {
      NameBuilder2.prototype = Object;
      var nb1 = new NameBuilder('John', 'Smith'),
          nb2 = new NameBuilder2('John', 'Smith');
      assert.throws(function () {
        assert.deepEqual(nb1, nb2);
      }, assert.AssertionError);
      assert.throws(function () {
        assert.deepEqual('a', {});
      }, assert.AssertionError);
    });

    it('should not throw an error in each case', function () {
      NameBuilder2.prototype = NameBuilder.prototype;
      var nb1 = new NameBuilder('John', 'Smith'),
          nb2 = new NameBuilder2('John', 'Smith');
      assert.doesNotThrow(function () {
        assert.deepEqual(nb1, nb2);
      });
    });
  });

  describe('assert.deepStrictEqual - 7.2', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepStrictEqual(new Date(), new Date(2000, 3, 14));
      }, assert.AssertionError, 'deepStrictEqual date');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
      }, 'deepStrictEqual date');
    });
  });

  describe('assert.deepStrictEqual - 7.3', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepStrictEqual(/ab/, /a/);
      });
      assert.throws(function () {
        assert.deepStrictEqual(/a/g, /a/);
      });
      assert.throws(function () {
        assert.deepStrictEqual(/a/i, /a/);
      });
      assert.throws(function () {
        assert.deepStrictEqual(/a/m, /a/);
      });
      assert.throws(function () {
        assert.deepStrictEqual(/a/igm, /a/im);
      });
      var re1 = /a/;
      re1.lastIndex = 3;
      assert.throws(function () {
        assert.deepStrictEqual(re1, /a/);
      });
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(/a/, /a/);
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(/a/g, /a/g);
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(/a/i, /a/i);
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(/a/m, /a/m);
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(/a/igm, /a/igm);
      });
    });
  });

  describe('assert.deepStrictEqual - 7.4', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepStrictEqual(4, '5');
      }, assert.AssertionError, 'deepStrictEqual === check');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.throws(4, '4');
      }, 'deepStrictEqual === check');

      assert.throws(function () {
        assert.deepStrictEqual(true, 1);
      }, 'deepStrictEqual === check');
    });
  });

  describe('assert.deepStrictEqual - 7.5', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.deepStrictEqual({
          a: 4
        }, {
          a: 4,
          b: true
        });
      }, assert.AssertionError);
      assert.throws(function () {
        assert.deepStrictEqual([4], ['4']);
      }, assert.AssertionError);
      assert.throws(function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];
        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        assert.deepStrictEqual(Object.keys(a1), Object.keys(a2));
      }, assert.AssertionError);
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.deepStrictEqual({
          a: 4
        }, {
          a: 4
        });
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual({
          a: 4,
          b: '2'
        }, {
          a: 4,
          b: '2'
        });
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(['a'], {
          0: 'a'
        });
      });
      assert.doesNotThrow(function () {
        assert.deepStrictEqual({
          a: 4,
          b: '1'
        }, {
          b: '1',
          a: 4
        });
      });
      assert.doesNotThrow(function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];
        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        assert.deepStrictEqual(a1, a2);
      });
    });
  });

  describe('assert.deepStrictEqual - instances', function () {
    it('should throw an error in each case', function () {
      NameBuilder2.prototype = Object;
      var nb1 = new NameBuilder('John', 'Smith'),
          nb2 = new NameBuilder2('John', 'Smith');
      assert.throws(function () {
        assert.deepStrictEqual(nb1, nb2);
      }, assert.AssertionError);
      assert.throws(function () {
        assert.deepStrictEqual('a', {});
      }, assert.AssertionError);
    });

    it('should not throw an error in each case', function () {
      NameBuilder2.prototype = NameBuilder.prototype;
      var nb1 = new NameBuilder('John', 'Smith'),
          nb2 = new NameBuilder2('John', 'Smith');
      assert.doesNotThrow(function () {
        assert.deepStrictEqual(nb1, nb2);
      });
    });
  });

  describe('assert - Testing the throwing', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        throw new TypeError('test');
      }, TypeError, 'thrower working');
      assert.throws(function () {
        throw new assert.AssertionError({
          message: 'test'
        });
      }, assert.AssertionError, 'thrower working');
    });

    it('should not throw an error in each case', function () {
      // the basic calls work
      assert.doesNotThrow(function () {
        assert.throws(function () {
          throw new assert.AssertionError({
            message: 'test'
          });
        }, assert.AssertionError, 'message');
      });
      assert.doesNotThrow(function () {
        assert.throws(function () {
          throw new assert.AssertionError({
            message: 'test'
          });
        }, assert.AssertionError);
      });
      assert.doesNotThrow(function () {
        assert.throws(function () {
          throw new assert.AssertionError({
            message: 'test'
          });
        });
      });
      // if not passing an error, catch all.
      assert.doesNotThrow(function () {
        assert.throws(function () {
          throw new TypeError('test');
        });
      });
      // when passing a type, only catch errors of the appropriate type
      try {
        assert.throws(function () {
          throw new TypeError('test');
        }, assert.AssertionError);
        assert.fail('throws with an explicit error is eating extra errors');
      } catch (e) {
        assert.ok(e instanceof TypeError, 'threw correct constructor');
        assert.ok(true, 'throws an explicit error is not eating extra errors');
      }
      // doesNotThrow should pass through all errors
      try {
        assert.doesNotThrow(function () {
          throw new TypeError('test');
        }, assert.AssertionError);
        assert.fail('doesNotThrow with an explicit error is eating extra errors');
      } catch (e) {
        assert.ok(e instanceof TypeError, 'threw correct constructor');
        assert.ok(
          true,
          'doesNotThrow with an explicit error is not eating extra errors'
        );
      }

      // key difference is that throwing our correct error makes an assertion
      // error
      try {
        assert.doesNotThrow(function () {
          throw new TypeError('test');
        }, TypeError);
        assert.fail('doesNotThrow is not catching type matching errors');
      } catch (e) {
        assert.ok(e instanceof assert.AssertionError, 'threw correct constructor');
        assert.ok(true, 'doesNotThrow is catching type matching errors');
      }
    });
  });

  describe('assert.ifError', function () {
    it('should throw an error in each case', function () {
      assert.throws(function () {
        assert.ifError(new Error('test error'));
      }, Error, 'error does throw');
    });

    it('should not throw an error in each case', function () {
      assert.doesNotThrow(function () {
        assert.ifError(null);
      }, 'null does not throw');
      assert.doesNotThrow(function () {
        assert.ifError();
      }, 'undefined does not throw');
    });
  });

  describe('assert - test validating using constructor really works', function () {
    it('should not throw an error in each case', function () {
      try {
        assert.throws(function () {
          throw {};
        }, Array);

        assert.fail('wrong constructor validation');
      } catch (e) {
        assert.ok(true, 'correct constructor validation');
      }
    });
  });

  describe('assert - use a RegExp to validate error message', function () {
    it('should not throw an error in each case', function () {
      assert.throws(function () {
        throw new Error('test');
      }, rxTest);
      // does a second call work
      assert.throws(function () {
        throw new TypeError('test');
      }, rxTest);
      assert.throws(function () {
        throw new assert.AssertionError({
          message: 'test'
        });
      }, rxTest);
    });
  });

  describe('assert - set a fn to validate error object', function () {
    it('should not throw an error in each case', function () {
      assert.throws(function () {
        throw new TypeError('test');
      }, function (err) {
        return err instanceof TypeError && rxTest.test(err.toString());
      });
      assert.throws(function () {
        throw new assert.AssertionError({
          message: 'test'
        });
      }, function (err) {
        return err instanceof assert.AssertionError &&
          rxTest.test(err.toString());
      });
    });
  });

  describe('assert - test deepEqual with circular refs', function () {
    it('should not throw an error in each case', function () {
      var b = {},
          c = {};
      b.b = b;
      c.b = c;
      try {
        assert.deepEqual(b, c);
        assert.fail('cirular did not throw');
      } catch (e) {
        assert.ok(true, 'cirular threw');
        assert.equal(e instanceof RangeError, true);
        assert.equal(e.message, 'Circular reference');
      }
    });
  });

  describe('assert - test deepStrictEqual with circular refs', function () {
    it('should not throw an error in each case', function () {
      var b = {},
          c = {};
      b.b = b;
      c.b = c;
      try {
        assert.deepStrictEqual(b, c);
        assert.fail('cirular did not throw');
      } catch (e) {
        assert.ok(true, 'cirular threw');
        assert.equal(e instanceof RangeError, true);
        assert.equal(e.message, 'Circular reference');
      }
    });
  });

  describe('assert - test assertion message', function () {
    it('should not throw an error in each case', function () {
      function testAssertionMessage(actual, expected) {
        try {
          assert.equal(actual, '');
        } catch (e) {
          assert.equal(
            e.toString(),
            'AssertionError: ' + expected + ' == ""'
          );
        }
      }
      testAssertionMessage(undefined, '"undefined"');
      testAssertionMessage(null, 'null');
      testAssertionMessage(true, 'true');
      testAssertionMessage(false, 'false');
      testAssertionMessage(0, '0');
      testAssertionMessage(100, '100');
      testAssertionMessage(NaN, '"NaN"');
      testAssertionMessage(Infinity, '"Infinity"');
      testAssertionMessage(-Infinity, '"-Infinity"');
      testAssertionMessage('', '""');
      testAssertionMessage('foo', '"foo"');
      testAssertionMessage([], '[]');
      testAssertionMessage([1, 2, 3], '[1,2,3]');
      testAssertionMessage(/a/, '"/a/"');
      testAssertionMessage(noop, JSON.stringify(noop.toString()));
      testAssertionMessage({}, '{}');
      testAssertionMessage({
        a: undefined,
        b: null
      }, '{"a":"undefined","b":null}');
      testAssertionMessage({
        a: NaN,
        b: Infinity,
        c: -Infinity
      }, '{"a":"NaN","b":"Infinity","c":"-Infinity"}');
    });
  });

  describe('assert - regressions from node.js testcase', function () {
    it('should not throw an error in each case', function () {
      var threw = false;
      try {
        assert.throws(function () {
          assert.ifError(null);
        });
      } catch (e) {
        threw = true;
        assert.equal(e.message, 'Missing expected exception..');
      }
      assert.ok(threw, 'null threw error');
      try {
        assert.equal(1, 2);
      } catch (e) {
        assert.equal(e.toString(), 'AssertionError: 1 == 2');
      }
      try {
        assert.equal(1, 2, 'oh no');
      } catch (e) {
        assert.equal(e.toString(), 'AssertionError: oh no');
      }
    });
  });
}());
