/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/assert-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * A Javascript assertion library.
 *
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @see https://nodejs.org/api/assert.html
 * @module assert-x
 */

'use strict';

var errorx = require('error-x');
var AssertionError = errorx.AssertionError;
var isRegExp = require('is-regex');
var safeToString = require('safe-to-string-x');
var isFunction = require('is-function-x');
var isObjectLike = require('is-object-like-x');
var reduce = require('reduce');
var define = require('define-properties-x');
var deepEql = require('deep-equal-x');
var truncOpts = ['length', 'omission', 'separator'];
var assertIt;

var isStringType = function _isStringType(value) {
  return typeof value === 'string';
};

/**
 * Extends `arg` with the `truncate` options.
 *
 * @private
 * @param {Object} arg The object to extend.
 * @param {string} name The `truncate` option name.
 * @return {Object} The `arg` object.
 */
var extendOpts = function _extendOpts(arg, name) {
  arg[name] = assertIt.truncate[name];
  return arg;
};

/**
 * Throws an exception that displays the values for actual and expected
 * separated by the provided operator.
 *
 * @private
 * @param {*} actual The actual value to be tested.
 * @param {*} expected The expected value to compare against actual.
 * @param {string} message Text description of test.
 * @param {string} operator The compare operator.
 * @throws {Error} Throws an `AssertionError`.
 */
// eslint-disable-next-line max-params
var baseFail = function _baseFail(actual, expected, message, operator) {
  var arg = {
    actual: actual,
    expected: expected,
    message: message,
    operator: operator
  };
  if (isObjectLike(assertIt.truncate)) {
    reduce(truncOpts, extendOpts, arg);
  }
  throw new AssertionError(arg);
};

/**
 * Returns whether an exception is expected. Used by throws.
 *
 * @private
 * @param {*} actual The actual value to be tested.
 * @param {*} expected The expected value to compare against actual.
 * @return {boolean} True if exception expected, otherwise false.
 */
var expectedException = function _expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }
  if (isRegExp(expected)) {
    return expected.test(safeToString(actual));
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
 * @param {boolean} shouldThrow True if it should throw, otherwise false.
 * @param {Function} block The function block to be executed in testing.
 * @param {*} expected The expected value to compare against actual.
 * @param {string} [message] Text description of test.
 */
 // eslint-disable-next-line max-params
var baseThrows = function _baseThrows(shouldThrow, block, expected, message) {
  var msg = message;
  var clause1 = !msg || !isStringType(msg);
  if (!isFunction(block)) {
    throw new TypeError('block must be a function');
  }

  var xpd = expected;
  if (clause1 && isStringType(xpd)) {
    msg = xpd;
    xpd = void 0;
  }
  var actual;
  try {
    block();
  } catch (e) {
    actual = e;
  }
  var wasExceptionExpected = expectedException(actual, xpd);
  clause1 = xpd && isStringType(xpd.name) && xpd.name;
  msg = (clause1 ? ' (' + xpd.name + ').' : '.') + (msg ? ' ' + msg : '.');
  if (shouldThrow && !actual) {
    baseFail(actual, xpd, 'Missing expected exception' + msg);
  } else if (!shouldThrow && wasExceptionExpected) {
    baseFail(actual, xpd, 'Got unwanted exception' + msg);
  } else {
    var clause2;
    if (shouldThrow) {
      clause1 = actual && xpd && !wasExceptionExpected;
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
 * @param {*} value The value to be tested.
 * @param {string} message Text description of test.
 * @param {string} operator Text description of test operator.
 */
var baseAssert = function _baseAssert(value, message, operator) {
  if (!value) {
    baseFail(false, true, message, operator);
  }
};

/**
 * Tests if value is truthy, it is equivalent to
 * `equal(!!value, true, message)`.
 *
 * @param {*} value The value to be tested.
 * @param {string} message Text description of test.
 */
assertIt = function assert(value, message) {
  baseAssert(value, message, 'ok');
};
define.properties(assertIt, {
  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @constructor
   * @augments Error
   * @param {Object} [message] Need to document the properties.
   */
  AssertionError: AssertionError,
  /**
   * Tests for deep equality, coercive equality with the equal comparison
   * operator ( == ) and equivalent.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  deepEqual: function _deepEqual(actual, expected, message) {
    if (!deepEql(actual, expected)) {
      baseFail(actual, expected, message, 'deepEqual');
    }
  },
  /**
   * Tests for deep equality, coercive equality with the equal comparison
   * operator ( === ) and equivalent.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  deepStrictEqual: function _deepStrictEqual(actual, expected, message) {
    if (!deepEql(actual, expected, true)) {
      baseFail(actual, expected, message, 'deepStrictEqual');
    }
  },
  /**
   * Expects block not to throw an error, see assert~throws for details.
   *
   * @param {Function} block The function block to be executed in testing.
   * @param {constructor} [error] The comparator.
   * @param {string} [message] Text description of test.
   */
  doesNotThrow: function _doesNotThrow(block, error, message) {
    baseThrows(false, block, error, message);
  },
  /**
   * Tests shallow, coercive equality with the equal comparison
   * operator ( == ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  equal: function _equal(actual, expected, message) {
    if (actual != expected) { // eslint-disable-line eqeqeq
      baseFail(actual, expected, message, '==');
    }
  },
  /**
   * Throws an exception that displays the values for actual and expected
   * separated by the provided operator.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   * @param {string} operator The compare operator.
   * @throws {Error} Throws an `AssertionError`.
   */
  fail: baseFail,
  /**
   * Tests if value is not a falsy value, throws if it is a truthy value.
   * Useful when testing the first argument, error in callbacks.
   *
   * @param {*} err The value to be tested for truthiness.
   * @throws {*} The value `err` if truthy.
   */
  ifError: function _ifError(err) {
    if (err) {
      throw err;
    }
  },
  /**
   * Tests for any deep inequality. Opposite of `deepEqual`.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  notDeepEqual: function _notDeepEqual(actual, expected, message) {
    if (deepEql(actual, expected)) {
      baseFail(actual, expected, message, 'notDeepEqual');
    }
  },
  /**
   * Tests for deep inequality. Opposite of `deepStrictEqual`.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  notDeepStrictEqual: function _notDeepStrictEqual(actual, expected, message) {
    if (deepEql(actual, expected, true)) {
      baseFail(actual, expected, message, 'notDeepStrictEqual');
    }
  },
  /**
   * Tests shallow, coercive non-equality with the not equal comparison
   * operator ( != ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  notEqual: function _notEqual(actual, expected, message) {
    if (actual == expected) { // eslint-disable-line eqeqeq
      baseFail(actual, expected, message, '!=');
    }
  },
  /**
   * Tests strict non-equality, as determined by the strict not equal
   * operator ( !== ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  notStrictEqual: function _notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      baseFail(actual, expected, message, '!==');
    }
  },
  /**
   * Tests if value is truthy, it is equivalent to
   * `equal(!!value, true, message)`.
   *
   * @param {*} value The value to be tested.
   * @param {string} [message] Text description of test.
   */
  ok: function _ok(value, message) {
    baseAssert(value, message, 'ok');
  },
  /**
   * Tests strict equality, as determined by the strict equality
   * operator ( === ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  strictEqual: function _strictEqual(actual, expected, message) {
    if (actual !== expected) {
      baseFail(actual, expected, message, '===');
    }
  },
  /**
   * Expects block to throw an error. `error` can be constructor, regexp or
   * validation function.
   *
   * @param {Function} block The function block to be executed in testing.
   * @param {constructor|RegExp|Function} [error] The comparator.
   * @param {string} [message] Text description of test.
   */
  'throws': function _throws(block, error, message) {
    baseThrows(true, block, error, message);
  },
  truncate: {}
});
/**
 * Allows `truncate` options of AssertionError to be modified. The
 * `truncate` used is the one from `lodash`.
 *
 * @name truncate
 * @type {Object}
 * @property {number} length=128 The maximum string length.
 * @property {string} omission='' The string to indicate text is omitted.
 * @property {RegExp|string} separator='' The pattern to truncate to.
 * @see https://lodash.com/docs#trunc
 */
define.properties(assertIt.truncate, {
  length: 128,
  omission: '',
  separator: ''
});

module.exports = assertIt;
