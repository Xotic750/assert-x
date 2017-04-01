/* eslint strict: 1, max-statements: 1, max-lines: 1, symbol-description: 1,
   no-proto: 1, no-invalid-this: 1, sort-keys: 1, no-throw-literal: 1 */

/* global JSON:true, module, require, describe, it, returnExports */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var assert;
  if (typeof module === 'object' && module.exports) {
    require('es5-shim');
    require('es5-shim/es5-sham');
    if (typeof JSON === 'undefined') {
      JSON = {};
    }
    require('json3').runInContext(null, JSON);
    require('es6-shim');
    var es7 = require('es7-shim');
    Object.keys(es7).forEach(function (key) {
      var obj = es7[key];
      if (typeof obj.shim === 'function') {
        obj.shim();
      }
    });
    assert = require('../../index.js');
  } else {
    assert = returnExports;
  }
  var a = assert;
  var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

  describe('Node\'s test-assert', function () {
    var a1 = [1, 2, 3];
    var a2 = [1, 2, 3];

    a1.a = 'test';
    a1.b = true;
    a2.b = true;
    a2.a = 'test';

    var makeBlock = function (f) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function () {
        return f.apply(this, args);
      };
    };

    var protoCtrChain = function (o) {
      var result = [];
      for (var x = o; x; x = x.__proto__) {
        result.push(x.constructor);
      }
      return result.join();
    };

    var indirectInstanceOf = function (obj, cls) {
      if (obj instanceof cls) {
        return true;
      }
      var clsChain = protoCtrChain(cls.prototype);
      var objChain = protoCtrChain(obj);
      return objChain.slice(-clsChain.length) === clsChain;
    };

    it('AssertionError', function () {
      assert.ok(
        indirectInstanceOf(a.AssertionError.prototype, Error),
        'a.AssertionError instanceof Error'
      );
    });

    it('ok', function () {
      assert.throws(makeBlock(a, false), a.AssertionError, 'ok(false)');
      assert.doesNotThrow(makeBlock(a, true), a.AssertionError, 'ok(true)');
      assert.doesNotThrow(makeBlock(a, 'test', 'ok(\'test\')'));
      assert.throws(makeBlock(a.ok, false), a.AssertionError, 'ok(false)');
      assert.doesNotThrow(makeBlock(a.ok, true), a.AssertionError, 'ok(true)');
      assert.doesNotThrow(makeBlock(a.ok, 'test'), 'ok(\'test\')');
    });

    it('equal', function () {
      assert.throws(makeBlock(a.equal, true, false), a.AssertionError, 'equal');
      assert.doesNotThrow(makeBlock(a.equal, null, null), 'equal');
      assert.doesNotThrow(makeBlock(a.equal, undefined, undefined), 'equal');
      assert.doesNotThrow(makeBlock(a.equal, null, undefined), 'equal');
      assert.doesNotThrow(makeBlock(a.equal, true, true), 'equal');
      assert.doesNotThrow(makeBlock(a.equal, 2, '2'), 'equal');
    });

    it('notEqual', function () {
      assert.doesNotThrow(makeBlock(a.notEqual, true, false), 'notEqual');
      assert.throws(
        makeBlock(a.notEqual, true, true),
        a.AssertionError,
        'notEqual'
      );
    });

    it('strictEqual', function () {
      assert.throws(
        makeBlock(a.strictEqual, 2, '2'),
        a.AssertionError,
        'strictEqual'
      );
      assert.throws(
        makeBlock(a.strictEqual, null, undefined),
        a.AssertionError,
        'strictEqual'
      );
    });

    it('notStrictEqual', function () {
      assert.doesNotThrow(
        makeBlock(a.notStrictEqual, 2, '2'),
        'notStrictEqual'
      );
    });

    it('deepEqual', function () {
      // deepEquals joy!
      // 7.2
      assert.doesNotThrow(makeBlock(a.deepEqual, new Date(2000, 3, 14),
        new Date(2000, 3, 14)), 'deepEqual date');

      assert.throws(makeBlock(a.deepEqual, new Date(), new Date(2000, 3, 14)),
        a.AssertionError,
        'deepEqual date');

      // 7.3
      assert.doesNotThrow(makeBlock(a.deepEqual, /a/, /a/));
      assert.doesNotThrow(makeBlock(a.deepEqual, /a/g, /a/g));
      assert.doesNotThrow(makeBlock(a.deepEqual, /a/i, /a/i));
      assert.doesNotThrow(makeBlock(a.deepEqual, /a/m, /a/m));
      assert.doesNotThrow(makeBlock(a.deepEqual, /a/igm, /a/igm));
      assert.throws(makeBlock(a.deepEqual, /ab/, /a/));
      assert.throws(makeBlock(a.deepEqual, /a/g, /a/));
      assert.throws(makeBlock(a.deepEqual, /a/i, /a/));
      assert.throws(makeBlock(a.deepEqual, /a/m, /a/));
      assert.throws(makeBlock(a.deepEqual, /a/igm, /a/im));

      var re1 = /a/;
      re1.lastIndex = 3;
      assert.throws(makeBlock(a.deepEqual, re1, /a/));

      // 7.4
      assert.doesNotThrow(
        makeBlock(a.deepEqual, 4, '4'),
        'deepEqual == check'
      );
      assert.doesNotThrow(
        makeBlock(a.deepEqual, true, 1),
        'deepEqual == check'
      );
      assert.throws(
        makeBlock(a.deepEqual, 4, '5'),
        a.AssertionError,
        'deepEqual == check'
      );

      // 7.5
      // having the same number of owned properties && the same set of keys
      assert.doesNotThrow(makeBlock(a.deepEqual, { a: 4 }, { a: 4 }));
      assert.doesNotThrow(makeBlock(a.deepEqual, {
        a: 4,
        b: '2'
      }, {
        a: 4,
        b: '2'
      }));
      assert.doesNotThrow(makeBlock(a.deepEqual, [4], ['4']));
      assert.throws(makeBlock(a.deepEqual, { a: 4 }, {
        a: 4,
        b: true
      }),
        a.AssertionError);
      assert.doesNotThrow(makeBlock(a.deepEqual, ['a'], { 0: 'a' }));
      // (although not necessarily the same order),
      assert.doesNotThrow(makeBlock(a.deepEqual, {
        a: 4,
        b: '1'
      }, {
        b: '1',
        a: 4
      }));
      assert.throws(makeBlock(a.deepEqual, Object.keys(a1), Object.keys(a2)),
        a.AssertionError);
      assert.doesNotThrow(makeBlock(a.deepEqual, a1, a2));

      // having an identical prototype property
      var nbRoot = {
        toString: function () {
          return this.first + ' ' + this.last;
        }
      };

      var NameBuilder = function (first, last) {
        this.first = first;
        this.last = last;
        return this;
      };
      NameBuilder.prototype = nbRoot;

      var NameBuilder2 = function (first, last) {
        this.first = first;
        this.last = last;
        return this;
      };
      NameBuilder2.prototype = nbRoot;

      var nb1 = new NameBuilder('Ryan', 'Dahl');
      var nb2 = new NameBuilder2('Ryan', 'Dahl');

      assert.doesNotThrow(makeBlock(a.deepEqual, nb1, nb2));

      NameBuilder2.prototype = Object;
      nb2 = new NameBuilder2('Ryan', 'Dahl');
      assert.doesNotThrow(makeBlock(a.deepEqual, nb1, nb2));

      // primitives and object
      assert.throws(makeBlock(a.deepEqual, null, {}), a.AssertionError);
      assert.throws(makeBlock(a.deepEqual, undefined, {}), a.AssertionError);
      assert.throws(makeBlock(a.deepEqual, 'a', ['a']), a.AssertionError);
      assert.throws(makeBlock(a.deepEqual, 'a', { 0: 'a' }), a.AssertionError);
      assert.throws(makeBlock(a.deepEqual, 1, {}), a.AssertionError);
      assert.throws(makeBlock(a.deepEqual, true, {}), a.AssertionError);
      if (hasSymbols) {
        assert.throws(makeBlock(a.deepEqual, Symbol(), {}), a.AssertionError);
      }

      // primitive wrappers and object
      assert.doesNotThrow(makeBlock(a.deepEqual, Object('a'), ['a']),
        a.AssertionError);
      assert.doesNotThrow(makeBlock(a.deepEqual, Object('a'), { 0: 'a' }),
        a.AssertionError);
      assert.doesNotThrow(makeBlock(a.deepEqual, Object(1), {}),
        a.AssertionError);
      assert.doesNotThrow(makeBlock(a.deepEqual, Object(true), {}),
        a.AssertionError);
    });

    it('deepStrictEqual', function () {
      // deepStrictEqual
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, new Date(2000, 3, 14),
        new Date(2000, 3, 14)), 'deepStrictEqual date');

      assert.throws(
        makeBlock(a.deepStrictEqual, new Date(), new Date(2000, 3, 14)),
        a.AssertionError,
        'deepStrictEqual date'
      );

      // 7.3 - strict
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/, /a/));
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/g, /a/g));
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/i, /a/i));
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/m, /a/m));
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/igm, /a/igm));
      assert.throws(makeBlock(a.deepStrictEqual, /ab/, /a/));
      assert.throws(makeBlock(a.deepStrictEqual, /a/g, /a/));
      assert.throws(makeBlock(a.deepStrictEqual, /a/i, /a/));
      assert.throws(makeBlock(a.deepStrictEqual, /a/m, /a/));
      assert.throws(makeBlock(a.deepStrictEqual, /a/igm, /a/im));

      var re1 = /a/;
      re1.lastIndex = 3;
      assert.throws(makeBlock(a.deepStrictEqual, re1, /a/));

      // 7.4 - strict
      assert.throws(makeBlock(a.deepStrictEqual, 4, '4'),
        a.AssertionError,
        'deepStrictEqual === check');

      assert.throws(makeBlock(a.deepStrictEqual, true, 1),
        a.AssertionError,
        'deepStrictEqual === check');

      assert.throws(makeBlock(a.deepStrictEqual, 4, '5'),
        a.AssertionError,
        'deepStrictEqual === check');

      // 7.5 - strict
      // having the same number of owned properties && the same set of keys
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, { a: 4 }, { a: 4 }));
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, {
        a: 4,
        b: '2'
      }, {
        a: 4,
        b: '2'
      }));
      assert.throws(makeBlock(a.deepStrictEqual, [4], ['4']));
      assert.throws(makeBlock(a.deepStrictEqual, { a: 4 }, {
        a: 4,
        b: true
      }),
        a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, ['a'], { 0: 'a' }));
      // (although not necessarily the same order),
      assert.doesNotThrow(makeBlock(a.deepStrictEqual, {
        a: 4,
        b: '1'
      }, {
        b: '1',
        a: 4
      }));

      assert.throws(
        makeBlock(a.deepStrictEqual, [0, 1, 2, 'a', 'b'], [0, 1, 2, 'b', 'a']),
        a.AssertionError
      );

      assert.doesNotThrow(makeBlock(a.deepStrictEqual, a1, a2));

      // Prototype check
      var Constructor1 = function (first, last) {
        this.first = first;
        this.last = last;
      };

      var Constructor2 = function (first, last) {
        this.first = first;
        this.last = last;
      };

      var obj1 = new Constructor1('Ryan', 'Dahl');
      var obj2 = new Constructor2('Ryan', 'Dahl');

      assert.throws(makeBlock(a.deepStrictEqual, obj1, obj2), a.AssertionError);

      Constructor2.prototype = Constructor1.prototype;
      obj2 = new Constructor2('Ryan', 'Dahl');

      assert.doesNotThrow(makeBlock(a.deepStrictEqual, obj1, obj2));

      // primitives
      assert.throws(makeBlock(assert.deepStrictEqual, 4, '4'),
        a.AssertionError);
      assert.throws(makeBlock(assert.deepStrictEqual, true, 1),
        a.AssertionError);
      if (hasSymbols) {
        assert.throws(makeBlock(assert.deepStrictEqual, Symbol(), Symbol()),
          a.AssertionError);

        var s = Symbol();
        assert.doesNotThrow(makeBlock(assert.deepStrictEqual, s, s));
      }

      // primitives and object
      assert.throws(makeBlock(a.deepStrictEqual, null, {}), a.AssertionError);
      assert.throws(
        makeBlock(a.deepStrictEqual, undefined, {}),
        a.AssertionError
      );
      assert.throws(makeBlock(a.deepStrictEqual, 'a', ['a']), a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, 'a', { 0: 'a' }), a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, 1, {}), a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, true, {}), a.AssertionError);
      if (hasSymbols) {
        assert.throws(makeBlock(assert.deepStrictEqual, Symbol(), {}),
          a.AssertionError);
      }

      // primitive wrappers and object
      assert.throws(makeBlock(a.deepStrictEqual, Object('a'), ['a']),
        a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, Object('a'), { 0: 'a' }),
        a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, Object(1), {}),
        a.AssertionError);
      assert.throws(makeBlock(a.deepStrictEqual, Object(true), {}),
        a.AssertionError);
    });

    it('throwing', function () {
      // Testing the throwing
      var thrower = function (ErrorConstructor) {
        throw new ErrorConstructor('test');
      };

      // the basic calls work
      assert.throws(makeBlock(thrower, a.AssertionError),
        a.AssertionError, 'message');
      assert.throws(makeBlock(thrower, a.AssertionError), a.AssertionError);
      assert.throws(makeBlock(thrower, a.AssertionError));

      // if not passing an error, catch all.
      assert.throws(makeBlock(thrower, TypeError));

      // when passing a type, only catch errors of the appropriate type
      var threw = false;
      try {
        a.throws(makeBlock(thrower, TypeError), a.AssertionError);
      } catch (e) {
        threw = true;
        assert.ok(e instanceof TypeError, 'type');
      }
      assert.equal(true, threw,
        'a.throws with an explicit error is eating extra errors',
        a.AssertionError);
      threw = false;

      // doesNotThrow should pass through all errors
      try {
        a.doesNotThrow(makeBlock(thrower, TypeError), a.AssertionError);
      } catch (e) {
        threw = true;
        assert.ok(e instanceof TypeError);
      }
      assert.equal(true, threw,
        'a.doesNotThrow with an explicit error is eating extra errors');

      // key difference is that throwing our correct error makes an
      // assertion error
      try {
        a.doesNotThrow(makeBlock(thrower, TypeError), TypeError);
      } catch (e) {
        threw = true;
        assert.ok(e instanceof a.AssertionError);
      }
      assert.equal(true, threw,
        'a.doesNotThrow is not catching type matching errors');

      assert.throws(function () {
        assert.ifError(new Error('test error'));
      });
      assert.doesNotThrow(function () {
        assert.ifError(null);
      });
      assert.doesNotThrow(function () {
        assert.ifError();
      });

      // make sure that validating using constructor really works
      threw = false;
      try {
        assert.throws(function () {
          throw {};
        }, Array);
      } catch (e) {
        threw = true;
      }
      assert.ok(threw, 'wrong constructor validation');

      // use a RegExp to validate error message
      a.throws(makeBlock(thrower, TypeError), /test/);

      // use a fn to validate error object
      a.throws(makeBlock(thrower, TypeError), function (err) {
        if (err instanceof TypeError && (/test/).test(err)) {
          return true;
        }
        return false;
      });
    });

    it('GH-207', function () {
      // GH-207. Make sure deepEqual doesn't loop forever on circular refs

      var b = {};
      b.b = b;

      var c = {};
      c.b = c;

      var gotError = false;
      try {
        assert.deepEqual(b, c);
      } catch (e) {
        gotError = true;
      }
      assert.ok(gotError);
    });

    it('GH-7178', function () {
      // GH-7178. Ensure reflexivity of deepEqual with `arguments` objects.
      var args = (function () {
        return arguments;
      }());
      a.throws(makeBlock(a.deepEqual, [], args));
      a.throws(makeBlock(a.deepEqual, args, []));

      var circular = { y: 1 };
      circular.x = circular;

      var testAssertionMessage = function (actual, expected) {
        try {
          assert.equal(actual, '');
        } catch (e) {
          assert.equal(
            e.toString(),
            'AssertionError: ' + expected + ' == \'\''
          );
          assert.ok(e.generatedMessage, 'Message not marked as generated');
        }
      };

      testAssertionMessage(undefined, 'undefined');
      testAssertionMessage(null, 'null');
      testAssertionMessage(true, 'true');
      testAssertionMessage(false, 'false');
      testAssertionMessage(0, '0');
      testAssertionMessage(100, '100');
      testAssertionMessage(NaN, 'NaN');
      testAssertionMessage(Infinity, 'Infinity');
      testAssertionMessage(-Infinity, '-Infinity');
      testAssertionMessage('', '""');
      testAssertionMessage('foo', '\'foo\'');
      testAssertionMessage([], '[]');
      testAssertionMessage([1, 2, 3], '[ 1, 2, 3 ]');
      testAssertionMessage(/a/, '/a/');
      testAssertionMessage(/abc/gim, '/abc/gim');
      testAssertionMessage(function f() {}, '[Function: f]');
      testAssertionMessage(function () {}, '[Function]');
      testAssertionMessage({}, '{}');
      testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
      testAssertionMessage({
        a: undefined,
        b: null
      }, '{ a: undefined, b: null }');
      testAssertionMessage({
        a: NaN,
        b: Infinity,
        c: -Infinity
      },
        '{ a: NaN, b: Infinity, c: -Infinity }');
    });

    it('#2893', function () {
      // #2893
      var threw = false;
      try {
        assert.throws(function () {
          assert.ifError(null);
        });
      } catch (e) {
        threw = true;
        assert.equal(e.message, 'Missing expected exception..');
      }
      assert.ok(threw);
    });

    it('#5292', function () {
      // #5292
      try {
        assert.equal(1, 2);
      } catch (e) {
        assert.equal(e.toString().split('\n')[0], 'AssertionError: 1 == 2');
        assert.ok(e.generatedMessage, 'Message not marked as generated');
      }

      try {
        assert.equal(1, 2, 'oh no');
      } catch (e) {
        assert.equal(e.toString().split('\n')[0], 'AssertionError: oh no');
        assert.equal(e.generatedMessage, false,
          'Message incorrectly marked as generated');
      }
    });

    it('non-function block', function () {
      // Verify that throws() and doesNotThrow() throw on non-function block
      var testBlockTypeError = function (method, block) {
        var threw = true;

        try {
          method(block);
          threw = false;
        } catch (e) {
          assert.equal(e.toString(), 'TypeError: block must be a function');
        }

        assert.ok(threw);
      };

      testBlockTypeError(assert.throws, 'string');
      testBlockTypeError(assert.doesNotThrow, 'string');
      testBlockTypeError(assert.throws, 1);
      testBlockTypeError(assert.doesNotThrow, 1);
      testBlockTypeError(assert.throws, true);
      testBlockTypeError(assert.doesNotThrow, true);
      testBlockTypeError(assert.throws, false);
      testBlockTypeError(assert.doesNotThrow, false);
      testBlockTypeError(assert.throws, []);
      testBlockTypeError(assert.doesNotThrow, []);
      testBlockTypeError(assert.throws, {});
      testBlockTypeError(assert.doesNotThrow, {});
      testBlockTypeError(assert.throws, /foo/);
      testBlockTypeError(assert.doesNotThrow, /foo/);
      testBlockTypeError(assert.throws, null);
      testBlockTypeError(assert.doesNotThrow, null);
      testBlockTypeError(assert.throws, undefined);
      testBlockTypeError(assert.doesNotThrow, undefined);
    });

    it('https://github.com/nodejs/node/issues/3275', function () {
      // https://github.com/nodejs/node/issues/3275
      assert.throws(function () {
        throw 'error';
      }, function (err) {
        return err === 'error';
      });
      assert.throws(function () {
        throw new Error();
      }, function (err) {
        return err instanceof Error;
      });
    });
  });
}());
