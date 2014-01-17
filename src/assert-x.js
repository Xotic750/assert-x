/**
 * @file {@link @@HOMEPAGE @@MODULE}. @@DESCRIPTION.
 * @version @@VERSION
 * @author @@AUTHORNAME <@@AUTHOREMAIL>
 * @copyright @@COPYRIGHT @@AUTHORNAME
 * @license {@link <@@LICLINK> @@LICENSE}
 * @module @@MODULE
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

(function (globalThis) {
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

        utilx.objectDefineProperty(assertx, 'AssertionError', utilx.extend({
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
                if (!utilx.isPlainObject(opts)) {
                    opts = {};
                }

                if (!utilx.isString(opts.message)) {
                    opts.message = '';
                }

                if (!utilx.isString(opts.operator)) {
                    opts.operator = '';
                }

                if (!utilx.isFunction(opts.stackStartFunction)) {
                    opts.stackStartFunction = assertx.AssertionError;
                }

                CustomError.call(this, opts.message, opts.stackStartFunction);
                utilx.objectDefineProperties(this, {
                    actual: utilx.extend({
                        value: opts.actual
                    }, notEnumerableProperties),

                    expected: utilx.extend({
                        value: opts.expected
                    }, notEnumerableProperties),

                    operator: utilx.extend({
                        value: opts.operator
                    }, notEnumerableProperties)
                });
            }
        }, notEnumerableProperties));

        utilx.inherits(assertx.AssertionError, CustomError);

        utilx.objectDefineProperties(assertx.AssertionError.prototype, {
            toString: utilx.extend({
                value: function () {
                    var theString;

                    if (utilx.isString(this.message) && !utilx.isEmptyString(this.message)) {
                        theString = this.name + ': ' + utilx.stringTruncate(this.message, maxMessageLength);
                    } else if (utilx.objectInstanceOf(this, assertx.AssertionError)) {
                        theString = this.name + ': ';
                        theString += utilx.stringTruncate(utilx.jsonStringify(this.actual,
                                                                utilx.customErrorReplacer), maxMessageLength) + ' ';
                        theString += this.operator + ' ';
                        theString += utilx.stringTruncate(utilx.jsonStringify(this.expected,
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

            if (utilx.isUndefinedOrNull(actual) || utilx.isUndefinedOrNull(expected)) {
                return false;
            }

            if (utilx.isRegExp(expected) && utilx.objectInstanceOf(actual, Error)) {
                storeState = utilx.normaliseErrorIEToStringState();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOn();
                }

                val = actual.toString();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOff();
                }

                return expected.test(val);
            }

            if (utilx.objectInstanceOf(actual, expected)) {
                return true;
            }

            if (utilx.isFunction(expected)) {
                storeState = utilx.normaliseErrorIEToStringState();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOn();
                }

                val = expected.call({}, actual);
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToStringOff();
                }

                if (utilx.isTrue(val)) {
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
            if (!utilx.isFunction(stackStartFunction)) {
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

            if (!utilx.isFunction(stackStartFunction)) {
                if (utilx.isFunction(message)) {
                    stackStartFunction = message;
                    message = utilx.privateUndefined;
                } else {
                    stackStartFunction = throws;
                }
            }

            if ((!utilx.isString(message) || utilx.isEmptyString(message)) && utilx.isString(expected)) {
                message = expected;
                expected = null;
            }

            try {
                block();
            } catch (e) {
                actual = e;
            }

            wasExceptionExpected = expectedException(actual, expected);
            message = (expected && utilx.isString(expected.name) && utilx.isEmptyString(expected.name) ?
                       ' (' + expected.name + ').' :
                       '.') + (message ? ' ' + message : '.');

            if (utilx.isTrue(shouldThrow) && !actual) {
                throwAssertionError(actual, expected, 'Missing expected exception' + message,
                                    utilx.privateUndefined, stackStartFunction);
            }

            if (utilx.isFalse(shouldThrow) && utilx.isTrue(wasExceptionExpected)) {
                throwAssertionError(actual, expected, 'Got unwanted exception' + message,
                                    utilx.privateUndefined, stackStartFunction);
            }

            if ((utilx.isTrue(shouldThrow) && actual && expected && utilx.isFalse(wasExceptionExpected)) ||
                    (utilx.isFalse(shouldThrow) && actual)) {

                throw actual;
            }
        }

        utilx.objectDefineProperties(assertx, {
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
            fail: utilx.extend({
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
            ok: utilx.extend({
                value: function (value, message, stackStartFunction) {
                    var pass = utilx.toBoolean(value);

                    if (utilx.isFalse(pass)) {
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
            notOk: utilx.extend({
                value: function (value, message, stackStartFunction) {
                    var pass = utilx.toBoolean(value);

                    if (utilx.isTrue(pass)) {
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
            equal: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.notEqual(actual, expected)) {
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
            notEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.equal(actual, expected)) {
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
            deepEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.deepEqual(actual, expected)) {
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
            notDeepEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.deepEqual(actual, expected)) {
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
            deepStrictEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.deepStrictEqual(actual, expected)) {
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
            notDeepStrictEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.deepStrictEqual(actual, expected)) {
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
            strictEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.notStrictEqual(actual, expected)) {
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
            notStrictEqual: utilx.extend({
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.strictEqual(actual, expected)) {
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
            throws: utilx.extend({
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
            doesNotThrow: utilx.extend({
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
            ifError: utilx.extend({
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
            utilx: utilx.extend({
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
        publicAssert.utilx.objectDefineProperty(publicAssert, factoryString, publicAssert.utilx.extend({
            value: function (deep) {
                var pa;

                if (publicAssert.utilx.isTrue(deep)) {
                    pa = factory(require('util-x')[factoryString]());
                } else {
                    pa = factory(require('util-x'));
                }

                publicAssert.utilx.objectDefineProperty(pa, factoryString, publicAssert.utilx.extend({
                    value: publicAssert[factoryString]
                }, notEnumerableProperties));

                return pa;
            }
        }, notEnumerableProperties));

        publicAssert.utilx.objectDefineProperty(module, 'exports', publicAssert.utilx.extend({
            value: publicAssert
        }, notEnumerableProperties));
    } else if (typeof define === 'function' && typeof define.amd === 'object' && null !== define.amd) {
        require.config({
            paths: {
                'util-x': '//raw.github.com/Xotic750/util-x/master/lib/util-x'
            }
        });

        define(['util-x'], function (utilx) {
            publicAssert = factory(utilx);
            publicAssert.utilx.objectDefineProperty(publicAssert, factoryString, publicAssert.utilx.extend({
                value: function (deep) {
                    var pa;

                    if (publicAssert.utilx.isTrue(deep)) {
                        pa = factory(utilx[factoryString]());
                    } else {
                        pa = factory(utilx);
                    }

                    publicAssert.utilx.objectDefineProperty(pa, factoryString, publicAssert.utilx.extend({
                        value: publicAssert[factoryString]
                    }, notEnumerableProperties));

                    return pa;
                }
            }, notEnumerableProperties));

            return publicAssert;
        });
    } else {
        publicAssert = factory(globalThis.utilx);
        publicAssert.utilx.objectDefineProperty(publicAssert, factoryString, publicAssert.utilx.extend({
            value: function (deep) {
                var pa;

                if (publicAssert.utilx.isTrue(deep)) {
                    pa = factory(globalThis.utilx[factoryString]());
                } else {
                    pa = factory(globalThis.utilx);
                }

                publicAssert.utilx.objectDefineProperty(pa, factoryString, publicAssert.utilx.extend({
                    value: publicAssert[factoryString]
                }, notEnumerableProperties));

                return pa;
            }
        }, notEnumerableProperties));

        publicAssert.utilx.objectDefineProperty(globalThis, 'assertx', publicAssert.utilx.extend({
            value: publicAssert
        }, notEnumerableProperties));
    }
}(this));
