/**
 * @file {@link @@HOMEPAGE AstroDate}. @@DESCRIPTION.
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

    function factory(utilx) {
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
            if (utilx.isUndefined(value) || utilx.isFunction(value) || utilx.isRegExp(value) || (utilx.isNumber(value) && !utilx.numberIsFinite(value))) {
                return utilx.anyToString(value);
            }

            return value;
        }

        /**
         * The AssertionError is defined in assert.
         * @private
         * @constructor
         * @augments Error
         * @param {object} opts
         * @return {undefined}
         */
        function AssertionError(opts) {
            var err;

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

            this.message = opts.message;
            this.actual = opts.actual;
            this.expected = opts.expected;
            this.operator = opts.operator;
            this.stackStartFunction = opts.stackStartFunction;

            if (utilx.isFunction(Error.captureStackTrace)) {
                Error.captureStackTrace(this, this.stackStartFunction);
            } else {
                err = Error.call(this);

                if (utilx.isString(err.stack)) {
                    this.stack = err.stack;
                } else if (utilx.isString(err.stacktrace)) {
                    this.stack = err.stacktrace;
                }
            }
        }

        utilx.inherits(AssertionError, Error);

        utilx.objectDefineProperties(AssertionError.prototype, {
            constructor: {
                value: AssertionError
            },

            name: {
                value: 'AssertionError'
            },

            toString: {
                value: function () {
                    var theString;

                    if (utilx.isString(this.message) && !utilx.isEmptyString(this.message)) {
                        theString = this.name + ': ' + this.message;
                    } else {
                        theString = this.name + ': ';
                        theString += utilx.stringTruncate(utilx.jsonStringify(this.actual, replacer), 128) + ' ';
                        theString += this.operator + ' ';
                        theString += utilx.stringTruncate(utilx.jsonStringify(this.expected, replacer), 128);
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
                return expected.test(actual.toString());
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
         * Throws an exception that displays the values for actual and expected separated by the provided operator.
         * @function assertx
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
                    stackStartFunction = utilx.privateUndefined;
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
            message = (expected && utilx.isString(expected.name) && utilx.isEmptyString(expected.name) ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');
            if (utilx.isTrue(shouldThrow) && !actual) {
                assertx(actual, expected, 'Missing expected exception' + message, utilx.privateUndefined, stackStartFunction);
            }

            if (utilx.isFalse(shouldThrow) && utilx.isTrue(wasExceptionExpected)) {
                assertx(actual, expected, 'Got unwanted exception' + message, utilx.privateUndefined, stackStartFunction);
            }

            if ((utilx.isTrue(shouldThrow) && actual && expected && utilx.isFalse(wasExceptionExpected)) || (utilx.isFalse(shouldThrow) && actual)) {
                throw actual;
            }
        }

        utilx.objectDefineProperties(assertx, {
            /**
             * The AssertionError is defined in assert.
             * @memberOf assertx
             * @constructor
             * @param {object} opts
             * @return {undefined}
             */
            AssertionError: {
                value: AssertionError
            },

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
                    assertx(actual, expected, message, 'fail', stackStartFunction);
                }
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
                        assertx(pass, true, message, 'ok', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, '==', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, '!=', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, 'deepEqual', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, 'notDeepEqual', stackStartFunction);
                    }
                }
            },

            /**
             * Tests for deep strict equality, equality with the strict equal comparison operator ( === ) and equivalent.
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
                        assertx(actual, expected, message, 'deepStrictEqual', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, 'notDeepStrictEqual', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, '===', stackStartFunction);
                    }
                }
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
                        assertx(actual, expected, message, '!==', stackStartFunction);
                    }
                }
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
                }
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
                }
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
