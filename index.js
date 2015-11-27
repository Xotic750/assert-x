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
 * @version 1.1.2
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @see https://nodejs.org/api/assert.html
 * @module assert-x
 */

/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:4, maxdepth:2,
  maxstatements:24, maxcomplexity:10 */

/*global require, module */

(function () {
  'use strict';

  var errorx = require('error-x'),
    AssertionError = errorx.AssertionError,
    defProps = require('define-properties'),
    isRegExp = require('is-regex'),
    isCallable = require('is-callable'),
    deepEql = require('deep-equal-x');
  require('cycle-x');

  /**
   * Custom replacer for JSON~stringify.
   *
   * @private
   * @param {*} ignore Unused argument `key`.
   * @param {*} value The value beging stringified.
   * @return {*} The value to be processed by JSON~stringify.
   */
  function replacer(ignore, value) {
    if (typeof value === 'undefined') {
      return String(value);
    }
    if (typeof value === 'number' && !isFinite(value)) {
      return String(value);
    }
    if (isRegExp(value) || isCallable(value)) {
      return String(value);
    }
    return value;
  }

  /**
   * Get the message to be passed to AssertionError.
   *
   * @private
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   * @param {string} operator The compare operator.
   * @return {string} The text message.
   */
  function getMessage(actual, expected, message, operator) {
    var decycle;
    if (typeof message === 'undefined') {
      decycle = isCallable(JSON.decycle);
      return JSON.stringify(decycle ? JSON.decycle(actual) : actual, replacer) +
        ' ' + operator + ' ' +
        JSON.stringify(decycle ? JSON.decycle(expected) : expected, replacer);
    }
    return String(message);
  }

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
  function baseFail(actual, expected, message, operator) {
    throw new AssertionError({
      actual: actual,
      expected: expected,
      message: getMessage(actual, expected, message, operator),
      operator: operator
    });
  }

  /**
   * Returns whether an exception is expected. Used by throws.
   *
   * @private
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @return {boolean} True if exception expected, otherwise false.
   */
  function expectedException(actual, expected) {
    if (!actual || !expected) {
      return false;
    }
    if (isRegExp(expected)) {
      return expected.test(String(actual));
    }
    if (actual instanceof expected) {
      return true;
    }
    if (isCallable(expected) && expected.call({}, actual) === true) {
      return true;
    }
    return false;
  }

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
  function baseThrows(shouldThrow, block, expected, message) {
    var wasExceptionExpected, actual,
      clause1 = !message || typeof message !== 'string';
    if (clause1 && typeof expected === 'string') {
      message = expected;
      expected = null;
    }
    try {
      block();
    } catch (e) {
      actual = e;
    }
    wasExceptionExpected = expectedException(actual, expected);
    clause1 = expected && typeof expected.name === 'string' && !expected.name;
    message = message ? ' ' + message : '.';
    message = (clause1 ? ' (' + expected.name + ').' : '.') + message;
    if (shouldThrow && !actual) {
      baseFail(actual, expected, 'Missing expected exception' + message);
    } else if (!shouldThrow && wasExceptionExpected) {
      baseFail(actual, expected, 'Got unwanted exception' + message);
    } else {
      clause1 = shouldThrow && actual && expected && !wasExceptionExpected;
      if (clause1 || !shouldThrow && actual) {
        throw actual;
      }
    }
  }

  /**
   * Common function for `assert` and `assert~ok`.
   *
   * @private
   * @param {*} value The value to be tested.
   * @param {string} message Text description of test.
   * @param {string} operator Text description of test operator.
   */
  function baseAssert(value, message, operator) {
    if (!value) {
      baseFail(false, true, message, operator);
    }
  }

  /**
   * Tests if value is truthy, it is equivalent to
   * `equal(!!value, true, message)`.
   *
   * @param {*} value The value to be tested.
   * @param {string} message Text description of test.
   */
  module.exports = function assert(value, message) {
    baseAssert(value, message, 'ok');
  };
  defProps(module.exports, {
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
     * Throws an exception that displays the values for actual and expected
     * separated by the provided operator.
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     * @param {string} operator The compare operator.
     * @throws {Error} Throws an `AssertionError`.
     */
    fail: baseFail,
    /**
     * Tests if value is truthy, it is equivalent to
     * `equal(!!value, true, message)`.
     *
     * @param {*} value The value to be tested.
     * @param {string} message Text description of test.
     */
    ok: function (value, message) {
      baseAssert(value, message, 'ok');
    },
    /**
     * Specification extension.
     * Tests if value is truthy, it is equivalent to
     * `equal(!value, true, message)`.
     *
     * @param {*} value The value to be tested.
     * @param {string} message Text description of test.
     */
    notOk: function (value, message) {
      if (value) {
        baseFail(true, true, message, 'notOk');
      }
    },
    /**
     * Tests shallow, coercive equality with the equal comparison
     * operator ( == ).
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    equal: function (actual, expected, message) {
      /*jshint eqeqeq:false */
      if (actual != expected) {
        baseFail(actual, expected, message, '==');
      }
    },
    /**
     * Tests shallow, coercive non-equality with the not equal comparison
     * operator ( != ).
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    notEqual: function (actual, expected, message) {
      /*jshint eqeqeq:false */
      if (actual == expected) {
        baseFail(actual, expected, message, '!=');
      }
    },
    /**
     * Tests for deep equality, coercive equality with the equal comparison
     * operator ( == ) and equivalent.
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    deepEqual: function (actual, expected, message) {
      if (!deepEql(actual, expected)) {
        baseFail(actual, expected, message, 'deepEqual');
      }
    },
    /**
     * Tests for any deep inequality. Opposite of `deepEqual`.
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    notDeepEqual: function (actual, expected, message) {
      if (deepEql(actual, expected)) {
        baseFail(actual, expected, message, 'notDeepEqual');
      }
    },
    /**
     * Tests for deep equality, coercive equality with the equal comparison
     * operator ( === ) and equivalent.
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    deepStrictEqual: function (actual, expected, message) {
      if (!deepEql(actual, expected, true)) {
        baseFail(actual, expected, message, 'deepStrictEqual');
      }
    },
    /**
     * Tests for deep inequality. Opposite of `deepStrictEqual`.
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    notDeepStrictEqual: function (actual, expected, message) {
      if (deepEql(actual, expected, true)) {
        baseFail(actual, expected, message, 'notDeepStrictEqual');
      }
    },
    /**
     * Tests strict equality, as determined by the strict equality
     * operator ( === ).
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    strictEqual: function (actual, expected, message) {
      if (actual !== expected) {
        baseFail(actual, expected, message, '===');
      }
    },
    /**
     * Tests strict non-equality, as determined by the strict not equal
     * operator ( !== ).
     *
     * @param {*} actual The actual value to be tested.
     * @param {*} expected The expected value to compare against actual.
     * @param {string} message Text description of test.
     */
    notStrictEqual: function (actual, expected, message) {
      if (actual === expected) {
        baseFail(actual, expected, message, '!==');
      }
    },
    /**
     * Expects block to throw an error. `error` can be constructor, regexp or
     * validation function.
     *
     * @param {Function} block The function block to be executed in testing.
     * @param {constructor|RegExp|Function} error The comparator.
     * @param {string} message Text description of test.
     */
    throws: function (block, error, message) {
      baseThrows(true, block, error, message);
    },
    /**
     * Expects block not to throw an error, see assert~throws for details.
     *
     * @param {Function} block The function block to be executed in testing.
     * @param {string} message Text description of test.
     */
    doesNotThrow: function (block, message) {
      baseThrows(false, block, message);
    },
    /**
     * Tests if value is not a falsy value, throws if it is a truthy value.
     * Useful when testing the first argument, error in callbacks.
     *
     * @param {*} err The value to be tested for truthiness.
     * @throws {*} The value `err` if truthy.
     */
    ifError: function (err) {
      if (err) {
        throw err;
      }
    }
  });
}());
