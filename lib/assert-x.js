/**
 * @file {@link http://xotic750.github.io/assert-x/ assert-x}. A Javascript assertion library..
 * @version 0.0.20
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

(function (globalThis) {
    'use strict';

    function factory(utilx) {
        /**
         * @namespace assertx
         */
        var assertx = {},
            maxMessageLength = 128,
            CustomError = utilx.customError('AssertionError', maxMessageLength);

        utilx.objectDefineProperty(assertx, 'AssertionError', {
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
                this.actual = opts.actual;
                this.expected = opts.expected;
                this.operator = opts.operator;
            },
            enumerable: false,
            writable: true,
            configurable: true
        });

        utilx.inherits(assertx.AssertionError, CustomError);

        utilx.objectDefineProperties(assertx.AssertionError.prototype, {
            toString: {
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
                },
                enumerable: false,
                writable: true,
                configurable: true
            }
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
                storeState = utilx.normaliseErrorIEToString.state();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToString.on();
                }

                val = actual.toString();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToString.off();
                }

                return expected.test(val);
            }

            if (utilx.objectInstanceOf(actual, expected)) {
                return true;
            }

            if (utilx.isFunction(expected)) {
                storeState = utilx.normaliseErrorIEToString.state();
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToString.on();
                }
                /*global console */
                console.log('# storeState: ' + storeState);
                console.log('# BEFORE SHOULD BE TRUE IE<9: ' + utilx.normaliseErrorIEToString.state());
                console.log('# BEFORE STRING: ' + actual.toString());
                val = expected.call({}, actual);
                if (utilx.isFalse(storeState)) {
                    utilx.normaliseErrorIEToString.off();
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
            fail: {
                value: function (actual, expected, message, stackStartFunction) {
                    throwAssertionError(actual, expected, message, 'fail', stackStartFunction);
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

            /**
             * Tests if value is truthy, it is equivalent to assert.equal(!!value, true, message);
             * @memberOf assertx
             * @function
             * @param {*} value
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            ok: {
                value: function (value, message, stackStartFunction) {
                    var pass = utilx.toBoolean(value);

                    if (utilx.isFalse(pass)) {
                        throwAssertionError(pass, true, message, 'ok', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

            /**
             * Tests if value is truthy, it is equivalent to assert.equal(!value, true, message);
             * @memberOf assertx
             * @function
             * @param {*} value
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notOk: {
                value: function (value, message, stackStartFunction) {
                    var pass = utilx.toBoolean(value);

                    if (utilx.isTrue(pass)) {
                        throwAssertionError(pass, true, message, 'notOk', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            equal: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.notEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '==', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            notEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.equal(actual, expected)) {
                        throwAssertionError(actual, expected, message, '!=', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            deepEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.deepEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'deepEqual', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            notDeepEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.deepEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, 'notDeepEqual', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            deepStrictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.deepEqual(actual, expected, {strict: true})) {
                        throwAssertionError(actual, expected, message, 'deepStrictEqual', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            notDeepStrictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.deepEqual(actual, expected, {strict: true})) {
                        throwAssertionError(actual, expected, message, 'notDeepStrictEqual', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            strictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.notStrictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '===', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            notStrictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.strictEqual(actual, expected)) {
                        throwAssertionError(actual, expected, message, '!==', stackStartFunction);
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

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
            throws: {
                value: function (block, error, message, stackStartFunction) {
                    throws(true, block, error, message, stackStartFunction);
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

            /**
             * Expects block not to throw an error, see assert.throws for details.
             * @memberOf assertx
             * @function
             * @param {function} block
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            doesNotThrow: {
                value: function (block, message, stackStartFunction) {
                    throws(false, block, message, stackStartFunction);
                },
                enumerable: false,
                writable: true,
                configurable: true
            },

            /**
             * Tests if value is not a falsy value, throws if it is a truthy value.
             * Useful when testing the first argument, error in callbacks.
             * @memberOf assertx
             * @function
             * @param {*} err
             * @return {undefined}
             */
            ifError: {
                value: function (err) {
                    if (err) {
                        throw err;
                    }
                },
                enumerable: false,
                writable: true,
                configurable: true
            }
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

    var publicAssert;

    /*global module, define */
    if (typeof module === 'object' && null !== module &&
            typeof module.exports === 'object' && null !== module.exports) {

        publicAssert = factory(require('util-x'));
        publicAssert.factory = function (deep) {
            var pa;

            if (true === deep) {
                pa = factory(require('util-x').factory());
            } else {
                pa = factory(require('util-x'));
            }

            pa.factory = publicAssert.factory;

            return pa;
        };

        module.exports = publicAssert;
    } else if (typeof define === 'function' && typeof define.amd === 'object' && null !== define.amd) {
        define(['util-x'], function (utilx) {
            publicAssert = factory(utilx);
            publicAssert.factory = function (deep) {
                var pa;

                if (true === deep) {
                    pa = factory(utilx.factory());
                } else {
                    pa = factory(utilx);
                }

                pa.factory = publicAssert.factory;

                return pa;
            };

            return publicAssert;
        });
    } else {
        publicAssert = factory(globalThis.utilx);
        publicAssert.factory = function (deep) {
            var pa;

            if (true === deep) {
                pa = factory(globalThis.utilx.factory());
            } else {
                pa = factory(globalThis.utilx);
            }

            pa.factory = publicAssert.factory;

            return pa;
        };

        globalThis.assertx = publicAssert;
    }
}(this));
