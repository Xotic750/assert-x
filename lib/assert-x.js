/**
 * @file {@link http://xotic750.github.io/assert-x/ AstroDate}. A Javascript assertion library..
 * @version 0.0.1
 * @author Graham Fairweather <xotic750@gmail.com>
 * @copyright Copyright (c) 2013 Graham Fairweather
 * @license {@link <http://www.gnu.org/licenses/gpl-3.0.html> GPL3}
 * @module assert-x
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
         * The AssertionError is defined in assert.
         * @private
         * @constructor
         * @augments Error
         * @param {object} opts
         * @return {undefined}
         */
        function AssertionError(opts) {
            var err,
                stk;

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
                opts.stackStartFunction = AssertionError;
            }

            utilx.objectDefineProperties(this, {
                message: {
                    value: opts.message,
                    writable: true
                },

                actual: {
                    value: opts.actual,
                    writable: true
                },

                expected: {
                    value: opts.expected,
                    writable: true
                },

                operator: {
                    value: opts.operator,
                    writable: true
                },

                stackStartFunction: {
                    value: opts.stackStartFunction,
                    writable: true
                }
            });

            if (utilx.isFunction(Error.captureStackTrace)) {
                Error.captureStackTrace(this, this.stackStartFunction);
            } else {
                err = Error.call(this, this.message);
                err.name = this.name;
                this.message = err.message;
                if (utilx.isString(err.stack)) {
                    stk = err.stack;
                } else if (utilx.isString(err.stacktrace)) {
                    stk = err.stacktrace;
                } else {
                    stk = '(unavailable)';
                }

                utilx.objectDefineProperty(this, 'stack', {
                    value: stk,
                    writable: true
                });
            }
        }

        utilx.objectDefineProperty(AssertionError, 'prototype', {
            value: utilx.objectCreate(Error.prototype)
        });

        /**
         * Transforms values and properties encountered while stringifying; used by AssertionError.toString
         * @private
         * @function
         * @param {*} key
         * @param {*} value
         * @return {undefined}
         */
        function replacer(key, value) {
            /*jslint unparam: true */
            /*jshint unused: true */
            if (utilx.isUndefined(value)) {
                return utilx.anyToString(value);
            }

            if (utilx.isNumber(value) && (isNaN(value) || !isFinite(value))) {
                return value.toString();
            }

            if (utilx.isFunction(value) || utilx.isRegExp(value)) {
                return value.toString();
            }

            return value;
        }

        /**
         * Truncates a long string to the length specified by n; used by AssertionError.toString
         * @private
         * @function
         * @param {string} s
         * @param {number} n
         * @return {string}
         */
        function truncate(s, n) {
            var theString;

            if (utilx.isString(s)) {
                if (utilx.lt(s.length, n)) {
                    theString = s;
                } else {
                    theString = s.slice(0, n);
                }
            } else {
                theString = s;
            }

            return theString;
        }

        utilx.objectDefineProperties(AssertionError.prototype, {
            /**
             * Reset to the correct constructor.
             * @private
             * @type {function}
             */
            constructor: {
                value: AssertionError
            },

            /**
             * The name of the class.
             * @private
             * @value {string}
             */
            name: {
                value: 'AssertionError'
            },

            /**
             * Returns a string representing the object.
             * @private
             * @function
             * @return {string}
             */
            toString: {
                value: function () {
                    var theString;

                    if (utilx.isString(this.message) && !utilx.isEmptyString(this.message)) {
                        theString = this.name + ': ' + this.message;
                    } else {
                        theString = [
                            this.name + ':',
                            truncate(JSON.stringify(this.actual, replacer), 128),
                            this.operator,
                            truncate(JSON.stringify(this.expected, replacer), 128)
                        ].join(' ');
                    }

                    return theString;
                }
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
            if (utilx.isUndefinedOrNull(actual) || utilx.isUndefinedOrNull(expected)) {
                return false;
            }

            if (utilx.isRegExp(expected)) {
                return expected.test(actual);
            }

            if (utilx.objectInstanceOf(actual, expected)) {
                return true;
            }

            if (utilx.isTrue(expected.call({}, actual))) {
                return true;
            }

            return false;
        }

        /**
         * @namespace assertx
         */

        /**
         * Throws an exception that displays the values for actual and expected separated by the provided operator.
         * @memberOf utilx
         * @function
         * @param {*} actual
         * @param {*} expected
         * @param {string} message
         * @param {string} operator
         * @param {function} [stackStartFunction]
         * @return {undefined}
         */
        function assertx(actual, expected, message, operator, stackStartFunction) {
            if (!utilx.isFunction(stackStartFunction)) {
                stackStartFunction = assertx;
            }

            throw new AssertionError({
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
         * @return {undefined}
         */
        function throws(shouldThrow, block, expected, message) {
            var wasExpectedException,
                actual;

            if (utilx.isString(expected)) {
                message = expected;
                expected = null;
            }

            try {
                block();
            } catch (e) {
                actual = e;
            }

            wasExpectedException = expectedException(actual, expected);
            message = (expected && utilx.isString(expected.name) && utilx.isEmptyString(expected.name) ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');
            if (utilx.isTrue(shouldThrow) && !actual) {
                assertx(actual, expected, 'Missing expected exception' + message, utilx.privateUndefined, throws);
            }

            if (utilx.isFalse(shouldThrow) && utilx.isTrue(wasExpectedException)) {
                assertx(actual, expected, 'Got unwanted exception' + message, utilx.privateUndefined, throws);
            }

            if ((utilx.isTrue(shouldThrow) && actual && expected && utilx.isFalse(wasExpectedException)) || (utilx.isFalse(shouldThrow) && actual)) {
                throw actual;
            }
        }

        utilx.objectDefineProperties(assertx, {
            /**
             * The AssertionError is defined in assert.
             * @memberOf utilx
             * @function
             * @param {object} opts
             * @return {undefined}
             */
            AssertionError: {
                value: AssertionError
            },

            /**
             * Throws an exception that displays the values for actual and expected.
             * @memberOf utilx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            fail: {
                value: function (actual, expected, message, stackStartFunction) {
                    assertx(actual, expected, message, 'fail', stackStartFunction);
                }
            },

            /**
             * Tests if value is truthy, it is equivalent to assert.equal(!!value, true, message);
             * @memberOf utilx
             * @function
             * @param {*} value
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            ok: {
                value: function (value, message, stackStartFunction) {
                    var pass = Boolean(value);

                    if (utilx.isFalse(pass)) {
                        assertx(pass, true, message, 'ok', stackStartFunction);
                    }
                }
            },

            /**
             * Tests shallow, coercive equality with the equal comparison operator ( == ).
             * @memberOf utilx
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
                        assertx(actual, expected, message, '==', stackStartFunction);
                    }
                }
            },

            /**
             * Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
             * @memberOf utilx
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
                        assertx(actual, expected, message, '!=', stackStartFunction);
                    }
                }
            },

            /**
             * Tests for deep equality, coercive equality with the equal comparison operator ( == ) and equivalent.
             * @memberOf utilx
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
                        assertx(actual, expected, message, 'deepEqual', stackStartFunction);
                    }
                }
            },

            /**
             * Tests for deep inequality.
             * @memberOf utilx
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
                        assertx(actual, expected, message, 'notDeepEqual', stackStartFunction);
                    }
                }
            },

            /**
             * Tests for deep strict equality, equality with the strict equal comparison operator ( === ) and equivalent.
             * @memberOf utilx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            deepStrictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (!utilx.deepEqual(actual, expected, {
                        strict: true
                    })) {
                        assertx(actual, expected, message, 'deepStrictEqual', stackStartFunction);
                    }
                }
            },

            /**
             * Tests for deep strict inequality.
             * @memberOf utilx
             * @function
             * @param {*} actual
             * @param {*} expected
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            notDeepStrictEqual: {
                value: function (actual, expected, message, stackStartFunction) {
                    if (utilx.deepEqual(actual, expected, {
                        strict: true
                    })) {
                        assertx(actual, expected, message, 'notDeepStrictEqual', stackStartFunction);
                    }
                }
            },

            /**
             * Tests strict equality, as determined by the strict equality operator ( === ).
             * @memberOf utilx
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
                        assertx(actual, expected, message, '===', stackStartFunction);
                    }
                }
            },

            /**
             * Tests strict non-equality, as determined by the strict not equal operator ( !== ).
             * @memberOf utilx
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
                        assertx(actual, expected, message, '!==', stackStartFunction);
                    }
                }
            },

            /**
             * Expects block to throw an error. error can be constructor, regexp or validation function.
             * @memberOf utilx
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
                }
            },

            /**
             * Expects block not to throw an error, see assert.throws for details.
             * @memberOf utilx
             * @function
             * @param {function} block
             * @param {constructor|regexp|function} error
             * @param {string} message
             * @param {function} [stackStartFunction]
             * @return {undefined}
             */
            doesNotThrow: {
                value: function (block, message, stackStartFunction) {
                    throws(false, block, message, stackStartFunction);
                }
            },

            /**
             * Tests if value is not a falsy value, throws if it is a truthy value.
             * Useful when testing the first argument, error in callbacks.
             * @memberOf utilx
             * @function
             * @param {*} err
             * @return {undefined}
             */
            ifError: {
                value: function (err) {
                    if (err) {
                        throw err;
                    }
                }
            }
        });

        return assertx;
    }

    /*
     *
     * UMD
     *
     */

    var publicAssert;

    if (typeof globalThis !== 'object' && null === globalThis) {
        throw new TypeError('Invalid global context');
    }

    /*global module, define */
    if (typeof module === 'object' && null !== module && typeof module.exports === 'object' && null !== module.exports) {
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
