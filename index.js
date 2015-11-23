/**
 * @file {@link http://xotic750.github.io/assert-x/ assert-x}
 * A Javascript assertion library.
 * @version 1.1.1
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
  maxstatements:21, maxcomplexity:10 */

/*global require, module */

(function () {
  'use strict';

  var errorx = require('error-x'),
    AssertionError = errorx.AssertionError,
    defProps = require('define-properties'),
    isRegExp = require('is-regex'),
    isCallable = require('is-callable'),
    deepEql = require('deep-equal-x');

  /**
   * Custom replacer for JSON~stringify.
   *
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
    if (isCallable(value) || isRegExp(value)) {
      return String(value);
    }
    return value;
  }

  /**
   * Get the message to be passed to AssertionError.
   *
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
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   * @param {string} operator The compare operator.
   * @throws {Error} Throws an `AssertionError`.
   */
  function fail(actual, expected, message, operator) {
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
      fail(actual, expected, 'Missing expected exception' + message);
    } else if (!shouldThrow && wasExceptionExpected) {
      fail(actual, expected, 'Got unwanted exception' + message);
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
      fail(false, true, message, operator);
    }
  }

  /**
   * Tests if value is truthy, it is equivalent to
   * `equal(!!value, true, message)`.
   *
   * @param {*} value The value to be tested.
   * @param {string} message Text description of test.
   */
  function assert(value, message) {
    baseAssert(value, message, 'ok');
  }

  /**
   * Tests if value is truthy, it is equivalent to
   * `equal(!!value, true, message)`.
   *
   * @param {*} value The value to be tested.
   * @param {string} message Text description of test.
   */
  function ok(value, message) {
    baseAssert(value, message, 'ok');
  }

  /**
   * Specification extension.
   * Tests if value is truthy, it is equivalent to
   * `equal(!value, true, message)`.
   *
   * @param {*} value The value to be tested.
   * @param {string} message Text description of test.
   */
  function notOk(value, message) {
    if (value) {
      fail(true, true, message, 'notOk');
    }
  }

  /**
   * Tests shallow, coercive equality with the equal comparison
   * operator ( == ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function equal(actual, expected, message) {
    /*jshint eqeqeq:false */
    if (actual != expected) {
      fail(actual, expected, message, '==');
    }
  }

  /**
   * Tests shallow, coercive non-equality with the not equal comparison
   * operator ( != ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function notEqual(actual, expected, message) {
    /*jshint eqeqeq:false */
    if (actual == expected) {
      fail(actual, expected, message, '!=');
    }
  }

  /**
   * Tests for deep equality, coercive equality with the equal comparison
   * operator ( == ) and equivalent.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function deepEqual(actual, expected, message) {
    if (!deepEql(actual, expected)) {
      fail(actual, expected, message, 'deepEqual');
    }
  }

  /**
   * Tests for deep inequality.
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function notDeepEqual(actual, expected, message) {
    if (deepEql(actual, expected)) {
      fail(actual, expected, message, 'notDeepEqual');
    }
  }

  /**
   * Tests strict equality, as determined by the strict equality
   * operator ( === ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function strictEqual(actual, expected, message) {
    if (actual !== expected) {
      fail(actual, expected, message, '===');
    }
  }

  /**
   * Tests strict non-equality, as determined by the strict not equal
   * operator ( !== ).
   *
   * @param {*} actual The actual value to be tested.
   * @param {*} expected The expected value to compare against actual.
   * @param {string} message Text description of test.
   */
  function notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      fail(actual, expected, message, '!==');
    }
  }

  /**
   * Expects block to throw an error. `error` can be constructor, regexp or
   * validation function.
   *
   * @param {Function} block The function block to be executed in testing.
   * @param {constructor|RegExp|Function} error The comparator.
   * @param {string} message Text description of test.
   */
  function throws(block, error, message) {
    baseThrows(true, block, error, message);
  }

  /**
   * Expects block not to throw an error, see assert~throws for details.
   *
   * @param {Function} block The function block to be executed in testing.
   * @param {string} message Text description of test.
   */
  function doesNotThrow(block, message) {
    baseThrows(false, block, message);
  }

  /**
   * Tests if value is not a falsy value, throws if it is a truthy value.
   * Useful when testing the first argument, error in callbacks.
   *
   * @param {*} err The value to be tested for truthiness.
   * @throws {*} The value `err` if truthy.
   */
  function ifError(err) {
    if (err) {
      throw err;
    }
  }

  defProps(assert, {
    AssertionError: AssertionError,
    fail: fail,
    ok: ok,
    notOk: notOk,
    equal: equal,
    strictEqual: strictEqual,
    notStrictEqual: notStrictEqual,
    notEqual: notEqual,
    deepEqual: deepEqual,
    notDeepEqual: notDeepEqual,
    throws: throws,
    doesNotThrow: doesNotThrow,
    ifError: ifError
  });

  module.exports = assert;
}());
