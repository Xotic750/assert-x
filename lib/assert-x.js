(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
 * A Javascript assertion library. Works in ES3 environments if es5-shim is
 * loaded, which is recommended for all environments to fix native bugs.
 * @version 1.1.4
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
    pTest = RegExp.prototype.test,
    defProps = require('define-properties'),
    ES = require('es-abstract/es6'),
    deepEql = require('deep-equal-x'),
    CircularJSON = require('circular-json'),
    isPrimitive = require('is-primitive');

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
      return ES.ToString(value);
    }
    if (typeof value === 'number' && !isFinite(value)) {
      return ES.ToString(value);
    }
    if (isPrimitive(value)) {
      return value;
    }
    if (ES.IsRegExp(value) || ES.IsCallable(value)) {
      return ES.ToString(value);
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
    if (typeof message === 'undefined') {
      return CircularJSON.stringify(actual, replacer) +
        ' ' + operator + ' ' +
        CircularJSON.stringify(expected, replacer);
    }
    return ES.ToString(message);
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
    if (ES.IsRegExp(expected)) {
      return ES.Call(pTest, expected, [ES.ToString(actual)]);
    }
    if (actual instanceof expected) {
      return true;
    }
    if (ES.IsCallable(expected)) {
      return ES.Call(expected, {}, [actual]) === true;
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
    ok: function ok(value, message) {
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
    notOk: function notOk(value, message) {
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
    equal: function equal(actual, expected, message) {
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
    notEqual: function notEqual(actual, expected, message) {
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
    deepEqual: function deepEqual(actual, expected, message) {
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
    notDeepEqual: function notDeepEqual(actual, expected, message) {
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
    deepStrictEqual: function deepStrictEqual(actual, expected, message) {
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
    notDeepStrictEqual: function notDeepStrictEqual(actual, expected, message) {
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
    strictEqual: function strictEqual(actual, expected, message) {
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
    notStrictEqual: function notStrictEqual(actual, expected, message) {
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
    throws: function throws(block, error, message) {
      baseThrows(true, block, error, message);
    },
    /**
     * Expects block not to throw an error, see assert~throws for details.
     *
     * @param {Function} block The function block to be executed in testing.
     * @param {string} message Text description of test.
     */
    doesNotThrow: function doesNotThrow(block, message) {
      baseThrows(false, block, message);
    },
    /**
     * Tests if value is not a falsy value, throws if it is a truthy value.
     * Useful when testing the first argument, error in callbacks.
     *
     * @param {*} err The value to be tested for truthiness.
     * @throws {*} The value `err` if truthy.
     */
    ifError: function ifError(err) {
      if (err) {
        throw err;
      }
    }
  });
}());

},{"circular-json":2,"deep-equal-x":3,"define-properties":27,"error-x":31,"es-abstract/es6":48,"is-primitive":64}],2:[function(require,module,exports){
/*!
Copyright (C) 2013 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var
  // should be a not so common char
  // possibly one JSON does not encode
  // possibly one encodeURIComponent does not encode
  // right now this char is '~' but this might change in the future
  specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0).toString(16)
  ).slice(-2),
  escapedSafeSpecialChar = '\\' + safeSpecialChar,
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

  safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

  indexOf = [].indexOf || function(v){
    for(var i=this.length;i--&&this[i]!==v;);
    return i;
  },
  $String = String  // there's no way to drop warnings in JSHint
                    // about new String ... well, I need that here!
                    // faked, and happy linter!
;

function generateReplacer(value, replacer, resolve) {
  var
    path = [],
    all  = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl  = 1,
    i
  ;
  return function(key, value) {
    // the replacer has rights to decide
    // if a new object should be returned
    // or if there's some key to drop
    // let's call it here rather than "too late"
    if (replacer) value = replacer.call(this, key, value);

    // did you know ? Safari passes keys as integers for arrays
    // which means if (key) when key === 0 won't pass the check
    if (key !== '') {
      if (last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if (typeof value === 'object' && value) {
    	// if object isn't referring to parent object, add to the
        // object path stack. Otherwise it is already there.
        if (indexOf.call(all, value) < 0) {
          all.push(last = value);
        }
        lvl = all.length;
        i = indexOf.call(seen, value);
        if (i < 0) {
          i = seen.push(value) - 1;
          if (resolve) {
            // key cannot contain specialChar but could be not a string
            path.push(('' + key).replace(specialCharRG, safeSpecialChar));
            mapp[i] = specialChar + path.join(specialChar);
          } else {
            mapp[i] = mapp[0];
          }
        } else {
          value = mapp[i];
        }
      } else {
        if (typeof value === 'string' && resolve) {
          // ensure no special char involved on deserialization
          // in this case only first char is important
          // no need to replace all value (better performance)
          value = value .replace(safeSpecialChar, escapedSafeSpecialChar)
                        .replace(specialChar, safeSpecialChar);
        }
      }
    }
    return value;
  };
}

function retrieveFromPath(current, keys) {
  for(var i = 0, length = keys.length; i < length; current = current[
    // keys should be normalized back here
    keys[i++].replace(safeSpecialCharRG, specialChar)
  ]);
  return current;
}

function generateReviver(reviver) {
  return function(key, value) {
    var isString = typeof value === 'string';
    if (isString && value.charAt(0) === specialChar) {
      return new $String(value.slice(1));
    }
    if (key === '') value = regenerate(value, value, {});
    // again, only one needed, do not use the RegExp for this replacement
    // only keys need the RegExp
    if (isString) value = value .replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                                .replace(escapedSafeSpecialChar, safeSpecialChar);
    return reviver ? reviver.call(this, key, value) : value;
  };
}

function regenerateArray(root, current, retrieve) {
  for (var i = 0, length = current.length; i < length; i++) {
    current[i] = regenerate(root, current[i], retrieve);
  }
  return current;
}

function regenerateObject(root, current, retrieve) {
  for (var key in current) {
    if (current.hasOwnProperty(key)) {
      current[key] = regenerate(root, current[key], retrieve);
    }
  }
  return current;
}

function regenerate(root, current, retrieve) {
  return current instanceof Array ?
    // fast Array reconstruction
    regenerateArray(root, current, retrieve) :
    (
      current instanceof $String ?
        (
          // root is an empty string
          current.length ?
            (
              retrieve.hasOwnProperty(current) ?
                retrieve[current] :
                retrieve[current] = retrieveFromPath(
                  root, current.split(specialChar)
                )
            ) :
            root
        ) :
        (
          current instanceof Object ?
            // dedicated Object parser
            regenerateObject(root, current, retrieve) :
            // value as it is
            current
        )
    )
  ;
}

function stringifyRecursion(value, replacer, space, doNotResolve) {
  return JSON.stringify(value, generateReplacer(value, replacer, !doNotResolve), space);
}

function parseRecursion(text, reviver) {
  return JSON.parse(text, generateReviver(reviver));
}
this.stringify = stringifyRecursion;
this.parse = parseRecursion;
},{}],3:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/deep-equal-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/deep-equal-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/deep-equal-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/deep-equal-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/deep-equal-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/deep-equal-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/deep-equal-x" title="npm version">
 * <img src="https://badge.fury.io/js/deep-equal-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * node's deepEqual algorithm. This only considers enumerable properties.
 * It does not test object prototypes, attached symbols,
 * or non-enumerable properties. Will work in ES3 environments if you load
 * es5-shim, which is recommended for all environments to fix native issues.
 * @version 1.0.10
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module deep-equal-x
 */

/*jslint maxlen:80, es6:false, this:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:4, maxdepth:3,
  maxstatements:50, maxcomplexity:27 */

/*global require, module */

;(function () {
  'use strict';

  var ES = require('es-abstract'),
    isDate = require('is-date-object'),
    isArguments = require('is-arguments'),
    isPrimitive = require('is-primitive'),
    isObject = require('is-object'),
    isBuffer = require('is-buffer'),
    isString = require('is-string'),
    indexOf = require('index-of-x'),
    StackSet = require('collections-x').Set,
    pSlice = Array.prototype.slice,
    pSome = Array.prototype.some,
    pFilter = Array.prototype.filter,
    pSort = Array.prototype.sort,
    pTest = RegExp.prototype.test,
    pCharAt = String.prototype.charAt,
    pGetTime = Date.prototype.getTime,
    $keys = Object.keys,
    $Number = Number,
    // Check failure of by-index access of string characters (IE < 9)
    // and failure of `0 in boxedString` (Rhino)
    boxedString = Object('a'),
    hasBoxedStringBug = boxedString[0] !== 'a' || !(0 in boxedString),
    // Used to detect unsigned integer values.
    reIsUint = /^(?:0|[1-9]\d*)$/,
    ERROR = Error,
    MAP = typeof Map !== 'undefined' && Map,
    SET = typeof Set !== 'undefined' && Set,
    hasMapEnumerables = MAP ? $keys(new MAP()) : MAP,
    hasSetEnumerables = SET ? $keys(new SET()) : SET,
    hasErrorEnumerables, baseDeepEqual;

  try {
    throw new ERROR('a');
  } catch (e) {
    hasErrorEnumerables = $keys(e);
  }

  /**
   * Checks if `value` is a valid string index. Specifically for boxed string
   * bug fix and not general purpose.
   *
   * @private
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is valid index, else `false`.
   */
  function isIndex(value) {
    var num = -1;
    if (ES.Call(pTest, reIsUint, [value])) {
      num = $Number(value);
    }
    return num > -1 && num % 1 === 0 && num < 4294967295;
  }

  /**
   * Get an object's key avoiding boxed string bug. Specifically for boxed
   * string bug fix and not general purpose.
   *
   * @private
   * @param {Object} object The object to get the `value` from.
   * @param {string} key The `key` reference to the `value`.
   * @param {boolean} isStr Is the object a string.
   * @param {boolean} isIdx Is the `key` a character index.
   * @return {*} Returns the `value` referenced by the `key`.
   */
  function getItem(object, key, isStr, isIdx) {
    if (isStr && isIdx) {
      return ES.Call(pCharAt, object, [key]);
    }
    return object[key];
  }

  /**
   * Filter `keys` of unwanted Error enumerables. Specifically for Error has
   * unwanted enumerables fix and not general purpose.
   *
   * @private
   * @param {Array} keys The Error object's keys.
   * @returns {Array} Returns the filtered keys.
   */
  function filterError(keys) {
    return ES.Call(pFilter, keys, [function (key) {
      return indexOf(hasErrorEnumerables, key) < 0;
    }]);
  }

  /**
   * Filter `keys` of unwanted Map enumerables.
   *
   * @private
   * @param {Array} keys The Map object's keys.
   * @returns {Array} Returns the filtered keys.
   */
  function filterMap(keys) {
    return ES.Call(pFilter, keys, [function (key) {
      return indexOf(hasMapEnumerables, key) < 0;
    }]);
  }

  /**
   * Filter `keys` of unwanted Set enumerables.
   *
   * @private
   * @param {Array} keys The Set object's keys.
   * @returns {Array} Returns the filtered keys.
   */
  function filterSet(keys) {
    return ES.Call(pFilter, keys, [function (key) {
      return indexOf(hasSetEnumerables, key) < 0;
    }]);
  }

  /**
   * Tests for deep equality. Primitive values are compared with the equal
   * comparison operator ( == ). This only considers enumerable properties.
   * It does not test object prototypes, attached symbols, or non-enumerable
   * properties. This can lead to some potentially surprising results. If
   * `strict` is `true` then Primitive values are compared with the strict
   * equal comparison operator ( === ).
   *
   * @private
   * @param {*} actual First comparison object.
   * @param {*} expected Second comparison object.
   * @param {boolean} [strict] Comparison mode. If set to `true` use `===`.
   * @param {Object} previousStack The circular stack.
   * @return {boolean} `true` if `actual` and `expected` are deemed equal,
   *  otherwise `false`.
   */
  baseDeepEqual = function de(actual, expected, strict, previousStack) {
    var stack, ka, kb, aIsString, bIsString;
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
      return true;
    }
    if (isBuffer(actual) && isBuffer(expected)) {
      if (actual.length !== expected.length) {
        return false;
      }
      return !ES.Call(pSome, actual, [function (item, index) {
        return item !== expected[index];
      }]);
    }

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    if (isDate(actual) && isDate(expected)) {
      return ES.Call(pGetTime, actual) === ES.Call(pGetTime, expected);
    }

    // 7.3 If the expected value is a RegExp object, the actual value is
    // equivalent if it is also a RegExp object with the same `source` and
    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase` & `sticky`).
    if (ES.IsRegExp(actual) && ES.IsRegExp(expected)) {
      return actual.source === expected.source &&
             actual.global === expected.global &&
             actual.multiline === expected.multiline &&
             actual.lastIndex === expected.lastIndex &&
             actual.ignoreCase === expected.ignoreCase &&
             actual.sticky === expected.sticky;
    }

    // 7.4. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by == or strict ===.
    if (!isObject(actual) && !isObject(expected)) {
      /*jshint eqeqeq:false */
      return strict === true ? actual === expected : actual == expected;
    }

    // 7.5 For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    /*jshint eqnull:true */
    if (actual == null || expected == null) {
      return false;
    }
    // an identical 'prototype' property.
    if (actual.prototype !== expected.prototype) {
      return false;
    }
    // if one is actual primitive, the other must be same
    if (isPrimitive(actual) || isPrimitive(expected)) {
      return actual === expected;
    }
    ka = isArguments(actual);
    kb = isArguments(expected);
    if (ka && !kb || !ka && kb) {
      return false;
    }
    if (ka) {
      return baseDeepEqual(
        ES.Call(pSlice, actual),
        ES.Call(pSlice, expected),
        strict,
        stack
      );
    }
    ka = $keys(actual);
    kb = $keys(expected);{
    if (isObject(actual)) {
      if (hasErrorEnumerables.length && actual instanceof ERROR) {
        ka = filterError(ka);
      }
      if (hasMapEnumerables &&
          hasMapEnumerables.length && actual instanceof MAP) {
        ka = filterMap(ka);
      }
      if (hasSetEnumerables &&
          hasSetEnumerables.length && actual instanceof SET) {
        ka = filterSet(ka);
      }
    }

    if (isObject(expected)) {
      if (hasErrorEnumerables.length && expected instanceof ERROR) {
        kb = filterError(kb);
      }
      if (hasMapEnumerables && expected instanceof MAP) {
        kb = filterMap(kb);
      }
      if (hasSetEnumerables && expected instanceof SET) {
        kb = filterSet(kb);
      }
    }
    }
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length !== kb.length) {
      return false;
    }
    //the same set of keys (although not necessarily the same order),
    ES.Call(pSort, ka);
    ES.Call(pSort, kb);
    if (hasBoxedStringBug) {
      aIsString = isString(actual);
      bIsString = isString(expected);
    }
    //~~~cheap key test
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    return !ES.Call(pSome, ka, [function (key, index) {
      var isIdx, isPrim, result, item;
      if (key !== kb[index]) {
        return true;
      }
      if (aIsString || bIsString) {
        isIdx = isIndex(key);
      }
      stack = previousStack ? previousStack : new StackSet([actual]);
      item = getItem(actual, key, aIsString, isIdx);
      isPrim = isPrimitive(item);
      if (!isPrim) {
        if (stack.has(item)) {
          throw new RangeError('Circular reference');
        }
        stack.add(item);
      }
      result = !baseDeepEqual(
        item,
        getItem(expected, key, bIsString, isIdx),
        strict,
        stack
      );
      if (!isPrim) {
        stack.delete(item);
      }
      return result;
    }]);
  };

  /**
   * Tests for deep equality. Primitive values are compared with the equal
   * comparison operator ( == ). This only considers enumerable properties.
   * It does not test object prototypes, attached symbols, or non-enumerable
   * properties. This can lead to some potentially surprising results. If
   * `strict` is `true` then Primitive values are compared with the strict
   * equal comparison operator ( === ).
   *
   * @param {*} actual First comparison object.
   * @param {*} expected Second comparison object.
   * @param {boolean} [strict] Comparison mode. If set to `true` use `===`.
   * @return {boolean} `true` if `actual` and `expected` are deemed equal,
   *  otherwise `false`.
   * @see https://nodejs.org/api/assert.html
   * @example
   * var deepEqual = require('deep-equal-x');
   *
   * deepEqual(Error('a'), Error('b'));
   * // => true
   * // This does not return `false` because the properties on the  Error object
   * // are non-enumerable:
   *
   * deepEqual(4, '4');
   * // => true
   *
   * deepEqual({ a: 4, b: '1' }, {  b: '1', a: 4 });
   * // => true
   *
   * deepEqual(new Date(), new Date(2000, 3, 14));
   * // => false
   *
   * deepEqual(4, '4', true);
   * // => false
   */
  module.exports = function deepEqual(actual, expected, strict) {
    return baseDeepEqual(actual, expected, strict);
  };
}());

},{"collections-x":4,"es-abstract":55,"index-of-x":17,"is-arguments":22,"is-buffer":23,"is-date-object":24,"is-object":25,"is-primitive":64,"is-string":26}],4:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/collections-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/collections-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/collections-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/collections-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/collections-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/collections-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/collections-x" title="npm version">
 * <img src="https://badge.fury.io/js/collections-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 collections fallback library: Map and Set.
 * This library will work on ES3 environments provide that you have loaded
 * es5-shim. For even better performance you should also load es6-shim which
 * patches faulty ES6 implimentations but its shims do not work in the
 * older ES3 environments, and that's where this fallback library comes into
 * play.
 * @version 1.0.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module collections-x
 */

/*jslint maxlen:80, es6:true, this:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:4, maxdepth:5,
  maxstatements:56, maxcomplexity:30 */

/*global require, module */

;(function () {
  'use strict';

  var hasOwn = Object.prototype.hasOwnProperty,
    pCharAt = String.prototype.charAt,
    pPush = Array.prototype.push,
    pSome = Array.prototype.some,
    pSplice = Array.prototype.splice,
    ES = require('es-abstract'),
    noop = require('noop-x'),
    defProps = require('define-properties'),
    defProp = require('define-property-x'),
    isString = require('is-string'),
    isArrayLike = require('is-array-like-x'),
    isPrimitive = require('is-primitive'),
    isSurrogatePair = require('is-surrogate-pair-x'),
    indexOf = require('index-of-x'),
    assertIsCallable = require('assert-is-callable-x'),
    assertIsObject = require('assert-is-object-x'),
    IdGenerator = require('big-counter-x'),
    hasRealSymbolIterator = typeof Symbol === 'function' &&
      typeof Symbol.iterator === 'symbol',
    hasFakeSymbolIterator = typeof Symbol === 'object' &&
      typeof Symbol.iterator === 'string',
    NativeMap = typeof Map !== 'undefined' && Map,
    NativeSet = typeof Set !== 'undefined' && Set,
    SetObject, MapObject, baseHas, setValuesIterator,
    mapEntries, symIt, useCompatability;

  if (hasRealSymbolIterator || hasFakeSymbolIterator) {
    symIt = Symbol.iterator;
  } else if (typeof Array.prototype['_es6-shim iterator_'] === 'function') {
    symIt = '_es6-shim iterator_';
  } else {
    symIt = '@@iterator';
  }

  /**
   * The iterator identifier that is in use.
   *
   * type {Symbol|string}
   */
  module.exports.symIt = symIt;

  useCompatability = (function () {
    function valueOrFalseIfThrows(func) {
      try {
        return func();
      } catch (e) {
        return false;
      }
    }

    function supportsSubclassing(C, f) {
      /* skip test on IE < 11 */
      if (!Object.setPrototypeOf) {
        return false;
      }
      // Simple shim for Object.create on ES3 browsers
      // (unlike real shim, no attempt to support `prototype === null`)
      var create = Object.create || function (prototype, properties) {
        var Prototype = function Prototype() {};
        Prototype.prototype = prototype;
        var object = new Prototype();
        if (typeof properties !== 'undefined') {
          Object.keys(properties).forEach(function (key) {
            defProp(object, key, properties[key], true);
          });
        }
        return object;
      };
      return valueOrFalseIfThrows(function () {
        var Sub = function Subclass(arg) {
          var o = new C(arg);
          Object.setPrototypeOf(o, Subclass.prototype);
          return o;
        };
        Object.setPrototypeOf(Sub, C);
        Sub.prototype = create(C.prototype, {
          constructor: { value: Sub }
        });
        return f(Sub);
      });
    }

    if (NativeMap || NativeSet) {
      // Safari 8, for example, doesn't accept an iterable.
      if (!valueOrFalseIfThrows(function () {
        return new NativeMap([[1, 2]]).get(1) === 2;
      })) {
        return true;
      }
      if (!(function () {
        // Chrome 38-42, node 0.11/0.12, iojs 1/2 also have a bug when
        // the Map has a size > 4
        var m = new NativeMap([[1, 0], [2, 0], [3, 0], [4, 0]]);
        m.set(-0, m);
        return m.get(0) === m && m.get(-0) === m && m.has(0) && m.has(-0);
      }())) {
        return true;
      }
      var testMap = new NativeMap();
      if (testMap.set(1, 2) !== testMap) {
        return true;
      }
      var testSet = new NativeSet();
      if ((function (s) {
        s['delete'](0);
        s.add(-0);
        return !s.has(0);
      }(testSet))) {
        return true;
      }
      if (testSet.add(1) !== testSet) {
        return true;
      }
      var mapSupportsSubclassing = supportsSubclassing(NativeMap, function (M) {
        var m = new M([]);
        // Firefox 32 is ok with the instantiating the subclass but will
        // throw when the map is used.
        m.set(42, 42);
        return m instanceof M;
      });
      // without Object.setPrototypeOf, subclassing is not possible
      var mapFailsToSupportSubclassing = Object.setPrototypeOf &&
        !mapSupportsSubclassing;
      var mapRequiresNew = (function () {
        try {
          /*jshint newcap:false */
          return !(NativeMap() instanceof NativeMap);
        } catch (e) {
          return e instanceof TypeError;
        }
      }());
      if (NativeMap.length !== 0 || mapFailsToSupportSubclassing || !mapRequiresNew) {
        return true;
      }
      var setSupportsSubclassing = supportsSubclassing(NativeSet, function (S) {
        var s = new S([]);
        s.add(42, 42);
        return s instanceof S;
      });
      // without Object.setPrototypeOf, subclassing is not possible
      var setFailsToSupportSubclassing = Object.setPrototypeOf &&
        !setSupportsSubclassing;
      var setRequiresNew = (function () {
        try {
          /*jshint newcap:false */
          return !(NativeSet() instanceof NativeSet);
        } catch (e) {
          return e instanceof TypeError;
        }
      }());
      if (NativeSet.length !== 0 || setFailsToSupportSubclassing || !setRequiresNew) {
        return true;
      }
      var not = function notThunker(func) {
        return function notThunk() {
          return !func.apply(this, arguments);
        };
      };
      var throwsError = function (func) {
        try {
          func();
          return false;
        } catch (e) {
          return true;
        }
      };
      var isCallableWithoutNew = not(throwsError);
      var mapIterationThrowsStopIterator = !valueOrFalseIfThrows(function () {
        return (new Map()).keys().next().done;
      });
      /*
        - In Firefox < 23, Map#size is a function.
        - In all current Firefox,
            Set#entries/keys/values & Map#clear do not exist
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
        - In Firefox 24, Map and Set do not implement forEach
        - In Firefox 25 at least, Map and Set are callable without "new"
      */
      if (
        typeof NativeMap.prototype.clear !== 'function' ||
        new NativeSet().size !== 0 ||
        new NativeMap().size !== 0 ||
        typeof NativeMap.prototype.keys !== 'function' ||
        typeof NativeSet.prototype.keys !== 'function' ||
        typeof NativeMap.prototype.forEach !== 'function' ||
        typeof NativeSet.prototype.forEach !== 'function' ||
        isCallableWithoutNew(NativeMap) ||
        isCallableWithoutNew(NativeSet) ||
        typeof new NativeMap().keys().next !== 'function' || // Safari 8
        mapIterationThrowsStopIterator || // Firefox 25
        !mapSupportsSubclassing
      ) {
        return true;
      }

      if (NativeSet.prototype.keys !== NativeSet.prototype.values) {
        // Fixed in WebKit with https://bugs.webkit.org/show_bug.cgi?id=144190
        return true;
      }

      // Incomplete iterator implementations.
      if (typeof (new NativeMap()).keys()[symIt] === 'undefined') {
        return true;
      }
      if (typeof (new NativeSet()).keys()[symIt] === 'undefined') {
        return true;
      }

      if ((function foo() {}).name === 'foo' &&
          NativeSet.prototype.has.name !== 'has') {
        // Microsoft Edge v0.11.10074.0 is missing a name on Set#has
        return true;
      }
    } else {
      return true;
    }
  }());

  /**
   * Detect an interator function.
   *
   * @private
   * @param {*} iterable Value to detect iterator function.
   * @return {Symbol|string|undefined} The iterator property identifier.
   */
  function getSymbolIterator(iterable) {
    /*jshint eqnull:true */
    if (iterable != null) {
      if ((hasRealSymbolIterator || hasFakeSymbolIterator) && iterable[symIt]) {
        return symIt;
      }
      if (iterable['_es6-shim iterator_']) {
        return '_es6-shim iterator_';
      }
      if (iterable['@@iterator']) {
        return '@@iterator';
      }
    }
  }

  /**
   * If an iterable object is passed, all of its elements will be added to the
   * new Map/Set, null is treated as undefined.
   *
   * @private
   * @param {string} kind Either 'map' or 'set'.
   * @param {Object} context The Map/Set object.
   * @param {*} iterable Value to parsed.
   */
  function parseIterable(kind, context, iterable) {
    var symbolIterator = getSymbolIterator(iterable),
      iterator, indexof, next, key, char1, char2;
    if (kind === 'map') {
      defProp(context, '[[value]]', []);
    }
    defProps(context, {
      '[[key]]': [],
      '[[order]]': [],
      '[[id]]': new IdGenerator(),
      '[[changed]]': false
    });
    if (symbolIterator && typeof iterable[symbolIterator] === 'function') {
      iterator = iterable[symbolIterator]();
      next = iterator.next();
      if (kind === 'map') {
        if (!isArrayLike(next.value) || next.value.length < 2) {
          throw new TypeError(
            'Iterator value ' +
            isArrayLike(next.value) +
            ' is not an entry object'
          );
        }
      }
      while (!next.done) {
        key = kind === 'map' ? next.value[0] : next.value;
        indexof = indexOf(
          assertIsObject(context)['[[key]]'],
          key,
          'SameValueZero'
        );
        if (indexof < 0) {
          if (kind === 'map') {
            ES.Call(pPush, context['[[value]]'], [next.value[1]]);
          }
          ES.Call(pPush, context['[[key]]'], [key]);
          ES.Call(pPush, context['[[order]]'], [context['[[id]]'].get()]);
          context['[[id]]'].next();
        } else if (kind === 'map') {
          context['[[value]]'][indexof] = next.value[1];
        }
        next = iterator.next();
      }
    }
    if (isString(iterable)) {
      if (kind === 'map') {
        throw new TypeError(
          'Iterator value ' + iterable.charAt(0) + ' is not an entry object'
        );
      }
      next = 0;
      while (next < iterable.length) {
        char1 = ES.Call(pCharAt, iterable, [next]);
        char2 = ES.Call(pCharAt, iterable, [next + 1]);
        if (isSurrogatePair(char1, char2)) {
          key = char1 + char2;
          next += 1;
        } else {
          key = char1;
        }
        indexof = indexOf(
          assertIsObject(context)['[[key]]'],
          key,
          'SameValueZero'
        );
        if (indexof < 0) {
          ES.Call(pPush, context['[[key]]'], [key]);
          ES.Call(pPush, context['[[order]]'], [context['[[id]]'].get()]);
          context['[[id]]'].next();
        }
        next += 1;
      }
    } else if (isArrayLike(iterable)) {
      next = 0;
      while (next < iterable.length) {
        if (kind === 'map') {
          if (isPrimitive(iterable[next])) {
            throw new TypeError(
              'Iterator value ' +
              isArrayLike(next.value) +
              ' is not an entry object'
            );
          }
          key = iterable[next][0];
        } else {
          key = iterable[next];
        }
        key = kind === 'map' ? iterable[next][0] : iterable[next];
        indexof = indexOf(
          assertIsObject(context)['[[key]]'],
          key,
          'SameValueZero'
        );
        if (indexof < 0) {
          if (kind === 'map') {
            ES.Call(pPush, context['[[value]]'], [iterable[next][1]]);
          }
          ES.Call(pPush, context['[[key]]'], [key]);
          ES.Call(pPush, context['[[order]]'], [context['[[id]]'].get()]);
          context['[[id]]'].next();
        } else if (kind === 'map') {
          context['[[value]]'][indexof] = iterable[next][1];
        }
        next += 1;
      }
    }
    defProp(context, 'size', context['[[key]]'].length, true);
  }

  /**
   * The base forEach method executes a provided function once per each value
   * in the Map/Set object, in insertion order.
   *
   * @private
   * @param {string} kind Either 'map' or 'set'.
   * @param {Object} context The Map/Set object.
   * @param {Function} callback Function to execute for each element.
   * @param {*} [thisArg] Value to use as this when executing callback.
   * @return {Object} The Map/Set object.
   */
  function baseForEach(kind, context, callback, thisArg) {
    var pointers, length, value, key;
    assertIsObject(context);
    assertIsCallable(callback);
    pointers = {
      index: 0,
      order: context['[[order]]'][0]
    };
    context['[[change]]'] = false;
    length = context['[[key]]'].length;
    while (pointers.index < length) {
      if (ES.Call(hasOwn, context['[[key]]'], [pointers.index])) {
        key = context['[[key]]'][pointers.index];
        value = kind === 'map' ?  context['[[value]]'][pointers.index] :  key;
        ES.Call(callback, thisArg, [value, key, context]);
      }
      if (context['[[change]]']) {
        length = context['[[key]]'].length;
        ES.Call(pSome, context['[[order]]'], [function (id, count) {
          pointers.index = count;
          return id > pointers.order;
        }]);
        context['[[change]]'] = false;
      } else {
        pointers.index += 1;
      }
      pointers.order = context['[[order]]'][pointers.index];
    }
    return context;
  }

  /**
   * The base has method returns a boolean indicating whether an element with
   * the specified key/value exists in a Map/Set object or not.
   *
   * @private
   * @param {*} key The key/value to test for presence in the Map/Set object.
   * @return {boolean} Returns true if an element with the specified key/value
   *  exists in the Map/Set object; otherwise false.
   */
  baseHas = function has(key) {
    /*jshint validthis:true */
    return indexOf(assertIsObject(this)['[[key]]'], key, 'SameValueZero') > -1;
  };

  /**
   * The base clear method removes all elements from a Map/Set object.
   *
   * @private
   * @param {string} kind Either 'map' or 'set'.
   * @param {Object} context The Map/Set object.
   * @return {Object} The Map/Set object.
   */
  function baseClear(kind, context) {
    assertIsObject(context);
    context['[[id]]'].reset();
    context['[[change]]'] = true;
    context['[[key]]'].length = context['[[order]]'].length = context.size = 0;
    if (kind === 'map') {
      context['[[value]]'].length = 0;
    }
    return context;
  }

  /**
   * The base delete method removes the specified element from a Map/Set object.
   *
   * @private
   * @param {string} kind Either 'map' or 'set'.
   * @param {Object} context The Map/Set object.
   * @param {*} key The key/value of the element to remove from Map/Set object.
   * @return {Object} The Map/Set object.
   */
  function baseDelete(kind, context, key) {
    var indexof = indexOf(
        assertIsObject(context)['[[key]]'],
        key,
        'SameValueZero'
      ),
      result = false,
      args;
    if (indexof > -1) {
      args = [indexof, 1];
      if (kind === 'map') {
        ES.Call(pSplice, context['[[value]]'], args);
      }
      ES.Call(pSplice, context['[[key]]'], args);
      ES.Call(pSplice, context['[[order]]'], args);
      context['[[change]]'] = true;
      context.size = context['[[key]]'].length;
      result = true;
    }
    return result;
  }

  /**
   * The base set and add method.
   *
   * @private
   * @param {string} kind Either 'map' or 'set'.
   * @param {Object} context The Map/Set object.
   * @param {*} key The key or value of the element to add/set on the object.
   * @param {*} value The value of the element to add to the Map object.
   * @return {Object} The Map/Set object.
   */
  function baseAddSet(kind, context, key, value) {
    var index = indexOf(
      assertIsObject(context)['[[key]]'],
      key,
      'SameValueZero'
    );
    if (index > -1) {
      if (kind === 'map') {
        context['[[value]]'][index] = value;
      }
    } else {
      if (kind === 'map') {
        ES.Call(pPush, context['[[value]]'], [value]);
      }
      ES.Call(pPush, context['[[key]]'], [key]);
      ES.Call(pPush, context['[[order]]'], [context['[[id]]'].get()]);
      context['[[id]]'].next();
      context['[[change]]'] = true;
      context.size = context['[[key]]'].length;
    }
    return context;
  }

  /**
   * An object is an iterator when it knows how to access items from a
   * collection one at a time, while keeping track of its current position
   * within that sequence. In JavaScript an iterator is an object that provides
   * a next() method which returns the next item in the sequence. This method
   * returns an object with two properties: done and value. Once created,
   * an iterator object can be used explicitly by repeatedly calling next().
   *
   * @private
   * @constructor
   * @param {Object} context The Set object.
   * @param {string} iteratorKind Values are `value`, `key` or `key+value`.
   */
  function SetIterator(context, iteratorKind) {
    defProps(this, {
      '[[Set]]': assertIsObject(context),
      '[[SetNextIndex]]': 0,
      '[[SetIterationKind]]': iteratorKind || 'value',
      '[[IteratorHasMore]]': true
    });
  }
  /**
   * Once initialized, the next() method can be called to access key-value
   * pairs from the object in turn.
   *
   * @private
   * @function next
   * @return {Object} Returns an object with two properties: done and value.
   */
  defProp(SetIterator.prototype, 'next', function next() {
    var context = assertIsObject(this['[[Set]]']),
      index = this['[[SetNextIndex]]'],
      iteratorKind = this['[[SetIterationKind]]'],
      more = this['[[IteratorHasMore]]'],
      object;
    if (index < context['[[key]]'].length && more) {
      object = {
        done: false
      };
      if (iteratorKind === 'key+value') {
        object.value = [
          context['[[key]]'][index],
          context['[[key]]'][index]
        ];
      } else {
        object.value = context['[[key]]'][index];
      }
      this['[[SetNextIndex]]'] += 1;
    } else {
      this['[[IteratorHasMore]]'] = false;
      object =  {
        done: true,
        value: noop()
      };
    }
    return object;
  });
  /**
   * The @@iterator property is the same Iterator object.
   *
   * @private
   * @function symIt
   * @memberof SetIterator.prototype
   * @return {Object} This Iterator object.
   */
  defProp(SetIterator.prototype, symIt, function iterator() {
    return this;
  });

  /**
   * This method returns a new Iterator object that contains the
   * values for each element in the Set object in insertion order.
   *
   * @private
   * @this Set
   * @return {Object} A new Iterator object.
   */
  setValuesIterator = function values() {
    /*jshint validthis:true */
    return new SetIterator(this);
  };

  /**
   * The Set object lets you store unique values of any type, whether primitive
   * values or object references.
   *
   * @constructor Set
   * @private
   * @param {*} [iterable] If an iterable object is passed, all of its elements
   * will be added to the new Set. null is treated as undefined.
   * @example
   * var mySet = new Set();
   *
   * mySet.add(1);
   * mySet.add(5);
   * mySet.add("some text");
   * var o = {a: 1, b: 2};
   * mySet.add(o);
   *
   * mySet.has(1); // true
   * mySet.has(3); // false, 3 has not been added to the set
   * mySet.has(5);              // true
   * mySet.has(Math.sqrt(25));  // true
   * mySet.has("Some Text".toLowerCase()); // true
   * mySet.has(o); // true
   *
   * mySet.size; // 4
   *
   * mySet.delete(5); // removes 5 from the set
   * mySet.has(5);    // false, 5 has been removed
   *
   * mySet.size; // 3, we just removed one value
   *
   * // Relation with Array objects
   *
   * var myArray = ["value1", "value2", "value3"];
   *
   * // Use the regular Set constructor to transform an Array into a Set
   * var mySet = new Set(myArray);
   *
   * mySet.has("value1"); // returns true
   *
   * // Use the spread operator to transform a set into an Array.
   * console.log(uneval([...mySet])); // Will show you exactly the same Array
   *                                  // as myArray
   */
  SetObject = function Set() {
    if (!(this instanceof SetObject)) {
      throw new TypeError('Constructor Set requires \'new\'');
    }
    parseIterable('set', this, arguments[0]);
  };
  /** @borrows Set as Set */
  module.exports.Set = useCompatability ? SetObject : NativeSet;
  defProps(SetObject.prototype, /** @lends module:collections-x.Set.prototype */ {
    /**
     * The has() method returns a boolean indicating whether an element with the
     * specified value exists in a Set object or not.
     *
     * @function
     * @param {*} value The value to test for presence in the Set object.
     * @return {boolean} Returns true if an element with the specified value
     *  exists in the Set object; otherwise false.
     * @example
     * var Set = require('collections-x').Set;
     * var mySet = new Set();
     * mySet.add("foo");
     *
     * mySet.has("foo");  // returns true
     * mySet.has("bar");  // returns false
     */
    has: baseHas,
    /**
     * The add() method appends a new element with a specified value to the end
     * of a Set object.
     *
     * @param {*} value Required. The value of the element to add to the Set
     *  object.
     * @return {Object} The Set object.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     *
     * mySet.add(1);
     * mySet.add(5).add("some text"); // chainable
     *
     * console.log(mySet);
     * // Set [1, 5, "some text"]
     */
    add: function add(value) {
      return baseAddSet('set', this, value);
    },
    /**
     * The clear() method removes all elements from a Set object.
     *
     * @return {Object} The Set object.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add(1);
     * mySet.add("foo");
     *
     * mySet.size;       // 2
     * mySet.has("foo"); // true
     *
     * mySet.clear();
     *
     * mySet.size;       // 0
     * mySet.has("bar")  // false
     */
    clear: function clear() {
      return baseClear('set', this);
    },
    /**
     * The delete() method removes the specified element from a Set object.
     *
     * @param {*} value The value of the element to remove from the Set object.
     * @return {boolean} Returns true if an element in the Set object has been
     *  removed successfully; otherwise false.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add("foo");
     *
     * mySet.delete("bar"); // Returns false. No "bar" element found
     *                      //to be deleted.
     * mySet.delete("foo"); // Returns true.  Successfully removed.
     *
     * mySet.has("foo");    // Returns false. The "foo" element is no
     *                      //longer present.
     */
    'delete': function de1ete(value) {
      return baseDelete('set', this, value);
    },
    /**
     * The forEach() method executes a provided function once per each value
     * in the Set object, in insertion order.
     *
     * @param {Function} callback Function to execute for each element.
     * @param {*} [thisArg] Value to use as this when executing callback.
     * @return {Object} The Set object.
     * @example
     * function logSetElements(value1, value2, set) {
     *     console.log("s[" + value1 + "] = " + value2);
     * }
     *
     * new Set(["foo", "bar", undefined]).forEach(logSetElements);
     *
     * // logs:
     * // "s[foo] = foo"
     * // "s[bar] = bar"
     * // "s[undefined] = undefined"
     */
    forEach: function forEach(callback, thisArg) {
      return baseForEach('set', this, callback, thisArg);
    },
    /**
     * The values() method returns a new Iterator object that contains the
     * values for each element in the Set object in insertion order.
     *
     * @function
     * @return {Object} A new Iterator object.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add("foo");
     * mySet.add("bar");
     * mySet.add("baz");
     *
     * var setIter = mySet.values();
     *
     * console.log(setIter.next().value); // "foo"
     * console.log(setIter.next().value); // "bar"
     * console.log(setIter.next().value); // "baz"
     */
    values: setValuesIterator,
    /**
     * The keys() method is an alias for the `values` method (for similarity
     * with Map objects); it behaves exactly the same and returns values of
     * Set elements.
     *
     * @function
     * @return {Object} A new Iterator object.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add("foo");
     * mySet.add("bar");
     * mySet.add("baz");
     *
     * var setIter = mySet.keys();
     *
     * console.log(setIter.next().value); // "foo"
     * console.log(setIter.next().value); // "bar"
     * console.log(setIter.next().value); // "baz"
     */
    keys: setValuesIterator,
    /**
     * The entries() method returns a new Iterator object that contains an
     * array of [value, value] for each element in the Set object, in
     * insertion order. For Set objects there is no key like in Map objects.
     * However, to keep the API similar to the Map object, each entry has the
     * same value for its key and value here, so that an array [value, value]
     * is returned.
     *
     * @function
     * @return {Object} A new Iterator object.
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add("foobar");
     * mySet.add(1);
     * mySet.add("baz");
     *
     * var setIter = mySet.entries();
     *
     * console.log(setIter.next().value); // ["foobar", "foobar"]
     * console.log(setIter.next().value); // [1, 1]
     * console.log(setIter.next().value); // ["baz", "baz"]
     */
    entries: function entries() {
      return new SetIterator(this, 'key+value');
    },
    /**
     * The value of size is an integer representing how many entries the Set
     * object has.
     *
     * @name size
     * @memberof module:collections-x.Set
     * @instance
     * @type {number}
     * @example
     * var Set = require('collections-x').Set
     * var mySet = new Set();
     * mySet.add(1);
     * mySet.add(5);
     * mySet.add("some text");
     *
     * mySet.size; // 3
     */
    size: 0
  });
  /**
   * The initial value of the @@iterator property is the same function object
   * as the initial value of the values property.
   *
   * @function symIt
   * @memberof module:collections-x.Set.prototype
   * @return {Object} A new Iterator object.
   * @example
   * var Set = require('collections-x').Set,
   * var symIt = var Set = require('collections-x').symIt;
   * var mySet = new Set();
   * mySet.add("0");
   * mySet.add(1);
   * mySet.add({});
   *
   * var setIter = mySet[symIt]();
   *
   * console.log(setIter.next().value); // "0"
   * console.log(setIter.next().value); // 1
   * console.log(setIter.next().value); // Object
   */
  defProp(SetObject.prototype, symIt, setValuesIterator);

  /**
   * An object is an iterator when it knows how to access items from a
   * collection one at a time, while keeping track of its current position
   * within that sequence. In JavaScript an iterator is an object that provides
   * a next() method which returns the next item in the sequence. This method
   * returns an object with two properties: done and value. Once created,
   * an iterator object can be used explicitly by repeatedly calling next().
   *
   * @private
   * @constructor
   * @param {Object} context The Map object.
   * @param {string} iteratorKind Values are `value`, `key` or `key+value`.
   */
  function MapIterator(context, iteratorKind) {
    defProps(this, {
      '[[Map]]': assertIsObject(context),
      '[[MapNextIndex]]': 0,
      '[[MapIterationKind]]': iteratorKind,
      '[[IteratorHasMore]]': true
    });
  }
  /**
   * Once initialized, the next() method can be called to access key-value
   * pairs from the object in turn.
   *
   * @private
   * @function next
   * @return {Object} Returns an object with two properties: done and value.
   */
  defProp(MapIterator.prototype, 'next', function next() {
    var context = assertIsObject(this['[[Map]]']),
      index = this['[[MapNextIndex]]'],
      iteratorKind = this['[[MapIterationKind]]'],
      more = this['[[IteratorHasMore]]'],
      object;
    assertIsObject(context);
    if (index < context['[[key]]'].length && more) {
      object = {
        done: false
      };
      if (iteratorKind === 'key+value') {
        object.value = [
          context['[[key]]'][index],
          context['[[value]]'][index]
        ];
      } else {
        object.value = context['[[' + iteratorKind + ']]'][index];
      }
      this['[[MapNextIndex]]'] += 1;
    } else {
      this['[[IteratorHasMore]]'] = false;
      object = {
        done: true,
        value: noop()
      };
    }
    return object;
  });
  /**
   * The @@iterator property is the same Iterator object.
   *
   * @private
   * @function symIt
   * @memberof MapIterator.prototype
   * @return {Object} This Iterator object.
   */
  defProp(MapIterator.prototype, symIt, function iterator() {
    return this;
  });

  mapEntries = function entries() {
    return new MapIterator(this, 'key+value');
  };

  /**
   * The Map object is a simple key/value map. Any value (both objects and
   * primitive values) may be used as either a key or a value.
   *
   * @constructor Map
   * @private
   * @param {*} [iterable] Iterable is an Array or other iterable object whose
   *  elements are key-value pairs (2-element Arrays). Each key-value pair is
   *  added to the new Map. null is treated as undefined.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   *
   * var keyString = "a string",
   *     keyObj = {},
   *     keyFunc = function () {};
   *
   * // setting the values
   * myMap.set(keyString, "value associated with 'a string'");
   * myMap.set(keyObj, "value associated with keyObj");
   * myMap.set(keyFunc, "value associated with keyFunc");
   *
   * myMap.size; // 3
   *
   * // getting the values
   * myMap.get(keyString);    // "value associated with 'a string'"
   * myMap.get(keyObj);       // "value associated with keyObj"
   * myMap.get(keyFunc);      // "value associated with keyFunc"
   *
   * myMap.get("a string");   // "value associated with 'a string'"
   *                          // because keyString === 'a string'
   * myMap.get({});           // undefined, because keyObj !== {}
   * myMap.get(function() {}) // undefined, because keyFunc !== function () {}
   *
   * // Using NaN as Map keys
   * var myMap = new Map();
   * myMap.set(NaN, "not a number");
   *
   * myMap.get(NaN); // "not a number"
   *
   * var otherNaN = Number("foo");
   * myMap.get(otherNaN); // "not a number"
   *
   * // Relation with Array objects
   * var kvArray = [["key1", "value1"], ["key2", "value2"]];
   *
   * // Use the regular Map constructor to transform a
   * // 2D key-value Array into a map
   * var myMap = new Map(kvArray);
   *
   * myMap.get("key1"); // returns "value1"
   */
  MapObject = function Map() {
    if (!(this instanceof MapObject)) {
      throw new TypeError('Constructor Map requires \'new\'');
    }
    parseIterable('map', this, arguments[0]);
  };
  /** @borrows Map as Map */
  module.exports.Map = useCompatability ? MapObject : NativeMap;
  defProps(MapObject.prototype, /** @lends module:collections-x.Map.prototype */ {
    /**
     * The has() method returns a boolean indicating whether an element with
     * the specified key exists or not.
     *
     * @function
     * @param {*} key The key of the element to test for presence in the
     *  Map object.
     * @return {boolean} Returns true if an element with the specified key
     *  exists in the Map object; otherwise false.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("bar", "foo");
     *
     * myMap.has("bar");  // returns true
     * myMap.has("baz");  // returns false
     */
    has: baseHas,
    /**
     * The set() method adds a new element with a specified key and value to
     * a Map object.
     *
     * @param {*} key The key of the element to add to the Map object.
     * @param {*} value The value of the element to add to the Map object.
     * @return {Object} The Map object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     *
     * // Add new elements to the map
     * myMap.set("bar", "foo");
     * myMap.set(1, "foobar");
     *
     * // Update an element in the map
     * myMap.set("bar", "fuuu");
     */
    set: function set(key, value) {
      return baseAddSet('map', this, key, value);
    },
    /**
     * The clear() method removes all elements from a Map object.
     *
     * @return {Object} The Map object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("bar", "baz");
     * myMap.set(1, "foo");
     *
     * myMap.size;       // 2
     * myMap.has("bar"); // true
     *
     * myMap.clear();
     *
     * myMap.size;       // 0
     * myMap.has("bar")  // false
     */
    clear: function clear() {
      return baseClear('map', this);
    },
    /**
     * The get() method returns a specified element from a Map object.
     *
     * @param {*} key The key of the element to return from the Map object.
     * @return {*} Returns the element associated with the specified key or
     *  undefined if the key can't be found in the Map object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("bar", "foo");
     *
     * myMap.get("bar");  // Returns "foo".
     * myMap.get("baz");  // Returns undefined.
     */
    get: function get(key) {
      var index = indexOf(
        assertIsObject(this)['[[key]]'],
        key,
        'SameValueZero'
      );
      return index > -1 ? this['[[value]]'][index] : noop();
    },
    /**
     * The delete() method removes the specified element from a Map object.
     *
     * @param {*} key The key of the element to remove from the Map object.
     * @return {boolean} Returns true if an element in the Map object has been
     *  removed successfully.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("bar", "foo");
     *
     * myMap.delete("bar"); // Returns true. Successfully removed.
     * myMap.has("bar");    // Returns false.
     *                      // The "bar" element is no longer present.
     */
    'delete': function de1ete(key) {
      return baseDelete('map', this, key);
    },
    /**
     * The forEach() method executes a provided function once per each
     * key/value pair in the Map object, in insertion order.
     *
     * @param {Function} callback Function to execute for each element..
     * @param {*} [thisArg] Value to use as this when executing callback.
     * @return {Object} The Map object.
     * @example
     * var Map = require('collections-x').Map;
     * function logElements(value, key, map) {
     *      console.log("m[" + key + "] = " + value);
     * }
     * var myMap = new Map([["foo", 3], ["bar", {}], ["baz", undefined]]);
     * myMap.forEach(logElements);
     * // logs:
     * // "m[foo] = 3"
     * // "m[bar] = [object Object]"
     * // "m[baz] = undefined"
     */
    forEach: function forEach(callback, thisArg) {
      return baseForEach('map', this, callback, thisArg);
    },
    /**
     * The values() method returns a new Iterator object that contains the
     * values for each element in the Map object in insertion order.
     *
     * @return {Object} A new Iterator object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("0", "foo");
     * myMap.set(1, "bar");
     * myMap.set({}, "baz");
     *
     * var mapIter = myMap.values();
     *
     * console.log(mapIter.next().value); // "foo"
     * console.log(mapIter.next().value); // "bar"
     * console.log(mapIter.next().value); // "baz"
     */
    values: function values() {
      return new MapIterator(this, 'value');
    },
    /**
     * The keys() method returns a new Iterator object that contains the keys
     * for each element in the Map object in insertion order.
     *
     * @return {Object} A new Iterator object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("0", "foo");
     * myMap.set(1, "bar");
     * myMap.set({}, "baz");
     *
     * var mapIter = myMap.keys();
     *
     * console.log(mapIter.next().value); // "0"
     * console.log(mapIter.next().value); // 1
     * console.log(mapIter.next().value); // Object
     */
    keys: function keys() {
      return new MapIterator(this, 'key');
    },
    /**
     * The entries() method returns a new Iterator object that contains the
     * [key, value] pairs for each element in the Map object in insertion order.
     *
     * @return {Object} A new Iterator object.
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set("0", "foo");
     * myMap.set(1, "bar");
     * myMap.set({}, "baz");
     *
     * var mapIter = myMap.entries();
     *
     * console.log(mapIter.next().value); // ["0", "foo"]
     * console.log(mapIter.next().value); // [1, "bar"]
     * console.log(mapIter.next().value); // [Object, "baz"]
     */
    entries: mapEntries,
    /**
     * The value of size is an integer representing how many entries the Map
     * object has.
     *
     * @name size
     * @memberof module:collections-x.Map
     * @instance
     * @type {number}
     * @example
     * var Map = require('collections-x').Map;
     * var myMap = new Map();
     * myMap.set(1, true);
     * myMap.set(5, false);
     * myMap.set("some text", 1);
     *
     * myMap.size; // 3
     */
    size: 0
  });
  /**
   * The initial value of the @@iterator property is the same function object
   * as the initial value of the entries property.
   *
   * @function symIt
   * @memberof module:collections-x.Map.prototype
   * @return {Object} A new Iterator object.
   * @example
   * var Map = require('collections-x').Map;
   * var symIt = require('collections-x').symIt;
   * var myMap = new Map();
   * myMap.set("0", "foo");
   * myMap.set(1, "bar");
   * myMap.set({}, "baz");
   *
   * var mapIter = myMap[symIt]();
   *
   * console.log(mapIter.next().value); // ["0", "foo"]
   * console.log(mapIter.next().value); // [1, "bar"]
   * console.log(mapIter.next().value); // [Object, "baz"]
   */
  defProp(MapObject.prototype, symIt, mapEntries);
}());

},{"assert-is-callable-x":5,"assert-is-object-x":8,"big-counter-x":11,"define-properties":27,"define-property-x":12,"es-abstract":55,"index-of-x":17,"is-array-like-x":13,"is-primitive":64,"is-string":26,"is-surrogate-pair-x":15,"noop-x":16}],5:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-is-callable-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/assert-is-callable-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-is-callable-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-callable-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/assert-is-callable-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-callable-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-is-callable-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-is-callable-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * If IsCallable(callbackfn) is false, throw a TypeError exception.
 * @version 1.0.4
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-callable-x
 */

/*jslint maxlen:80, es6:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:3, maxdepth:2,
  maxstatements:12, maxcomplexity:6 */

/*global require, module */

;(function () {
  'use strict';

  var ES = require('es-abstract/es6'),
    safeToString = require('safe-to-string-x'),
    isPrimitive = require('is-primitive');
  /**
   * Tests `callback` to see if it is callable, throws a `TypeError` if it is
   * not. Otherwise returns the `callback`.
   *
   * @param {*} callback The argument to be tested.
   * @throws {TypeError} Throws if `callback` is not a callable.
   * @return {*} Returns `callback` if it is callable.
   * @example
   * var assertIsCallable = require('assert-is-callable-x');
   * var primitive = true;
   * var mySymbol = Symbol('mySymbol');
   * var object = {};
   * function fn () {}
   *
   * assertIsCallable(primitive); // TypeError 'true is not a function'.
   * assertIsCallable(object); // TypeError '#<Object> is not a function'.
   * assertIsCallable(mySymbol); // TypeError '#<Symbol> is not a function'.
   * assertIsCallable(fn); // Returns fn.
   */
  module.exports =  function assertIsCallable(callback) {
    if (!ES.IsCallable(callback)) {
      throw new TypeError(
        (isPrimitive(callback) ? safeToString(callback) : '#<Object>') +
        ' is not a function'
      );
    }
    return callback;
  };
}());

},{"es-abstract/es6":48,"is-primitive":64,"safe-to-string-x":6}],6:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/safe-to-string-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/safe-to-string-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/safe-to-string-x" title="npm version">
 * <img src="https://badge.fury.io/js/safe-to-string-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 safeToString module. Converts a `Symbol` to `#<Symbol>` instead of
 * throwing.
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module safe-to-string-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:2, maxcomplexity:2 */

/*global module */

;(function () {
  'use strict';

  var ES = require('es-abstract/es6'),
    isSymbol = require('is-symbol');

  /**
   * Performs no operation but returns a constant `undefined` inherently.
   *
   * @param {*} value The value to convert to a string.
   * @return {string} The converted value.
   * @example
   * var safeToString = require('safe-to-string-x');
   *
   * safeToString(); // 'undefined'
   * safeToString(null); // 'null'
   * safeToString('abc'); // 'abc'
   * safeToString(true); // 'true'
   * safeToString(Symbol.iterator); // '#<Symbol>'
   */
  module.exports = function safeToString(value) {
    return isSymbol(value) ? '#<Symbol>' : ES.ToString(value);
  };
}());

},{"es-abstract/es6":48,"is-symbol":7}],7:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],8:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-is-object-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/assert-is-object-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-is-object-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-object-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/assert-is-object-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-object-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-is-object-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-is-object-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * If IsObject(value) is false, throw a TypeError exception.
 * @version 1.0.3
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-object-x
 */

/*jslint maxlen:80, es6:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:3, maxdepth:2,
  maxstatements:12, maxcomplexity:6 */

/*global require, module */

;(function () {
  'use strict';

  var safeToString = require('safe-to-string-x'),
    isPrimitive = require('is-primitive');

  /**
   * Tests `value` to see if it is an object, throws a `TypeError` if it is
   * not. Otherwise returns the `value`.
   *
   * @param {*} value The argument to be tested.
   * @throws {TypeError} Throws if `value` is not an object.
   * @return {*} Returns `value` if it is an object.
   * @example
   * var assertIsObject = require('assert-is-object-x');
   * var primitive = true;
   * var mySymbol = Symbol('mySymbol');
   * var object = {};
   * function fn () {}
   *
   * assertIsObject(primitive); // TypeError 'true is not an object'.
   * assertIsObject(primitive); // TypeError '#<Symbol> is not an object'.
   * assertIsObject(object); // Returns object.
   * assertIsObject(fn); // Returns fn.
   */
  module.exports = function assertIsObject(value) {
    if (isPrimitive(value)) {
      throw new TypeError(safeToString(value) + ' is not an object');
    }
    return value;
  };
}());

},{"is-primitive":64,"safe-to-string-x":9}],9:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6,"es-abstract/es6":48,"is-symbol":10}],10:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],11:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/big-counter-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/big-counter-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/big-counter-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/big-counter-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/big-counter-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/big-counter-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/big-counter-x" title="npm version">
 * <img src="https://badge.fury.io/js/big-counter-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * A big counter module.
 * @version 1.0.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module big-counter-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:8, maxcomplexity:4 */

/*global module */

;(function () {
  'use strict';

  var pPush = Array.prototype.push,
    pJoin = Array.prototype.join,
    ES = require('es-abstract/es6'),
    defProps = require('define-properties'),
    defProp = require('define-property-x'),
    $max = Math.max,
    $floor = Math.floor,
    BigC;
  /**
   * Increments the counter's value by `1`.
   *
   * @private
   * @return {Object} The counter object.
   */
  function counterNext() {
    /*jshint validthis:true */
    var result = [],
      length = this.count.length,
      howMany = $max(length, 1),
      carry = 0,
      index = 0,
      zi;
    while (index < howMany || carry) {
      zi = carry + (index < length ? this.count[index] : 0) + !index;
      ES.Call(pPush, result, [zi % 10]);
      carry = $floor(zi / 10);
      index += 1;
    }
    this.count = result;
    return this;
  }
  /**
   * Serialise the counter's current value.
   *
   * @private
   * @this BigCounter
   * @return {string} A string representation of an integer.
   */
  function counterToString() {
    /*jshint validthis:true */
    return ES.Call(pJoin, this.count, ['']);
  }
  /**
   * Incremental integer counter. Counts from `0` to very big intergers.
   * Javascript's number type allows you to count in integer steps
   * from `0` to `9007199254740991`. As of ES5, Strings can contain
   * approximately 65000 characters and ES6 is supposed to handle
   * the `MAX_SAFE_INTEGER` (though I don't believe any environments supports
   * this). This counter represents integer values as strings and can therefore
   * count in integer steps from `0` to the maximum string length (that's some
   * 65000 digits). In the lower range, upto `9007199254740991`, the strings can
   * be converted to safe Javascript integers `Number(value)` or `+value`. This
   * counter is great for any applications that need a really big count
   * represented as a string, (an ID string).
   *
   * @constructor
   * @example
   * var BigCounter = require('big-counter-x');
   * var counter = new BigCounter();
   *
   * counter.get(); // '0'
   * counter.next(); // counter object
   * counter.get(); // '1'
   *
   * // Methods are chainable.
   * counter.inc().next(); // counter object
   * counter.get(); // '3'
   *
   * counter.reset(); // counter object
   * counter.get(); // '0'
   * counter.toString(); // '0'
   * counter.valueOf(); // '0'
   * counter.toJSON(); // '0'
   *
   * // Values upto `9007199254740991` convert to numbers.
   * Number(counter); // 0
   * +counter; // 0
   */
  module.exports = BigC = function BigCounter() {
    /* istanbul ignore if */
    if (!(this instanceof BigC)) {
      return new BigC();
    }
    defProp(this, 'count', [0]);
  };
  defProps(BigC.prototype, {
    /**
     * Increments the counter's value by `1`.
     *
     * @function
     * @return {Object} The counter object.
     */
    next: counterNext,
    /**
     * Increments the counter's value by `1`.
     *
     * @function
     * @return {Object} The counter object.
     */
    inc: counterNext,
    /**
     * Gets the counter's current value.
     *
     * @function
     * @return {string} A string representation of an integer.
     */
    get: counterToString,
    /**
     * Gets the counter's current value.
     *
     * @function
     * @return {string} A string representation of an integer.
     */
    valueOf: counterToString,
    /**
     * Gets the counter's current value.
     *
     * @function
     * @return {string} A string representation of an integer.
     */
    toString: counterToString,
    /**
     * Gets the counter's current value.
     *
     * @function
     * @return {string} A string representation of an integer.
     */
    toJSON: counterToString,
    /**
     * Resets the counter back to `0`.
     *
     * @function
     * @return {Object} The counter object.
     */
    reset: function () {
      this.count.length = 0;
      ES.Call(pPush, this.count, [0]);
      return this;
    }
  }, {
    valueOf: function () { return true; },
    toString: function () { return true; },
    toJSON: function () { return true; }
  });
}());

},{"define-properties":27,"define-property-x":12,"es-abstract/es6":48}],12:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/define-property-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/define-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/define-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/define-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/define-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/define-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/define-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/define-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * A helper for
* {@link https://www.npmjs.com/package/define-properties `define-properties`}.
 * @version 1.0.3
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module define-property-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:4, maxdepth:1,
  maxstatements:6, maxcomplexity:2 */

/*global module */

;(function () {
  'use strict';

  var defineProps = require('define-properties');

  /**
   * Predicate that always returns `true` (constant).
   *
   * @private
   * @return {boolean} Returns `true`.
   */
  function truePredicate() {
    return true;
  }

  /**
   * Just like `define-properties` but for defining a single non-enumerable
   * property. Useful in environments that do not support
   * `Computed property names`. This can be done with `define-properties`, but
   * this method can read a little cleaner.
   *
   * @see https://www.npmjs.com/package/define-properties
   * @param {Object} object The object on which to define the property.
   * @param {string|Symbol} property The property name.
   * @param {*} value The value of the property.
   * @param {boolean} [force=false] If `true` then set property regardless.
   * @example
   * var defineProps = require('define-properties');
   * var defineProp = require('define-property-x');
   * var myString = 'something';
   * var obj = defineProps({
   *   a: 1,
   *   b: 2
   *   [Symbol.iterator]: function () {}, // This is not yet widely supported.
   *   [myString]: true // This is not yet widely supported.
   * }, {
   *   a: function () { return false; },
   *   b: function () { return true; }
   *   [Symbol.iterator]: function () { return true; }, // This is not yet
   *                                                    // widely supported.
   *   [myString]: function () { return true; } // This is not yet widely
   *                                            // supported.
   * });
   *
   * // But you can do this.
   * defineProp(obj, Symbol.iterator, function () {}, true);
   * defineProp(obj, myString, function () {}, true);
   */
  module.exports = function defineProperty(object, property, value, force) {
    var prop = {},
      predicate = {};
    prop[property] = value;
    if (force) {
      predicate[property] = truePredicate;
    }
    defineProps(object, prop, predicate);
  };
}());

},{"define-properties":27}],13:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-array-like-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-array-like-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-array-like-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-array-like-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-array-like-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-array-like-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-array-like-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-array-like-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 isArrayLike module.
 * @version 1.0.3
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-array-like-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:2, maxcomplexity:1 */

/*global module */

;(function () {
  'use strict';

  var ES = require('es-abstract'),
    isLength = require('is-length-x');

  /**
   * Checks if value is array-like. A value is considered array-like if it's
   * not a function and has a `length` that's an integer greater than or
   * equal to 0 and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @param {*} subject The object to be tested.
   * @return {boolean} Returns `true` if subject is array-like, else `false`.
   * @example
   * var isArrayLike = require('is-array-like-x');
   *
   * isArrayLike([1, 2, 3]); // true
   * isArrayLike(document.body.children); // true
   * isArrayLike('abc'); // true
   * isArrayLike(_.noop); // false
   */
  module.exports = function isArrayLike(subject) {
    /*jshint eqnull:true */
    return subject != null &&
      !ES.IsCallable(subject) &&
      isLength(subject.length);
  };
}());

},{"es-abstract":55,"is-length-x":14}],14:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-length-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-length-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-length-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-length-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-length-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-length-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-length-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-length-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 isLength module.
 * @version 1.0.3
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-length-x
 */

/*jslint maxlen:80, es6:true, this:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:2, maxcomplexity:1 */

/*global module */

;(function () {
  'use strict';

  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

  /**
   * Checks if value is a valid ES6 array-like length.
   *
   * @param {*} subject The `value` to check.
   * @return {boolean} Returns `true` if value is a valid length, else `false`.
   * @example
   * var isLength = require('is-length-x');
   *
   * isLength(3); // true
   * isLength(Number.MIN_VALUE); // false
   * isLength(Infinity); // false
   * isLength('3'); //false
   */
  module.exports = function isLength(subject) {
    return typeof subject === 'number' &&
      subject > -1 &&
      subject % 1 === 0 &&
      subject <= MAX_SAFE_INTEGER;
  };
}());

},{}],15:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-surrogate-pair-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-surrogate-pair-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-surrogate-pair-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-surrogate-pair-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-surrogate-pair-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-surrogate-pair-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-surrogate-pair-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-surrogate-pair-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * isSurrogatePair module. Determine if two characters make a surrogate pair.
 * @version 1.0.2
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-surrogate-pair-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:2, maxdepth:3,
  maxstatements:8, maxcomplexity:4 */

/*global module */

;(function () {
  'use strict';

  var ES = require('es-abstract/es6'),
    pCharCodeAt = String.prototype.charCodeAt;

  /**
   * Tests if the two character arguments combined are a valid UTF-16
   * surrogate pair.
   *
   * @param {*} char1 The first character of a suspected surrogate pair.
   * @param {*} char2 The second character of a suspected surrogate pair.
   * @return {boolean} Returns true if the two characters create a valid
   *  UTF-16 surrogate pair; otherwise false.
   * @example
   * var isSurrogatePair = require('is-surrogate-pair-x');
   * var test1 = 'a';
   * var test2 = '𠮟';
   *
   * isSurrogatePair(test1.charAt(0), test1.charAt(1)); // false
   * isSurrogatePair(test2.charAt(0), test2.charAt(1)); // true
   */
  module.exports = function isSurrogatePair(char1, char2) {
    var code1, code2;
    if (typeof char1 === 'string' && typeof char2 === 'string') {
      code1 = ES.Call(pCharCodeAt, char1);
      if (code1 >= 0xD800 && code1 <= 0xDBFF) {
        code2 = ES.Call(pCharCodeAt, char2);
        if (code2 >= 0xDC00 && code2 <= 0xDFFF) {
          return true;
        }
      }
    }
    return false;
  };
}());

},{"es-abstract/es6":48}],16:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/noop-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/noop-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/noop-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/noop-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/noop-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/noop-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/noop-x" title="npm version">
 * <img src="https://badge.fury.io/js/noop-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES3 noop module. Performs no operation but returns a constant `undefined`
 * inherently.
 * @version 1.0.5
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module noop-x
 */

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:1, maxcomplexity:1 */

/*global module */

;(function () {
  'use strict';

  /**
   * Performs no operation but returns a constant `undefined` inherently.
   *
   * @example
   * var noop = require('noop-x');
   *
   * noop(); // undefined
   * noop(Number.MIN_VALUE); // undefined
   * noop('abc'); // undefined
   * noop(true); //undefined
   */
  module.exports = function noop() {};
}());

},{}],17:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/index-of-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/index-of-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/index-of-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/index-of-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/index-of-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/index-of-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/index-of-x" title="npm version">
 * <img src="https://badge.fury.io/js/index-of-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * An extended ES6 indexOf module.
 * @version 1.0.4
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module index-of-x
 */

/*jslint maxlen:80, es6:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:4, maxdepth:4,
  maxstatements:26, maxcomplexity:15 */

/*global require, module */

;(function () {
  'use strict';

  var pCharAt = String.prototype.charAt,
    pIndexOf = Array.prototype.indexOf,
    pSlice = Array.prototype.slice,
    $abs = Math.abs,
    ES = require('es-abstract/es6'),
    isString = require('is-string'),
    findIndex = require('find-index-x');

  /**
   * This method returns an index in the array, if an element in the array
   * satisfies the provided testing function. Otherwise -1 is returned.
   *
   * @private
   * @param {Array} object The array to search.
   * @param {*} searchElement Element to locate in the array.
   * @param {number} fromIndex The index to start the search at.
   * @param {Function} extendFn The comparison function to use.
   * @return {number} Returns index of found element, otherwise -1.
   */
  function findIndexFrom(object, searchElement, fromIndex, extendFn) {
    var isStr = isString(object),
      length = ES.ToLength(object.length),
      element;
    while (fromIndex < length) {
      element = isStr ?
        ES.Call(pCharAt, object, [fromIndex]) :
        object[fromIndex];
      if (fromIndex in object && extendFn(element, searchElement)) {
        return fromIndex;
      }
      fromIndex += 1;
    }
    return -1;
  }

  /**
   * This method returns the first index at which a given element can be found
   * in the array, or -1 if it is not present.
   *
   * @param {Array} array The array to search.
   * @throws {TypeError} If `array` is `null` or `undefined`.
   * @param {*} searchElement Element to locate in the `array`.
   * @param {number} [fromIndex] The index to start the search at. If the
   *  index is greater than or equal to the array's length, -1 is returned,
   *  which means the array will not be searched. If the provided index value is
   *  a negative number, it is taken as the offset from the end of the array.
   *  Note: if the provided index is negative, the array is still searched from
   *  front to back. If the calculated index is less than 0, then the whole
   *  array will be searched. Default: 0 (entire array is searched).
   * @param {string} [extend] Extension type: `SameValue` or `SameValueZero`.
   * @return {number} Returns index of found element, otherwise -1.
   * @example
   * var indexOf = require('index-of-x');
   * var subject = [2, 3, undefined, true, 'hej', null, 2, false, 0, -0, NaN];
   *
   * // Standard mode, operates just like `Array.prototype.indexOf`.
   * indexOf(subject, null); // 5
   * indexOf(testSubject, '2'); // -1
   * indexOf(testSubject, NaN); // -1
   * indexOf(testSubject, -0); // 8
   * indexOf(testSubject, 2, 2); //6
   *
   * // `SameValueZero` mode extends `indexOf` to match `NaN`.
   * indexOf(subject, null, 'SameValueZero'); // 5
   * indexOf(testSubject, '2', 'SameValueZero'); // -1
   * indexOf(testSubject, NaN, 'SameValueZero'); // 10
   * indexOf(testSubject, -0, 'SameValueZero'); // 8
   * indexOf(testSubject, 2, 2, 'SameValueZero'); //6
   *
   * // `SameValue` mode extends `indexOf` to match `NaN` and signed `0`.
   * indexOf(subject, null, 'SameValue'); // 5
   * indexOf(testSubject, '2', 'SameValue'); // -1
   * indexOf(testSubject, NaN, 'SameValue'); // 10
   * indexOf(testSubject, -0, 'SameValue'); // 9
   * indexOf(testSubject, 2, 2, 'SameValue'); //6
   */
  module.exports = function indexOf(array, searchElement) {
    var object = ES.ToObject(array),
      length = ES.ToLength(object.length),
      fromIndex, extend, extendFn;
    if (!length) {
      return -1;
    }
    if (arguments.length > 2) {
      if (arguments.length > 3) {
        extend = arguments[3];
      } else if (isString(arguments[2])) {
        extend = String(arguments[2]);
      }
    }
    if (extend === 'SameValue') {
      extendFn = ES.SameValue;
    } else if (extend === 'SameValueZero') {
      extendFn = ES.SameValueZero;
    }
    if (extendFn && (searchElement === 0 || searchElement !== searchElement)) {
      fromIndex = ES.ToInteger(arguments[2]);
      if (fromIndex < length) {
        if (fromIndex < 0) {
          fromIndex = length - $abs(fromIndex);
          if (fromIndex < 0) {
            fromIndex = 0;
          }
        }
      }
      if (fromIndex > 0) {
        return findIndexFrom(object, searchElement, fromIndex, extendFn);
      }
      return findIndex(object, function (element, index) {
        return index in object && extendFn(searchElement, element);
      });
    }
    return ES.Call(pIndexOf, object, ES.Call(pSlice, arguments, [1]));
  };
}());

},{"es-abstract/es6":48,"find-index-x":18,"is-string":26}],18:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/find-index-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/find-index-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/find-index-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/find-index-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/find-index-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/find-index-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/find-index-x" title="npm version">
 * <img src="https://badge.fury.io/js/find-index-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 findIndex module.
 * @version 1.0.5
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module find-index-x
 */

/*jslint maxlen:80, es6:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:3, maxdepth:2,
  maxstatements:12, maxcomplexity:6 */

/*global require, module */

;(function (fndIdx) {
  'use strict';

  var ES = require('es-abstract/es6'),
    pCharAt, isString, assertIsCallable;

  if (typeof findIndex === 'function') {
    module.exports = function findIndex(array, callback, thisArg) {
      return ES.Call(fndIdx, array, [callback, thisArg]);
    };
    return;
  }

  pCharAt = String.prototype.charAt;
  isString = require('is-string');
  assertIsCallable = require('assert-is-callable-x');

  /**
   * This method returns an index in the array, if an element in the array
   * satisfies the provided testing function. Otherwise -1 is returned.
   *
   * @param {Array} array The array to search.
   * @throws {TypeError} If array is `null` or `undefined`-
   * @param {Function} callback Function to execute on each value in the array,
   *  taking three arguments: `element`, `index` and `array`.
   * @throws {TypeError} If `callback` is not a function.
   * @param {*} [thisArg] Object to use as `this` when executing `callback`.
   * @return {number} Returns index of positively tested element, otherwise -1.
   * @example
   * var findIndex = require('find-index.x');
   *
   * function isPrime(element, index, array) {
   *   var start = 2;
   *   while (start <= Math.sqrt(element)) {
   *     if (element % start++ < 1) {
   *       return false;
   *     }
   *   }
   *   return element > 1;
   * }
   *
   * console.log(findIndex([4, 6, 8, 12], isPrime)); // -1, not found
   * console.log(findIndex([4, 6, 7, 12], isPrime)); // 2
   */
  module.exports =  function findIndex(array, callback, thisArg) {
    var object = ES.ToObject(array),
      length, index, isStr, item;
    assertIsCallable(callback);
    isStr = isString(array);
    length = ES.ToLength(object.length);
    index = 0;
    while (index < length) {
      item = isStr ? ES.Call(pCharAt, object, [index]) : object[index];
      if (ES.Call(callback, thisArg, [item, index, object])) {
        return index;
      }
      index += 1;
    }
    return -1;
  };
}(Array.prototype.findIndex));

},{"assert-is-callable-x":19,"es-abstract/es6":48,"is-string":26}],19:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5,"es-abstract/es6":48,"is-primitive":64,"safe-to-string-x":20}],20:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6,"es-abstract/es6":48,"is-symbol":21}],21:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],22:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
	return toStr.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		toStr.call(value) !== '[object Array]' &&
		toStr.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{}],23:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],24:[function(require,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],25:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],26:[function(require,module,exports){
'use strict';

var strValue = String.prototype.valueOf;
var tryStringObject = function tryStringObject(value) {
	try {
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var strClass = '[object String]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isString(value) {
	if (typeof value === 'string') { return true; }
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};

},{}],27:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var foreach = require('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":28,"object-keys":29}],28:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],29:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var blacklistedKeys = {
	$console: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$parent: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!blacklistedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":30}],30:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],31:[function(require,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/error-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/error-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/error-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/error-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/error-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/error-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/error-x" title="npm version">
 * <img src="https://badge.fury.io/js/error-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Create custom Javascript Error objects.
 *
 * Want to create your own Error objects, this module will allow you to do
 * just that. It ships with all the standard Error objects already created
 * for you. Why? Well, these offer some improvements over the native versions.
 * - They have a `toJSON` method and so they can be serialised.
 * - They have a standardised `stack` property, using
 * [`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
 * messages and stacks are parsed and then re-formatted.
 * - They have a `frames` property which is an array of the parsed `stack`
 * message, so you have easy access to the information.
 *
 * @example
 * var errorX = require('error-x');
 * var MyError = errorX.create('MyError'); // Uses `Error` as no constructor
 *                                         // specified.
 * var err = new MyError('somethingHappened');
 *
 * JSON.stringify(err); // => see below.
 * // A searialised error, showing the custom error object's structure and
 * // format
 * {
 *   "name": "MyError",
 *   "message": "somethingHappened",
 *   "frames": [
 *     {
 *       "functionName": "Y.x",
 *       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
 *       "lineNumber": 65,
 *       "columnNumber": 13,
 *       "source": "Y.x (http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13)"
 *     },
 *     {
 *       "functionName": "window.onload",
 *       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
 *       "lineNumber": 73,
 *       "columnNumber": 3,
 *       "source": "window.onload (http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3)"
 *     }
 *   ],
 *   "stack": "Y.x()@http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13\nwindow.onload()@http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3"
 * }
 *
 * @version 1.0.6
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module error-x
 */

/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:2, maxdepth:3,
  maxstatements:15, maxcomplexity:8 */

/*global require, module */

;(function () {
  'use strict';

  var hasToStringTag = typeof Symbol === 'function' &&
      typeof Symbol.toStringTag === 'symbol',
    pMap = Array.prototype.map,
    pJoin = Array.prototype.join,
    pSlice = Array.prototype.slice,
    pIndexOf = String.prototype.indexOf,
    safeToString = require('safe-to-string-x'),
    noop = require('noop-x'),
    StackFrame = require('stackframe'),
    errorStackParser = require('error-stack-parser'),
    defProps = require('define-properties'),
    defProp = require('define-property-x'),
    CircularJSON = require('circular-json'),
    findIndex = require('find-index-x'),
    ES = require('es-abstract'),
    isPlainObject = require('lodash.isplainobject'),
    truePredicate = require('lodash.constant')(true),
    ERROR = Error,
    TYPEERROR = TypeError,
    SYNTAXERROR = SyntaxError,
    RANGEERROR = RangeError,
    EVALERROR = EvalError,
    REFERENCEERROR = ReferenceError,
    URIERROR = URIError,
    ASSERTIONERROR,
    cV8 = ERROR.captureStackTrace && (function () {
      // Capture the function (if any).
      var captureStackTrace = ERROR.captureStackTrace;
      // Test to see if the function works.
      try {
        captureStackTrace(new ERROR(), captureStackTrace);
      } catch (ignore) {
        return false;
      }
      /**
       * The stack preparation function for the V8 stack.
       *
       * @private
       * @param {*} ignore Unused argument.
       * @param {!Object} thisStack The V8 stack.
       * @return {!Object} The V8 stack.
       */
      function prepareStackTrace(ignore, thisStack) {
        return thisStack;
      }
      /**
       * Captures the V8 stack and converts it to an array of Stackframes.
       *
       * @private
       * @function captureV8
       * @param {!Object} context The Custom$$Error this object.
       * @return {!Array.<!Object>} Array of StackFrames.
       */
      return function captureV8(context) {
        var temp = ERROR.prepareStackTrace,
          error, frames;
        ERROR.prepareStackTrace = prepareStackTrace;
        error = new ERROR();
        captureStackTrace(error, context.constructor);
        frames = ES.Call(pMap, error.stack, [function (frame) {
          return new StackFrame(
            frame.getFunctionName(),
            noop(),
            frame.getFileName(),
            frame.getLineNumber(),
            frame.getColumnNumber(),
            frame.toString()
          );
        }]);
        if (typeof temp === 'undefined') {
          delete ERROR.prepareStackTrace;
        } else {
          ERROR.prepareStackTrace = temp;
        }
        return frames;
      };
    }(ERROR)),
    allCtrs = true;

  /**
   * Defines frames and stack on the Custom$$Error this object.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   * @param {!Array.<!Object>} frames Array of StackFrames.
   */
  function defContext(context, frames) {
    defProps(context, {
      frames: frames,
      stack: ES.Call(pJoin, ES.Call(pMap, frames, [function (frame) {
        return frame.toString();
      }]), ['\n'])
    }, {
      frames: truePredicate,
      stack: truePredicate
    });
  }

  /**
   * Captures the other stacks and converts them to an array of Stackframes.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   * @param {!Object} err The Error object to be parsed.
   * @return {boolean} True if the Error object was parsed, otherwise false.
   */
  function errParse(context, err) {
    var frames, start, end, item;
    try {
      frames = errorStackParser.parse(err);
    } catch (ignore) {
      return false;
    }
    start = findIndex(frames, function (frame) {
      return ES.Call(pIndexOf, frame.functionName, ['Custom$$Error']) > -1;
    });
    if (start > -1) {
      item = frames[start];
      frames = ES.Call(pSlice, frames, [start + 1]);
      end = findIndex(frames, function (frame) {
        return item.source === frame.source;
      });
      if (end > -1) {
        frames = ES.Call(pSlice, frames, [0, end]);
      }
    }
    defContext(context, frames);
    return true;
  }

  /**
   * The main function for capturing and parsing stacks and setting properties
   * on Custom$$Error.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   */
  function parse(context) {
    var err;
    if (cV8) {
      defContext(context, cV8(context));
    } else {
      try {
        // Error must be thrown to get stack in IE
        throw ERROR();
      } catch (e) {
        err = e;
      }
      if (!errParse(context, err)) {
        // If `Error` has a non-standard `stack`, `stacktrace` or
        // `opera#sourceloc` property that offers a trace of which functions
        // were called, in what order, from which line and  file, and with what
        // argument, then we will set it.
        if (typeof err['opera#sourceloc'] !== 'undefined') {
          defProps(context, {
            'opera#sourceloc': err['opera#sourceloc']
          }, {
            'opera#sourceloc': truePredicate
          });
        }
        if (typeof err.stacktrace !== 'undefined') {
          defProps(context, {
            stacktrace: err.stacktrace
          }, {
            stacktrace: truePredicate
          });
        }
        if (typeof err.stack !== 'undefined') {
          defProps(context, {
            stack: err.stack
          }, {
            stack: truePredicate
          });
        }
        defProps(context, {
          frames: []
        }, {
          frames: truePredicate
        });
      }
    }
  }

  /**
   * Test whether we have a valid Error constructor.
   *
   * @private
   * @param {Function} ErrorCtr Constructor to test it creates an Error.
   * @return {boolean} True if ErrorCtr creates an Error, otherwise false.
   */
  function isErrorCtr(ErrorCtr) {
    if (ES.IsCallable(ErrorCtr)) {
      try {
        return new ErrorCtr() instanceof ERROR;
      } catch (ignore) {}
    }
    return false;
  }

  /**
   * Detect whether we are creating an 'AssertionError' constructor.
   *
   * @private
   * @param {string} name Name to test if it is 'AssertionError'.
   * @param {Function} ErrorCtr Constructor to test it creates ASSERTIONERROR.
   * @return {boolean} True if either arguments asserts, otherwise false.
   */
  function asAssertionError(name, ErrorCtr) {
    return name === 'AssertionError' ||
      isErrorCtr(ASSERTIONERROR) && new ErrorCtr() instanceof ASSERTIONERROR;
  }

  /**
   * The toJSON method returns a string representation of the Error object.
   *
   * @private
   * @this {!Object} A custom error instance.
   * @return {string} A JSON stringified representation.
   */
  function toJSON() {
    /*jshint validthis:true */
    return CircularJSON.stringify({
      name: this.name,
      message: this.message,
      frames: this.frames,
      stack: this.stack,
      stackframe: this.stackframe,
      'opera#sourceloc': this['opera#sourceloc'],
      actual: this.actual,
      expected: this.expected,
      operator: this.operator
    });
  }

  /**
   * Creates a custom Error constructor. Will use `Error` if argument is not
   * a valid constructor.
   *
   * @private
   * @param {string} [name='Error'] The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   * @return {Function} The custom Error constructor.
   */
  function create(name, ErrorCtr) {
    var CustomCtr;
    if (!allCtrs || !isErrorCtr(ErrorCtr)) {
      ErrorCtr = ERROR;
    }
    /**
     * Create a new object, that prototypally inherits from the `Error`
     * constructor.
     *
     * @private
     * @constructor Custom$$Error
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    CustomCtr = function Custom$$Error(message) {
      // If `message` is our internal `truePredicate` function then we are
      // inheriting and we do not need to process any further.
      if (message === truePredicate) {
        return;
      }
      // If `Custom$$Error` was not called with `new`
      if (!(this instanceof CustomCtr)) {
        return new CustomCtr(message);
      }
      if (asAssertionError(name, ErrorCtr)) {
        if (!isPlainObject(message)) {
          message = {};
        }
        if (typeof message.message !== 'undefined') {
          defProps(this, {
            message: safeToString(message.message)
          }, {
            message: truePredicate
          });
        }
        defProps(this, {
          actual: message.actual,
          expected: message.expected
        }, {
          actual: truePredicate,
          expected: truePredicate
        });
        if (typeof message.operator !== 'undefined') {
          defProps(this, {
            operator: safeToString(message.operator)
          }, {
            operator: truePredicate
          });
        }
      } else {
        // Standard Errors. Only set `this.message` if the argument `message`
        // was not `undefined`.
        if (typeof message !== 'undefined') {
          defProps(this, {
            message: safeToString(message)
          }, {
            message: truePredicate
          });
        }
      }
      // Parse and set the 'this' properties.
      parse(this);
    };
    // Inherit the prototype methods from `ErrorCtr`.
    CustomCtr.prototype = ErrorCtr.prototype;
    CustomCtr.prototype = new CustomCtr(truePredicate);
    defProps(CustomCtr.prototype, /** @lends module:error-x.Custom$$Error.prototype */ {
      /**
       * Specifies the function that created an instance's prototype.
       *
       * @constructor
       */
      constructor: CustomCtr,
      /**
       * The name property represents a name for the type of error.
       *
       * @default 'Error'
       * @type {string}
       */
      name: typeof name === 'undefined' ? 'Error' : safeToString(name),
      /**
       * IE<9 has no built-in implementation of `Object.getPrototypeOf` neither
       * `__proto__`, but this manually setting `__proto__` will guarantee that
       * `Object.getPrototypeOf` will work as expected.
       *
       * @type {Object}
       */
      '__proto__': ErrorCtr.prototype,
      /**
       * The toJSON method returns a string representation of the Error object.
       *
       * @return {string} A JSON stringified representation.
       */
      toJSON: toJSON
    }, {
      constructor: truePredicate,
      name: truePredicate,
      '__proto__': truePredicate,
      toJSON: truePredicate
    });
    if (hasToStringTag) {
      /**
       * name Symbol.toStringTag
       * @memberof module:error-x.Custom$$Error.prototype
       * @type {string}
       */
      defProp(
        CustomCtr.prototype,
        Symbol.toStringTag,
        '[object Error]',
        true
      );
    }
    return CustomCtr;
  }

  // Test if we can use more than just the Error constructor.
  try {
    allCtrs = create('X', SYNTAXERROR)('x') instanceof SYNTAXERROR;
  } catch (ignore) {
    allCtrs = false;
  }

  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @private
   * @constructor
   * @augments Error
   * @param {Object} [message] Need to document the properties.
   */
  ASSERTIONERROR = create('AssertionError', ERROR);

  defProps(module.exports, {
    /**
    * Indicates if the Javascript engine supports subclassing of all Error
    * types. If `true` then all are supported, if `false` (only very old
    * browsers IE6) then only `Error` is supported.
    *
    * @type boolean
    * */
    supportsAllConstructors: allCtrs,
    /**
     * Creates a custom Error constructor. Will use `Error` if argument is not
     * a valid constructor.
     *
     * @function
     * @param {string} [name='Error'] The name for the custom Error.
     * @param {Function} [ErrorCtr=Error] Error constructor to be used.
     * @return {Function} The custom Error constructor.
     */
    create: create,
    /**
     * The Error constructor creates an error object.
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    Error: create('Error', ERROR),
    /**
     * Creates an instance representing a syntax error that occurs while parsing
     * code in eval().
     *
     * @constructor
     * @augments SyntaError
     * @param {string} [message] Human-readable description of the error.
     */
    SyntaxError: create('SyntaxError', SYNTAXERROR),
    /**
     * Creates an instance representing an error that occurs when a variable or
     * parameter is not of a valid type.
     *
     * @constructor
     * @augments TypeError
     * @param {string} [message] Human-readable description of the error.
     */
    TypeError: create('TypeError', TYPEERROR),
    /**
     * Creates an instance representing an error that occurs when a numeric
     * variable or parameter is outside of its valid range.
     *
     * @constructor
     * @augments RangeError
     * @param {string} [message] Human-readable description of the error.
     */
    RangeError: create('RangeError', RANGEERROR),
    /**
     * Creates an instance representing an error that occurs regarding the
     * global function eval().
     *
     * @constructor
     * @augments EvalError
     * @param {string} [message] Human-readable description of the error.
     */
    EvalError: create('EvalError', EVALERROR),
    /**
     * Creates an instance representing an error that occurs when de-referencing
     * an invalid reference
     *
     * @constructor
     * @augments ReferenceError
     * @param {string} [message] Human-readable description of the error.
     */
    ReferenceError: create('ReferenceError', REFERENCEERROR),
    /**
     * Creates an instance representing an error that occurs when encodeURI() or
     * decodeURI() are passed invalid parameters.
     *
     * @constructor
     * @augments URIError
     * @param {string} [message] Human-readable description of the error.
     */
    URIError: create('URIError', URIERROR),
    /**
     * The InternalError object indicates an error that occurred internally in
     * the JavaScript engine. For example: "InternalError: too much recursion".
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    InternalError: create('InternalError', ERROR),
    /**
     * Error constructor for test and validation frameworks that implement the
     * standardized AssertionError specification.
     *
     * @constructor
     * @augments Error
     * @param {Object} [message] Need to document the properties.
     */
    AssertionError: ASSERTIONERROR
  });
}());

},{"circular-json":2,"define-properties":27,"define-property-x":32,"error-stack-parser":33,"es-abstract":55,"find-index-x":34,"lodash.constant":37,"lodash.isplainobject":38,"noop-x":43,"safe-to-string-x":44,"stackframe":46}],32:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"define-properties":27,"dup":12}],33:[function(require,module,exports){
(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         * @param error {Error}
         * @return Array[StackFrame]
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack && error.stack.match(FIREFOX_SAFARI_STACK_REGEXP)) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        /**
         * Separate line and column numbers from a URL-like string.
         * @param urlLike String
         * @return Array[String]
         */
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var locationParts = urlLike.replace(/[\(\)\s]/g, '').split(':');
            var lastNumber = locationParts.pop();
            var possibleNumber = locationParts[locationParts.length - 1];
            if (!isNaN(parseFloat(possibleNumber)) && isFinite(possibleNumber)) {
                var lineNumber = locationParts.pop();
                return [locationParts.join(':'), lineNumber, lastNumber];
            } else {
                return [locationParts.join(':'), lastNumber, undefined];
            }
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            return error.stack.split('\n').filter(function (line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this).map(function (line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = locationParts[0] === 'eval' ? undefined : locationParts[0];

                return new StackFrame(functionName, undefined, fileName, locationParts[1], locationParts[2], line);
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            return error.stack.split('\n').filter(function (line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this).map(function (line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame(line);
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.shift() || undefined;
                    return new StackFrame(functionName, undefined, locationParts[0], locationParts[1], locationParts[2], line);
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(match[3] || undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            return error.stack.split('\n').filter(function (line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
                    !line.match(/^Error created at/);
            }, this).map(function (line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ? undefined : argsRaw.split(',');
                return new StackFrame(functionName, args, locationParts[0], locationParts[1], locationParts[2], line);
            }, this);
        }
    };
}));


},{"stackframe":46}],34:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"assert-is-callable-x":35,"dup":18,"es-abstract/es6":48,"is-string":36}],35:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5,"es-abstract/es6":48,"is-primitive":64,"safe-to-string-x":44}],36:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"dup":26}],37:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var getter = _.constant(object);
 * getter() === object;
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;

},{}],38:[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFor = require('lodash._basefor'),
    isArguments = require('lodash.isarguments'),
    keysIn = require('lodash.keysin');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
      (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function(subValue, key) {
    result = key;
  });
  return result === undefined || hasOwnProperty.call(value, result);
}

module.exports = isPlainObject;

},{"lodash._basefor":39,"lodash.isarguments":40,"lodash.keysin":41}],39:[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseFor;

},{}],40:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) &&
    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
}

module.exports = isArguments;

},{}],41:[function(require,module,exports){
/**
 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"lodash.isarguments":40,"lodash.isarray":42}],42:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],43:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],44:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6,"es-abstract/es6":48,"is-symbol":45}],45:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],46:[function(require,module,exports){
(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stackframe', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
}(this, function () {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function StackFrame(functionName, args, fileName, lineNumber, columnNumber, source) {
        if (functionName !== undefined) {
            this.setFunctionName(functionName);
        }
        if (args !== undefined) {
            this.setArgs(args);
        }
        if (fileName !== undefined) {
            this.setFileName(fileName);
        }
        if (lineNumber !== undefined) {
            this.setLineNumber(lineNumber);
        }
        if (columnNumber !== undefined) {
            this.setColumnNumber(columnNumber);
        }
        if (source !== undefined) {
            this.setSource(source);
        }
    }

    StackFrame.prototype = {
        getFunctionName: function () {
            return this.functionName;
        },
        setFunctionName: function (v) {
            this.functionName = String(v);
        },

        getArgs: function () {
            return this.args;
        },
        setArgs: function (v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        // NOTE: Property name may be misleading as it includes the path,
        // but it somewhat mirrors V8's JavaScriptStackTraceApi
        // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi and Gecko's
        // http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIException.idl#14
        getFileName: function () {
            return this.fileName;
        },
        setFileName: function (v) {
            this.fileName = String(v);
        },

        getLineNumber: function () {
            return this.lineNumber;
        },
        setLineNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Line Number must be a Number');
            }
            this.lineNumber = Number(v);
        },

        getColumnNumber: function () {
            return this.columnNumber;
        },
        setColumnNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Column Number must be a Number');
            }
            this.columnNumber = Number(v);
        },

        getSource: function () {
            return this.source;
        },
        setSource: function (v) {
            this.source = String(v);
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    return StackFrame;
}));

},{}],47:[function(require,module,exports){
'use strict';

var $isNaN = Number.isNaN || function (a) { return a !== a; };
var $isFinite = require('./helpers/isFinite');

var sign = require('./helpers/sign');
var mod = require('./helpers/mod');

var IsCallable = require('is-callable');
var toPrimitive = require('es-to-primitive/es5');

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
        return $isNaN(x) && $isNaN(y);
	}
};

module.exports = ES5;

},{"./helpers/isFinite":51,"./helpers/mod":53,"./helpers/sign":54,"es-to-primitive/es5":56,"is-callable":62}],48:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = Number.isNaN || function (a) { return a !== a; };
var $isFinite = require('./helpers/isFinite');
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = require('./helpers/assign');
var sign = require('./helpers/sign');
var mod = require('./helpers/mod');
var isPrimitive = require('./helpers/isPrimitive');
var toPrimitive = require('es-to-primitive/es6');
var parseInteger = parseInt;
var bind = require('function-bind');
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[\-\+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = require('./es5');

var hasRegExpMatcher = require('is-regex');

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return this.IsCallable(argument); // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = RegExp[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;

},{"./es5":47,"./helpers/assign":50,"./helpers/isFinite":51,"./helpers/isPrimitive":52,"./helpers/mod":53,"./helpers/sign":54,"es-to-primitive/es6":57,"function-bind":61,"is-regex":63}],49:[function(require,module,exports){
'use strict';

var ES6 = require('./es6');
var assign = require('./helpers/assign');

var ES7 = assign(ES6, {
	// https://github.com/tc39/ecma262/pull/60
	SameValueNonNumber: function SameValueNonNumber(x, y) {
		if (typeof x === 'number' || typeof x !== typeof y) {
			throw new TypeError('SameValueNonNumber requires two non-number values of the same type.');
		}
		return this.SameValue(x, y);
	}
});

module.exports = ES7;

},{"./es6":48,"./helpers/assign":50}],50:[function(require,module,exports){
var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

},{}],51:[function(require,module,exports){
var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

},{}],52:[function(require,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],53:[function(require,module,exports){
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

},{}],54:[function(require,module,exports){
module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};

},{}],55:[function(require,module,exports){
'use strict';

var assign = require('./helpers/assign');

var ES5 = require('./es5');
var ES6 = require('./es6');
var ES7 = require('./es7');

var ES = {
	ES5: ES5,
	ES6: ES6,
	ES7: ES7
};
assign(ES, ES5);
delete ES.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(ES, ES6);

module.exports = ES;

},{"./es5":47,"./es6":48,"./es7":49,"./helpers/assign":50}],56:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isPrimitive = require('./helpers/isPrimitive');

var isCallable = require('is-callable');

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		if (!hint) {
			hint = toStr.call(O) === '[object Date]' ? String : Number;
		}

		if (hint === String || hint === Number) {
			var methods = hint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	if (arguments.length < 2) {
		PreferredType = toStr.call(input) === '[object Date]' ? String : Number;
	}
	if (PreferredType === String) {
		return String(input);
	} else if (PreferredType === Number) {
		return Number(input);
	} else {
		throw new TypeError('invalid PreferredType supplied');
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

},{"./helpers/isPrimitive":58,"is-callable":62}],57:[function(require,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = require('./helpers/isPrimitive');
var isCallable = require('is-callable');
var isDate = require('is-date-object');
var isSymbol = require('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (O == null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			throw new TypeError('Symbol.toPrimitive not supported yet');
			// exoticToPrim = this.GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":58,"is-callable":62,"is-date-object":59,"is-symbol":60}],58:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"dup":52}],59:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],60:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],61:[function(require,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


},{}],62:[function(require,module,exports){
'use strict';

var constructorRegex = /\s*class /;
var isNonES6ClassFn = function isNonES6ClassFn(value) {
	try {
		return !constructorRegex.test(value);
	} catch (e) {
		return false; // not a function
	}
};

var fnToStr = Function.prototype.toString;
var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (constructorRegex.test(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (!isNonES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],63:[function(require,module,exports){
'use strict';

var regexExec = RegExp.prototype.exec;
var tryRegexExec = function tryRegexExec(value) {
	try {
		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryRegexExec(value) : toStr.call(value) === regexClass;
};

},{}],64:[function(require,module,exports){
/*!
 * is-primitive <https://github.com/jonschlinkert/is-primitive>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// see http://jsperf.com/testing-value-is-primitive/7
module.exports = function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}]},{},[1])(1)
});