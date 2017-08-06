/**
 * @file A Javascript assertion library.
 * @version 2.0.0
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
var defineProperties = require('object-define-properties-x');
var deepEql = require('deep-equal-x');
var truncOpts = [
  'length',
  'omission',
  'separator'
];
var $assert;

var isStringType = function _isStringType(value) {
  return typeof value === 'string';
};

/**
 * Extends `arg` with the `truncate` options.
 *
 * @private
 * @param {Object} arg - The object to extend.
 * @param {string} name - The `truncate` option name.
 * @returns {Object} The `arg` object.
 */
var $extendOpts = function extendOpts(arg, name) {
  arg[name] = $assert.truncate[name];
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
// eslint-disable-next-line max-params
var $baseFail = function baseFail(actual, expected, message, operator) {
  var arg = {
    actual: actual,
    expected: expected,
    message: message,
    operator: operator
  };

  if (isObjectLike($assert.truncate)) {
    reduce(truncOpts, $extendOpts, arg);
  }

  throw new AssertionError(arg);
};

/**
 * Returns whether an exception is expected. Used by throws.
 *
 * @private
 * @param {*} actual - The actual value to be tested.
 * @param {*} expected - The expected value to compare against actual.
 * @returns {boolean} True if exception expected, otherwise false.
 */
var $expectedException = function expectedException(actual, expected) {
  if (Boolean(actual) === false || Boolean(expected) === false) {
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
 * @param {boolean} shouldThrow - True if it should throw, otherwise false.
 * @param {Function} block - The function block to be executed in testing.
 * @param {*} expected - The expected value to compare against actual.
 * @param {string} [message] - Text description of test.
 */
// eslint-disable-next-line max-params
var $baseThrows = function baseThrows(shouldThrow, block, expected, message) {
  var msg = message;
  var clause1 = Boolean(msg) === false || isStringType(msg) === false;
  if (isFunction(block) === false) {
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

  var wasExceptionExpected = $expectedException(actual, xpd);
  clause1 = xpd && isStringType(xpd.name) && xpd.name;
  msg = (clause1 ? ' (' + xpd.name + ').' : '.') + (msg ? ' ' + msg : '.');
  if (shouldThrow && Boolean(actual) === false) {
    $baseFail(actual, xpd, 'Missing expected exception' + msg);
  } else if (Boolean(shouldThrow) === false && wasExceptionExpected) {
    $baseFail(actual, xpd, 'Got unwanted exception' + msg);
  } else {
    var clause2;
    if (shouldThrow) {
      clause1 = actual && xpd && Boolean(wasExceptionExpected) === false;
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
var $baseAssert = function baseAssert(value, message, operator) {
  if (Boolean(value) === false) {
    $baseFail(false, true, message, operator);
  }
};

/**
 * Tests if value is truthy, it is equivalent to `equal(!!value, true, message)`.
 *
 * @param {*} value - The value to be tested.
 * @param {string} message - Text description of test.
 */
$assert = function assert(value, message) {
  $baseAssert(value, message, 'ok');
};

defineProperties($assert, {
  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @class
   * @augments Error
   * @param {Object} [message] - Need to document the properties.
   */
  AssertionError: {
    value: AssertionError
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
      if (deepEql(actual, expected) === false) {
        $baseFail(actual, expected, message, 'deepEqual');
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
      if (deepEql(actual, expected, true) === false) {
        $baseFail(actual, expected, message, 'deepStrictEqual');
      }
    }
  },
  /**
   * Expects block not to throw an error, see assert~throws for details.
   *
   * @param {Function} block - The function block to be executed in testing.
   * @param {constructor} [error] - The comparator.
   * @param {string} [message] - Text description of test.
   */
  doesNotThrow: {
    value: function doesNotThrow(block, error, message) {
      $baseThrows(false, block, error, message);
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
    value: function _equal(actual, expected, message) {
      // eslint-disable-next-line eqeqeq
      if (actual != expected) {
        $baseFail(actual, expected, message, '==');
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
    value: $baseFail
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
      if (deepEql(actual, expected)) {
        $baseFail(actual, expected, message, 'notDeepEqual');
      }
    }
  },
  /**
   * Tests for deep inequality. Opposite of `deepStrictEqual`.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} [message] Text description of test.
   */
  notDeepStrictEqual: {
    value: function notDeepStrictEqual(actual, expected, message) {
      if (deepEql(actual, expected, true)) {
        $baseFail(actual, expected, message, 'notDeepStrictEqual');
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
      // eslint-disable-next-line eqeqeq
      if (actual == expected) {
        $baseFail(actual, expected, message, '!=');
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
        $baseFail(actual, expected, message, '!==');
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
      $baseAssert(value, message, 'ok');
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
        $baseFail(actual, expected, message, '===');
      }
    }
  },
  /**
   * Expects block to throw an error. `error` can be constructor, regexp or
   * validation function.
   *
   * @param {Function} block - The function block to be executed in testing.
   * @param {constructor|RegExp|Function} [error] - The comparator.
   * @param {string} [message] - Text description of test.
   */
  'throws': {
    value: function _throws(block, error, message) {
      $baseThrows(true, block, error, message);
    }
  },
  truncate: {
    value: {}
  }
});
/**
 * Allows `truncate` options of AssertionError to be modified. The
 * `truncate` used is the one from `lodash`.
 *
 * @name truncate
 * @type {Object}
 * @property {number} length=128 - The maximum string length.
 * @property {string} omission='' - The string to indicate text is omitted.
 * @property {RegExp|string} separator='' - The pattern to truncate to.
 * @see {@link https://github.com/Xotic750/truncate-x}
 */
defineProperties($assert.truncate, {
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

module.exports = $assert;
