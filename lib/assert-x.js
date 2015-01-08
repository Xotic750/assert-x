/**
 * @file {@link http://xotic750.github.io/assert-x/ assert-x}. A Javascript assertion library..
 * @version 0.0.28
 * @author Graham Fairweather <xotic750@gmail.com>
 * @copyright Copyright (c) 2013 Graham Fairweather
 * @license {@link <http://www.gnu.org/licenses/gpl-3.0.html> GPL3}
 * @module assert-x
 * @requires util-x
 */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*global module, define, require */

(function (globalThis, Undefined) {
    'use strict';

    var maxMessageLength = 128,
        notEnumerableProperties = {
            enumerable: false,
            writable: true,
            configurable: true
        },
        factoryString = 'factory',
        publicAssert;

    function factory(utilx) {
        /**
         * @namespace assertx
         */
        var assertx = {},
            CustomError = utilx.customError('AssertionError', maxMessageLength);

        utilx.Object.defineProperty(assertx, 'AssertionError', utilx.Object.assign({
            /**
             * The AssertionError constructor.
             * @name AssertionError
             * @memberOf assertx
             * @constructor
             * @augments CustomError
             * @param {object} opts
             * @return {undefined}
             */
            value: function (opts) {
                if (!utilx.Object.isPlainObject(opts)) {
                    opts = {};
                }

                if (!utilx.String.isString(opts.message)) {
                    opts.message = '';
                }

                if (!utilx.String.isString(opts.operator)) {
                    opts.operator = '';
                }

                if (!utilx.Function.isFunction(opts.stackStartFunction)) {
                    opts.stackStartFunction = assertx.AssertionError;
                }

                CustomError.call(this, opts.message, opts.stackStartFunction);
                utilx.Object.defineProperties(this, {
                    actual: utilx.Object.assign({
                        value: opts.actual
                    }, notEnumerableProperties),

                    expected: utilx.Object.assign({
                        value: opts.expected
                    }, notEnumerableProperties),

                    operator: utilx.Object.assign({
                        value: opts.operator
                    }, notEnumerableProperties)
                });
            }
        }, notEnumerableProperties));

        utilx.Function.inherits(assertx.AssertionError, CustomError);

        utilx.Object.defineProperties(assertx.AssertionError.prototype, {
            toString: utilx.Object.assign({
                value: function () {
                    var theString;

                    if (utilx.String.isString(this.message) && !utilx.String.isEmpty(this.message)) {
                        theString = this.name + ': ' + utilx.String.truncate(this.message, maxMessageLength);
                    } else if (utilx.Object.instanceOf(this, assertx.AssertionError)) {
                        theString = this.name + ': ';
                        theString += utilx.String.truncate(utilx.JSON.stringify(this.actual,
                                                                utilx.customErrorReplacer), maxMessageLength) + ' ';
                        theString += this.operator + ' ';
                        theString += utilx.String.truncate(utilx.JSON.stringify(this.expected,
                                                                utilx.customErrorReplacer), maxMessageLength);
                    }

                    return theString;
                }
            }, notEnumerableProperties)
        });

        /**
         * Returns whether an exception is expected. Used by throws.
         * @private
         * @function
         * @param {*} actual
         * @param {*} expected
         * @return {boolean}
         */
        function expectedException(actual, expected) {
            var storeState,
                val;

            if (utilx.Object.isUndefinedOrNull(actual) || utilx.Object.isUndefinedOrNull(expected)) {
                return false;
            }

            if (utilx.RegExp.isRegExp(expected) && utilx.Object.instanceOf(actual, Error)) {
                storeState = utilx.normaliseErrorIEToStringState();
                if (utilx.Boolean.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOn();
                }

                val = actual.toString();
                if (utilx.Boolean.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOff();
                }

                return expected.test(val);
            }

            if (utilx.Object.instanceOf(actual, expected)) {
                return true;
            }

            if (utilx.Function.isFunction(expected)) {
                storeState = utilx.normaliseErrorIEToStringState();
                if (utilx.Boolean.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOn();
                }

                val = expected.call({}, actual);
                if (utilx.Boolean.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOff();
                }

                if (utilx.Boolean.isTrue(val)) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Throws an exception that displays the values for actual and expected separated by the provided operator.
         * @private
         * @function
         * @param {*} actual
         * @param {*} expected
         * @param {string} message
         * @param {string} operator
         * @param {function} [stackStartFunction]
         * @return {undefined}
         */
        function throwAssertionError(actual, expected, message, operator, stackStartFunction) {
            if (!utilx.Function.isFunction(stackStartFunction)) {
                stackStartFunction = throwAssertionError;
            }

            throw new assertx.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator,
                stackStartFunction: stackStartFunction
            });
        }

        /**
         * Returns whether an exception is expected. Used by assertx.throws and assertx.doesNotThrow.
         * @private
         * @function
         * @param {boolean} shouldThrow
         * @param {function} block
         * @param {*} expected
         * @param {string} [message]
         * @param {function} [stackStartFunction]
         * @return {undefined}
         */
        function throws(shouldThrow, block, expected, message, stackStartFunction) {
            var wasExceptionExpected,
                actual;

            if (!utilx.Function.isFunction(stackStartFunction)) {
                if (utilx.Function.isFunction(message)) {
                    stackStartFunction = message;
                    message = Undefined;
                } else {
                    stackStartFunction = throws;
                }
            }

            if ((!utilx.String.isString(message) || utilx.String.isEmpty(message)) && utilx.String.isString(expected)) {
                message = expected;
                expected = null;
            }

            try {
                block();
            } catch (e) {
                actual = e;
            }

            wasExceptionExpected = expectedException(actual, expected);
            message = (expected && utilx.String.isString(expected.name) && utilx.String.isEmpty(expected.name) ?
                       ' (' + expected.name + ').' :
                       '.') + (message ? ' ' + message : '.');

            if (utilx.Boolean.isTrue(shouldThrow) && !actual) {
                throwAssertionError(actual, expected, 'Missing expected exception' + message,
                                    Undefined, stackStartFunction);
            }

            if (utilx.Boolean.isFalse(shouldThrow) && utilx.Boolean.isTrue(wasExceptionExpected)) {
                throwAssertionError(actual, expected, 'Got unwanted exception' + message,
                                    Undefined, stackStartFunction);
            }

            if ((utilx.Boolean.isTrue(shouldThrow) &&
                 actual &&
                 expected &&
                 utilx.Boolean.isFalse(wasExceptionExpected)) ||
                    (utilx.Boolean.isFalse(shouldThrow) && actual)) {

                throw actual;
            }
        }

        utilx.Object.defineProperties(assertx, {
            /**
             * Throws an exception that displays the values for actual and expected.
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            fail: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    throwAssertionError(actual, expected, message, 'fail', stackStartFunction);
                }
            }, notEnumerableProperties),

            /**
             * Tests if value is truthy, it is equivalent to assert.equal(!!value, true, message);
             * @memberOf assertx
             * @function
             * @param {*} value
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            ok: utilx.Object.assign({
                value: function (value, message, stackStartFunction) {
                    var pass = !!value;

                    if (!pass) {
                        throwAssertionError(pass, true, message, 'ok', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests if value is truthy, it is equivalent to assert.equal(!value, true, message);
             * @memberOf assertx
             * @function
             * @param {*} value
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notOk: utilx.Object.assign({
                value: function (value, message, stackStartFunction) {
                    var pass = !!value;

                    if (pass) {
                        throwAssertionError(pass, true, message, 'notOk', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests shallow, coercive equality with the equal comparison operator ( == ).
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            equal: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.notEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '==', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.equal(actual, expected)) {
                        throwAssertionError(actual, expected, message, '!=', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests for deep equality, coercive equality with the equal comparison operator ( == ) and equivalent.
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            deepEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.Object.deepEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'deepEqual', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests for deep inequality.
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notDeepEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.deepEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'notDeepEqual', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests for deep strict equality, equality with the strict equal comparison operator
             * ( === ) and equivalent.
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            deepStrictEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.Object.deepStrictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'deepStrictEqual', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests for deep strict inequality.
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notDeepStrictEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.deepStrictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'notDeepStrictEqual', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests strict equality, as determined by the strict equality operator ( === ).
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            strictEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.notStrictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '===', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Tests strict non-equality, as determined by the strict not equal operator ( !== ).
             * @memberOf assertx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {string} operator
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notStrictEqual: utilx.Object.assign({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.Object.strictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '!==', stackStartFunction);
                    }
                }
            }, notEnumerableProperties),

            /**
             * Expects block to throw an error. error can be constructor, regexp or validation function.
             * @memberOf assertx
             * @function
             * @param {function} block
             * @param {constructor|regexp|function} error
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            throws: utilx.Object.assign({
                value: function (block, error, message, stackStartFunction) {
                    throws(true, block, error, message, stackStartFunction);
                }
            }, notEnumerableProperties),

            /**
             * Expects block not to throw an error, see assert.throws for details.
             * @memberOf assertx
             * @function
             * @param {function} block
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            doesNotThrow: utilx.Object.assign({
                value: function (block, message, stackStartFunction) {
                    throws(false, block, message, stackStartFunction);
                }
            }, notEnumerableProperties),

            /**
             * Tests if value is not a falsy value, throws if it is a truthy value.
             * Useful when testing the first argument, error in callbacks.
             * @memberOf assertx
             * @function
             * @param {*} err
             * @return {undefined}
             */
            ifError: utilx.Object.assign({
                value: function (err) {
                    if (err) {
                        throw err;
                    }
                }
            }, notEnumerableProperties),

            /**
             * The Javascript library that assert-x is built on for cross environment compatability.
             * @memberOf assertx
             * @type {object}
             */
            utilx: utilx.Object.assign({
                value: utilx
            }, notEnumerableProperties)
        });

        return assertx;
    }

    /*
     *
     * UMD
     *
     */

    if (typeof globalThis !== 'object' || null === globalThis) {
        throw new TypeError('Invalid global context');
    }

    /*global module, define */
    if (typeof module === 'object' && null !== module &&
            typeof module.exports === 'object' && null !== module.exports) {

        publicAssert = factory(require('util-x'));
        publicAssert.utilx.Object.defineProperty(publicAssert, factoryString, publicAssert.utilx.Object.assign({
            value: function (deep) {
                var pa;

                if (publicAssert.utilx.Boolean.isTrue(deep)) {
                    pa = factory(require('util-x')[factoryString]());
                } else {
                    pa = factory(require('util-x'));
                }

                publicAssert.utilx.Object.defineProperty(pa, factoryString, publicAssert.utilx.Object.assign({
                    value: publicAssert[factoryString]
                }, notEnumerableProperties));

                return pa;
            }
        }, notEnumerableProperties));

        publicAssert.utilx.Object.defineProperty(module, 'exports', publicAssert.utilx.Object.assign({
            value: publicAssert
        }, notEnumerableProperties));
    } else if (typeof define === 'function' && typeof define.amd === 'object' && null !== define.amd) {
        require.config({
            paths: {
                'util-x': '//rawgit.com/Xotic750/util-x/master/lib/util-x'
            }
        });

        define(['util-x'], function (utilx) {
            publicAssert = factory(utilx);
            publicAssert.utilx.Object.defineProperty(publicAssert, factoryString, publicAssert.utilx.Object.assign({
                value: function (deep) {
                    var pa;

                    if (publicAssert.utilx.Boolean.isTrue(deep)) {
                        pa = factory(utilx[factoryString]());
                    } else {
                        pa = factory(utilx);
                    }

                    publicAssert.utilx.Object.defineProperty(pa, factoryString, publicAssert.utilx.Object.assign({
                        value: publicAssert[factoryString]
                    }, notEnumerableProperties));

                    return pa;
                }
            }, notEnumerableProperties));

            return publicAssert;
        });
    } else {
        publicAssert = factory(globalThis.utilx);
        publicAssert.utilx.Object.defineProperty(publicAssert, factoryString, publicAssert.utilx.Object.assign({
            value: function (deep) {
                var pa;

                if (publicAssert.utilx.Boolean.isTrue(deep)) {
                    pa = factory(globalThis.utilx[factoryString]());
                } else {
                    pa = factory(globalThis.utilx);
                }

                publicAssert.utilx.Object.defineProperty(pa, factoryString, publicAssert.utilx.Object.assign({
                    value: publicAssert[factoryString]
                }, notEnumerableProperties));

                return pa;
            }
        }, notEnumerableProperties));

        publicAssert.utilx.Object.defineProperty(globalThis, 'assertx', publicAssert.utilx.Object.assign({
            value: publicAssert
        }, notEnumerableProperties));
    }
}(this));
