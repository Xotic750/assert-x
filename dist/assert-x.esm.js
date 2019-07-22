function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import { AssertionErrorConstructor, isError } from 'error-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isFunction from 'is-function-x';
import reduce from 'array-reduce-x';
import defineProperty from 'object-define-property-x';
import defineProperties from 'object-define-properties-x';
import { isDeepEqual, isDeepStrictEqual } from 'is-deep-strict-equal-x';
import assign from 'object-assign-x';
/** @type {BooleanConstructor} */

var castBoolean = true.constructor;
var truncOpts = ['length', 'omission', 'separator'];
var rxTest = /none/.test;
var assertTruncate = defineProperties({}, {
  length: {
    value: 128,
    writable: true
  },
  omission: {
    value: '',
    writable: true
  },
  separator: {
    value: '',
    writable: true
  }
});

var isStringType = function isStringType(value) {
  return typeof value === 'string';
};
/**
 * Extends `arg` with the `truncate` options.
 *
 * @private
 * @param {object} arg - The object to extend.
 * @param {string} name - The `truncate` option name.
 * @returns {object} The `arg` object.
 */


var extendOpts = function extendOpts(arg, name) {
  arg[name] = assertTruncate[name];
  return arg;
};
/**
 * Throws an exception that displays the values for actual and expected
 * separated by the provided operator.
 *
 * @private
 * @param {*} actual - The actual value to be tested.
 * @param {*} expected - The expected value to compare against actual.
 * @param {string} message - Text description of test.
 * @param {string} operator - The compare operator.
 * @throws {Error} Throws an `AssertionError`.
 */


var baseFail = function baseFail(actual, expected, message, operator) {
  var arg = {
    actual: actual,
    expected: expected,
    message: message,
    operator: operator
  };
  reduce(truncOpts, extendOpts, arg);
  throw new AssertionErrorConstructor(arg);
};
/**
 * Returns whether an exception is expected. Used by throws.
 *
 * @private
 * @param {*} actual - The actual value to be tested.
 * @param {*} expected - The expected value to compare against actual.
 * @returns {boolean} True if exception expected, otherwise false.
 */


var expectedException = function expectedException(actual, expected) {
  if (castBoolean(actual) === false || castBoolean(expected) === false) {
    return false;
  }

  if (isRegExp(expected)) {
    return rxTest.call(expected, safeToString(actual));
  }

  if (actual instanceof expected) {
    return true;
  }

  if (isFunction(expected)) {
    return expected.call({}, actual) === true;
  }

  return false;
};
/**
 * Returns whether an exception is expected. Used by assertx~throws and
 * assertx~doesNotThrow.
 *
 * @private
 * @param {boolean} shouldThrow - True if it should throw, otherwise false.
 * @param {Function} fn - The function block to be executed in testing.
 * @param {*} expected - The expected value to compare against actual.
 * @param {string} [message] - Text description of test.
 */


var baseThrows = function baseThrows(shouldThrow, fn, expected, message) {
  var msg = message;
  var clause1 = castBoolean(msg) === false || isStringType(msg) === false;

  if (isFunction(fn) === false) {
    throw new TypeError("The \"fn\" argument must be of type Function. Received type ".concat(_typeof(fn)));
  }

  var xpd = expected;

  if (clause1 && isStringType(xpd)) {
    msg = xpd;
    /* eslint-disable-next-line no-void */

    xpd = void 0;
  }

  var actual;

  try {
    fn();
  } catch (e) {
    actual = e;
  }

  var wasExceptionExpected = expectedException(actual, xpd);
  clause1 = xpd && isStringType(xpd.name) && xpd.name;
  var part1 = clause1 ? " (".concat(xpd.name, ").") : '.';
  var part2 = msg ? " ".concat(msg) : '.';
  msg = (part1 === '.' ? '' : part1) + part2;

  if (shouldThrow && castBoolean(actual) === false) {
    baseFail(actual, xpd, "Missing expected exception".concat(msg), '');
  } else if (castBoolean(shouldThrow) === false && wasExceptionExpected) {
    baseFail(actual, xpd, "Got unwanted exception".concat(msg), '');
  } else {
    var clause2;

    if (shouldThrow) {
      clause1 = actual && xpd && castBoolean(wasExceptionExpected) === false;
    } else {
      clause1 = false;
      clause2 = actual;
    }

    if (clause1 || clause2) {
      throw actual;
    }
  }
};
/**
 * Common function for `assert` and `assert~ok`.
 *
 * @private
 * @param {*} value - The value to be tested.
 * @param {string} message - Text description of test.
 * @param {string} operator - Text description of test operator.
 */


var baseAssert = function baseAssert(value, message, operator) {
  if (castBoolean(value) === false) {
    baseFail(false, true, message, operator);
  }
};
/**
 * Tests if value is truthy, it is equivalent to `equal(!!value, true, message)`.
 *
 * @param {*} value - The value to be tested.
 * @param {string} message - Text description of test.
 */


var assert = function assert(value, message) {
  baseAssert(value, message, 'ok');
};

var assertMethods = {
  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @class
   * @augments Error
   * @param {object} [message] - Need to document the properties.
   */
  AssertionError: {
    value: AssertionErrorConstructor
  },

  /**
   * Tests for deep equality, coercive equality with the equal comparison
   * operator ( == ) and equivalent.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  deepEqual: {
    value: function deepEqual(actual, expected, message) {
      if (isDeepEqual(actual, expected) === false) {
        baseFail(actual, expected, message, 'deepEqual');
      }
    }
  },

  /**
   * Tests for deep equality, coercive equality with the equal comparison
   * operator ( === ) and equivalent.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  deepStrictEqual: {
    value: function deepStrictEqual(actual, expected, message) {
      if (isDeepStrictEqual(actual, expected) === false) {
        baseFail(actual, expected, message, 'deepStrictEqual');
      }
    }
  },

  /**
   * Expects block not to throw an error, see assert~throws for details.
   *
   * @param {Function} fn - The function block to be executed in testing.
   * @param {constructor} [error] - The comparator.
   * @param {string} [message] - Text description of test.
   */
  doesNotThrow: {
    value: function doesNotThrow(fn, error, message) {
      baseThrows(false, fn, error, message);
    }
  },

  /**
   * Tests shallow, coercive equality with the equal comparison
   * operator ( == ).
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  equal: {
    value: function equal(actual, expected, message) {
      // noinspection EqualityComparisonWithCoercionJS
      if (actual != expected
      /* eslint-disable-line eqeqeq */
      ) {
          baseFail(actual, expected, message, '==');
        }
    }
  },

  /**
   * Throws an exception that displays the values for actual and expected
   * separated by the provided operator.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   * @param {string} operator - The compare operator.
   * @throws {Error} Throws an `AssertionError`.
   */
  fail: {
    value: function fail(actual, expected, message) {
      var operator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '!=';

      if (arguments.length < 2) {
        if (isError(actual)) {
          throw actual;
        }
        /* eslint-disable-next-line no-void */


        baseFail(actual, void 0, arguments.length ? actual : 'Failed', 'fail');
      } else {
        if (isError(message)) {
          throw message;
        }

        baseFail(actual, expected, message, operator);
      }
    }
  },

  /**
   * Tests if value is not a falsy value, throws if it is a truthy value.
   * Useful when testing the first argument, error in callbacks.
   *
   * @param {*} err - The value to be tested for truthiness.
   * @throws {*} The value `err` if truthy.
   */
  ifError: {
    value: function ifError(err) {
      if (err) {
        throw err;
      }
    }
  },

  /**
   * Tests for any deep inequality. Opposite of `deepEqual`.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  notDeepEqual: {
    value: function notDeepEqual(actual, expected, message) {
      if (isDeepEqual(actual, expected)) {
        baseFail(actual, expected, message, 'notDeepEqual');
      }
    }
  },

  /**
   * Tests for deep inequality. Opposite of `deepStrictEqual`.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  notDeepStrictEqual: {
    value: function notDeepStrictEqual(actual, expected, message) {
      if (isDeepStrictEqual(actual, expected)) {
        baseFail(actual, expected, message, 'notDeepStrictEqual');
      }
    }
  },

  /**
   * Tests shallow, coercive non-equality with the not equal comparison
   * operator ( != ).
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  notEqual: {
    value: function notEqual(actual, expected, message) {
      // noinspection EqualityComparisonWithCoercionJS
      if (actual == expected
      /* eslint-disable-line eqeqeq */
      ) {
          baseFail(actual, expected, message, '!=');
        }
    }
  },

  /**
   * Tests strict non-equality, as determined by the strict not equal
   * operator ( !== ).
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  notStrictEqual: {
    value: function notStrictEqual(actual, expected, message) {
      if (actual === expected) {
        baseFail(actual, expected, message, 'notStrictEqual');
      }
    }
  },

  /**
   * Tests if value is truthy, it is equivalent to
   * `equal(!!value, true, message)`.
   *
   * @param {*} value - The value to be tested.
   * @param {string} [message] - Text description of test.
   */
  ok: {
    value: function ok(value, message) {
      baseAssert(value, message, 'ok');
    }
  },

  /**
   * Tests strict equality, as determined by the strict equality
   * operator ( === ).
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against actual.
   * @param {string} [message] - Text description of test.
   */
  strictEqual: {
    value: function strictEqual(actual, expected, message) {
      if (actual !== expected) {
        baseFail(actual, expected, message, 'strictEqual');
      }
    }
  },

  /**
   * Expects block to throw an error. `error` can be constructor, regexp or
   * validation function.
   *
   * @param {Function} fn - The function block to be executed in testing.
   * @param {constructor|RegExp|Function} [error] - The comparator.
   * @param {string} [message] - Text description of test.
   */
  throws: {
    value: function throws(fn, error, message) {
      baseThrows(true, fn, error, message);
    }
  }
};
defineProperties(assert, assertMethods);
/**
 * Allows `truncate` options of AssertionError to be modified. The
 * `truncate` used is the one from `lodash`.
 *
 * @name truncate
 * @type {object}
 * @property {number} length=128 - The maximum string length.
 * @property {string} omission='' - The string to indicate text is omitted.
 * @property {RegExp|string} separator='' - The pattern to truncate to.
 * @see {@link https://github.com/Xotic750/truncate-x}
 */

defineProperty(assert, 'truncate', {
  enumerable: true,
  value: assertTruncate
});
export default assert; // Expose a strict only variant of assert

export function strict(value, message) {
  baseAssert(value, message, 'ok');
}
var strictMethods = assign({}, assertMethods, {
  equal: assertMethods.strictEqual,
  deepEqual: assertMethods.deepStrictEqual,
  notEqual: assertMethods.notStrictEqual,
  notDeepEqual: assertMethods.notDeepStrictEqual
});
defineProperties(strict, strictMethods);
defineProperty(strict, 'truncate', {
  enumerable: true,
  value: assertTruncate
});

//# sourceMappingURL=assert-x.esm.js.map