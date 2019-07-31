function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { AssertionErrorConstructor, isError } from 'error-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isFunction from 'is-function-x';
import defineProperties from 'object-define-properties-x';
import { isDeepEqual, isDeepStrictEqual } from 'is-deep-strict-equal-x';
import assign from 'object-assign-x';
import toBoolean from 'to-boolean-x';
/* eslint-disable-next-line no-void */

var UNDEFINED = void 0;
var rxTest = /none/.test; // eslint-disable jsdoc/check-param-names
// noinspection JSCommentMatchesSignature

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
// eslint-enable jsdoc/check-param-names

var baseFail = function baseFail(args) {
  var _args = _slicedToArray(args, 4),
      actual = _args[0],
      expected = _args[1],
      message = _args[2],
      operator = _args[3];

  throw new AssertionErrorConstructor({
    actual: actual,
    expected: expected,
    message: message,
    operator: operator
  });
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
  if (toBoolean(actual) === false || toBoolean(expected) === false) {
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

var assertBaseThrowsFnArg = function assertBaseThrowsFnArg(fn) {
  if (isFunction(fn) === false) {
    throw new TypeError("The \"fn\" argument must be of type Function. Received type ".concat(_typeof(fn)));
  }
};

var conditonal1 = function conditonal1(msg, xpd) {
  return (toBoolean(msg) === false || typeof msg !== 'string') && typeof xpd === 'string';
};

var getParts = function getParts(msg, xpd) {
  return {
    part1: xpd && typeof xpd.name === 'string' && xpd.name ? " (".concat(xpd.name, ").") : '.',
    part2: msg ? " ".concat(msg) : '.'
  };
};

var getBaseThrowsMsg = function getBaseThrowsMsg(message, expected) {
  var msg = message;
  var xpd = expected;

  if (conditonal1(msg, xpd)) {
    msg = xpd;
    xpd = UNDEFINED;
  }

  var _getParts = getParts(msg, xpd),
      part1 = _getParts.part1,
      part2 = _getParts.part2;

  return {
    msg: (part1 === '.' ? '' : part1) + part2,
    xpd: xpd
  };
};

var throwerBaseThrows = function throwerBaseThrows(args) {
  var _args2 = _slicedToArray(args, 4),
      shouldThrow = _args2[0],
      actual = _args2[1],
      xpd = _args2[2],
      wasExceptionExpected = _args2[3];

  var clause1;
  var clause2;

  if (shouldThrow) {
    clause1 = actual && xpd && toBoolean(wasExceptionExpected) === false;
  } else {
    clause1 = false;
    clause2 = actual;
  }

  if (clause1 || clause2) {
    throw actual;
  }
};

var getBaseThrowsActual = function getBaseThrowsActual(fn) {
  try {
    return fn();
  } catch (e) {
    return e;
  }
}; // eslint-disable jsdoc/check-param-names
// noinspection JSCommentMatchesSignature

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
// eslint-enable jsdoc/check-param-names


var baseThrows = function baseThrows(args) {
  var _args3 = _slicedToArray(args, 4),
      shouldThrow = _args3[0],
      fn = _args3[1],
      expected = _args3[2],
      message = _args3[3];

  assertBaseThrowsFnArg(fn);
  var actual = getBaseThrowsActual(fn);

  var _getBaseThrowsMsg = getBaseThrowsMsg(message, expected),
      msg = _getBaseThrowsMsg.msg,
      xpd = _getBaseThrowsMsg.xpd;

  var wasExceptionExpected = expectedException(actual, xpd);

  if (shouldThrow && toBoolean(actual) === false) {
    baseFail([actual, xpd, "Missing expected exception".concat(msg), '']);
  } else if (toBoolean(shouldThrow) === false && wasExceptionExpected) {
    baseFail([actual, xpd, "Got unwanted exception".concat(msg), '']);
  } else {
    throwerBaseThrows([shouldThrow, actual, xpd, wasExceptionExpected]);
  }
}; // eslint-disable jsdoc/check-param-names
// noinspection JSCommentMatchesSignature

/**
 * Common function for `assert` and `assert~ok`.
 *
 * @private
 * @param {*} value - The value to be tested.
 * @param {string} message - Text description of test.
 * @param {string} operator - Text description of test operator.
 */
// eslint-enable jsdoc/check-param-names


var baseAssert = function baseAssert(args) {
  var _args4 = _slicedToArray(args, 3),
      value = _args4[0],
      message = _args4[1],
      operator = _args4[2];

  if (toBoolean(value) === false) {
    baseFail([false, true, message, operator]);
  }
}; // eslint-disable jsdoc/check-param-names
// noinspection JSCommentMatchesSignature

/**
 * Tests if value is truthy, it is equivalent to `equal(!!value, true, message)`.
 *
 * @param {*} value - The value to be tested.
 * @param {string} [message] - Text description of test.
 */
// eslint-enable jsdoc/check-param-names


var assert = function assert(value) {
  /* eslint-disable-next-line prefer-rest-params */
  baseAssert([value, arguments[1], 'ok']);
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
    value: function deepEqual(actual, expected) {
      if (isDeepEqual(actual, expected) === false) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'deepEqual']);
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
    value: function deepStrictEqual(actual, expected) {
      if (isDeepStrictEqual(actual, expected) === false) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'deepStrictEqual']);
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
    value: function doesNotThrow(fn, error) {
      /* eslint-disable-next-line prefer-rest-params */
      baseThrows([false, fn, error, arguments[2]]);
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
    value: function equal(actual, expected) {
      /* eslint-disable-next-line eqeqeq */
      // noinspection EqualityComparisonWithCoercionJS
      if (actual != expected) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], '==']);
      }
    }
  },

  /**
   * Throws an exception that displays the values for actual and expected
   * separated by the provided operator.
   *
   * @param {string|Error} [message] - Text description of test.
   * @throws {Error} Throws an `AssertionError`.
   */
  fail: {
    value: function fail(actual) {
      if (arguments.length < 2) {
        if (isError(actual)) {
          throw actual;
        }

        baseFail([UNDEFINED, UNDEFINED, arguments.length ? actual : 'Failed', 'fail']);
      } else {
        /* eslint-disable-next-line prefer-rest-params */
        var message = arguments[2];

        if (isError(message)) {
          throw message;
        }
        /* eslint-disable-next-line prefer-rest-params */


        var operator = arguments.length > 3 ? arguments[3] : '!=';
        /* eslint-disable-next-line prefer-rest-params */

        baseFail([actual, arguments[1], message, operator]);
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
    value: function notDeepEqual(actual, expected) {
      if (isDeepEqual(actual, expected)) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'notDeepEqual']);
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
    value: function notDeepStrictEqual(actual, expected) {
      if (isDeepStrictEqual(actual, expected)) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'notDeepStrictEqual']);
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
    value: function notEqual(actual, expected) {
      /* eslint-disable-next-line eqeqeq */
      // noinspection EqualityComparisonWithCoercionJS
      if (actual == expected) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], '!=']);
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
    value: function notStrictEqual(actual, expected) {
      if (actual === expected) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'notStrictEqual']);
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
    value: function ok(value) {
      /* eslint-disable-next-line prefer-rest-params */
      baseAssert([value, arguments[1], 'ok']);
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
    value: function strictEqual(actual, expected) {
      if (actual !== expected) {
        /* eslint-disable-next-line prefer-rest-params */
        baseFail([actual, expected, arguments[2], 'strictEqual']);
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
    value: function throws(fn, error) {
      /* eslint-disable-next-line prefer-rest-params */
      baseThrows([true, fn, error, arguments[2]]);
    }
  }
};
defineProperties(assert, assertMethods);
export default assert; // Expose a strict only variant of assert

export function strict(value) {
  /* eslint-disable-next-line prefer-rest-params */
  baseAssert([value, arguments[1], 'ok']);
}
var strictMethods = assign({}, assertMethods, {
  equal: assertMethods.strictEqual,
  deepEqual: assertMethods.deepStrictEqual,
  notEqual: assertMethods.notStrictEqual,
  notDeepEqual: assertMethods.notDeepStrictEqual
});
defineProperties(strict, strictMethods);

//# sourceMappingURL=assert-x.esm.js.map