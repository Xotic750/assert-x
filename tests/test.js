/*global require */

(function () {
    'use strict';

    var required = require('./'),
        utilx = required.utilx,
        test = required.test,
        assertx = required.assertx,
        rxTest = new RegExp('test'),

        // having an identical prototype property
        nbRoot = {
            toString: function () {
                return this.first + ' ' + this.last;
            }
        };

    function NameBuilder(first, last) {
        this.first = first;
        this.last = last;
    }

    NameBuilder.prototype = nbRoot;

    function NameBuilder2(first, last) {
        this.first = first;
        this.last = last;
    }

    function replacer(key, value) {
        /*jslint unparam: true */
        /*jshint unused: true */
        if (utilx.isUndefined(value) || utilx.isFunction(value) || utilx.isRegExp(value) || (utilx.isNumber(value) && !utilx.numberIsFinite(value))) {
            return utilx.anyToString(value);
        }

        return value;
    }

    function stringFromError(err) {
        var theString;

        if (utilx.isString(err.message) && !utilx.isEmptyString(err.message)) {
            theString = err.name + ': ' + err.message;
        } else {
            theString = err.name + ': ';
            theString += utilx.stringTruncate(utilx.jsonStringify(err.actual, replacer), 128) + ' ';
            theString += err.operator + ' ';
            theString += utilx.stringTruncate(utilx.jsonStringify(err.expected, replacer), 128);
        }

        return theString;
    }

    function testAssertionMessage(actual, expected) {
        var theMessage;

        try {
            assertx.strictEqual(actual, '');
        } catch (e) {
            theMessage = e.toString().split('\n')[0];
            if (utilx.strictEqual(theMessage, '"[object Error]"')) {
                theMessage = stringFromError(e);
            }

            assertx.strictEqual(theMessage, 'AssertionError: ' + expected + ' === ' + '""');
        }
    }

    function makeBlock(f) {
        var args = utilx.argumentsSlice(arguments, 1);

        return function () {
            return f.apply(null, args);
        };
    }

    test('assertx', function (t) {
        t.throws(function () {
            assertx(false, false, 'assertx is a throw function');
        }, assertx.AssertionError, 'assertx(false)');

        t.throws(function () {
            assertx(true, true, 'assertx is a throw function');
        }, assertx.AssertionError, 'assertx(true)');

        t.throws(function () {
            assertx('test', 'test', 'assertx is a throw function');
        }, assertx.AssertionError, 'assertx(\'test\')');

        t.end();
    });

    test('assertx.ok', function (t) {
        t.throws(function () {
            assertx.ok(false);
        }, assertx.AssertionError, 'ok(false)');

        t.doesNotThrow(function () {
            assertx.ok(true);
        }, assertx.AssertionError, 'ok(true)');

        t.doesNotThrow(function () {
            assertx.ok('test');
        }, 'ok(\'test\')');

        t.end();
    });

    test('assertx.equal', function (t) {
        t.throws(function () {
            assertx.equal(true, false);
        }, assertx.AssertionError, 'equal');

        t.doesNotThrow(function () {
            assertx.equal(null, null);
        }, 'equal');

        t.doesNotThrow(function () {
            assertx.equal(undefined, undefined);
        }, 'equal');

        t.doesNotThrow(function () {
            assertx.equal(null, undefined);
        }, 'equal');

        t.doesNotThrow(function () {
            assertx.equal(true, true);
        }, 'equal');

        t.doesNotThrow(function () {
            assertx.equal(2, '2');
        }, 'equal');

        t.doesNotThrow(function () {
            assertx.notEqual(true, false);
        }, 'notEqual');

        t.throws(function () {
            assertx.notEqual(true, true);
        }, assertx.AssertionError, 'notEqual');

        t.end();
    });

    test('assertx.strictEqual', function (t) {
        t.throws(function () {
            assertx.strictEqual(2, '2');
        }, assertx.AssertionError, 'strictEqual');

        t.throws(function () {
            assertx.strictEqual(null, undefined);
        }, assertx.AssertionError, 'strictEqual');

        t.doesNotThrow(function () {
            assertx.notStrictEqual(2, '2');
        }, 'notStrictEqual');

        t.end();
    });

    test('assertx.deepEqual - 7.2', function (t) {
        t.doesNotThrow(function () {
            assertx.deepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
        }, 'deepEqual date');

        t.throws(function () {
            assertx.deepEqual(new Date(), new Date(2000, 3, 14));
        }, assertx.AssertionError, 'deepEqual date');

        t.end();
    });

    test('assertx.deepEqual - 7.3', function (t) {
        t.doesNotThrow(function () {
            assertx.deepEqual(/a/, /a/);
        });

        t.doesNotThrow(function () {
            assertx.deepEqual(/a/g, /a/g);
        });

        t.doesNotThrow(function () {
            assertx.deepEqual(/a/i, /a/i);
        });

        t.doesNotThrow(function () {
            assertx.deepEqual(/a/m, /a/m);
        });

        t.doesNotThrow(function () {
            assertx.deepEqual(/a/igm, /a/igm);
        });

        t.throws(function () {
            assertx.deepEqual(/ab/, /a/);
        });

        t.throws(function () {
            assertx.deepEqual(/a/g, /a/);
        });

        t.throws(function () {
            assertx.deepEqual(/a/i, /a/);
        });

        t.throws(function () {
            assertx.deepEqual(/a/m, /a/);
        });

        t.throws(function () {
            assertx.deepEqual(/a/igm, /a/im);
        });

        var re1 = /a/;

        re1.lastIndex = 3;
        t.throws(function () {
            assertx.deepEqual(re1, /a/);
        });


        t.end();
    });

    test('assertx.deepEqual - 7.4', function (t) {
        t.doesNotThrow(function () {
            assertx.deepEqual(4, '4');
        }, 'deepEqual == check');

        t.doesNotThrow(function () {
            assertx.deepEqual(true, 1);
        }, 'deepEqual == check');

        t.throws(function () {
            assertx.deepEqual(4, '5');
        }, assertx.AssertionError, 'deepEqual == check');

        t.end();
    });

    test('assertx.deepEqual - 7.5', function (t) {
        t.doesNotThrow(function () {
            assertx.deepEqual({
                a: 4
            }, {
                a: 4
            });
        });

        t.doesNotThrow(function () {
            assertx.deepEqual({
                a: 4,
                b: '2'
            }, {
                a: 4,
                b: '2'
            });
        });

        t.doesNotThrow(function () {
            assertx.deepEqual([4], ['4']);
        });

        t.throws(function () {
            assertx.deepEqual({
                a: 4
            }, {
                a: 4,
                b: true
            });
        }, assertx.AssertionError);

        t.doesNotThrow(function () {
            assertx.deepEqual(['a'], {
                0: 'a'
            });
        });

        t.doesNotThrow(function () {
            assertx.deepEqual({
                a: 4,
                b: '1'
            }, {
                b: '1',
                a: 4
            });
        });

        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];

        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        t.throws(function () {
            assertx.deepEqual(utilx.objectKeys(a1), utilx.objectKeys(a2));
        }, assertx.AssertionError);

        t.doesNotThrow(function () {
            assertx.deepEqual(a1, a2);
        });

        t.end();
    });

    test('assertx.deepEqual - instances', function (t) {
        NameBuilder2.prototype = nbRoot;

        var nb1 = new NameBuilder('John', 'Smith'),
            nb2 = new NameBuilder2('John', 'Smith');

        t.doesNotThrow(function () {
            assertx.deepEqual(nb1, nb2);
        });

        NameBuilder2.prototype = Object;
        nb2 = new NameBuilder2('John', 'Smith');
        t.throws(function () {
            assertx.deepEqual(nb1, nb2);
        }, assertx.AssertionError);

        t.throws(function () {
            assertx.deepEqual('a', {});
        }, assertx.AssertionError);

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        t.doesNotThrow(function () {
            assertx.deepStrictEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
        }, 'deepStrictEqual date');

        t.throws(function () {
            assertx.deepStrictEqual(new Date(), new Date(2000, 3, 14));
        }, assertx.AssertionError, 'deepStrictEqual date');

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        t.doesNotThrow(function () {
            assertx.deepStrictEqual(/a/, /a/);
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(/a/g, /a/g);
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(/a/i, /a/i);
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(/a/m, /a/m);
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(/a/igm, /a/igm);
        });

        t.throws(function () {
            assertx.deepStrictEqual(/ab/, /a/);
        });

        t.throws(function () {
            assertx.deepStrictEqual(/a/g, /a/);
        });

        t.throws(function () {
            assertx.deepStrictEqual(/a/i, /a/);
        });

        t.throws(function () {
            assertx.deepStrictEqual(/a/m, /a/);
        });

        t.throws(function () {
            assertx.deepStrictEqual(/a/igm, /a/im);
        });

        var re1 = /a/;

        re1.lastIndex = 3;
        t.throws(function () {
            assertx.deepStrictEqual(re1, /a/);
        });

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        t.throws(function () {
            assertx.deepStrictEqual(4, '4');
        }, 'deepStrictEqual === check');

        t.throws(function () {
            assertx.deepStrictEqual(true, 1);
        }, 'deepStrictEqual === check');

        t.throws(function () {
            assertx.deepStrictEqual(4, '5');
        }, assertx.AssertionError, 'deepStrictEqual === check');

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        t.doesNotThrow(function () {
            assertx.deepStrictEqual({
                a: 4
            }, {
                a: 4
            });
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual({
                a: 4,
                b: '2'
            }, {
                a: 4,
                b: '2'
            });
        });

        t.throws(function () {
            assertx.deepStrictEqual([4], ['4']);
        });

        t.throws(function () {
            assertx.deepStrictEqual({
                a: 4
            }, {
                a: 4,
                b: true
            });
        }, assertx.AssertionError);

        t.throws(function () {
            assertx.deepStrictEqual(['a'], {
                0: 'a'
            });
        });

        t.doesNotThrow(function () {
            assertx.deepStrictEqual({
                a: 4,
                b: '1'
            }, {
                b: '1',
                a: 4
            });
        });

        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];

        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';
        t.throws(function () {
            assertx.deepStrictEqual(utilx.objectKeys(a1), utilx.objectKeys(a2));
        }, assertx.AssertionError);

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(a1, a2);
        });

        t.end();
    });

    test('assertx.deepStrictEqual - instances', function (t) {
        NameBuilder2.prototype = nbRoot;

        var nb1 = new NameBuilder('John', 'Smith'),
            nb2 = new NameBuilder2('John', 'Smith');

        t.doesNotThrow(function () {
            assertx.deepStrictEqual(nb1, nb2);
        });

        NameBuilder2.prototype = Object;
        nb2 = new NameBuilder2('John', 'Smith');
        t.throws(function () {
            assertx.deepStrictEqual(nb1, nb2);
        }, assertx.AssertionError);

        t.throws(function () {
            assertx.deepStrictEqual('a', {});
        }, assertx.AssertionError);

        t.end();
    });

    function thrower(ErrorConstructor) {
        throw new ErrorConstructor('test');
    }

    test('assertx - Testing the throwing', function (t) {
        t.throws(function () {
            makeBlock(thrower, TypeError)();
        }, TypeError, 'thrower working');

        t.throws(function () {
            makeBlock(thrower, assertx.AssertionError)();
        }, assertx.AssertionError, 'thrower working');

        // the basic calls work
        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, assertx.AssertionError), assertx.AssertionError, 'message');
        });

        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, assertx.AssertionError), assertx.AssertionError);
        });

        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, assertx.AssertionError));
        });

        // if not passing an error, catch all.
        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, TypeError));
        });

        // when passing a type, only catch errors of the appropriate type
        try {
            assertx.throws(makeBlock(thrower, TypeError), assertx.AssertionError);
            t.fail('throws with an explicit error is eating extra errors');
        } catch (e) {
            t.ok(utilx.objectInstanceOf(e, TypeError), 'threw correct constructor');
            t.pass('throws with an explicit error is not eating extra errors');
        }

        // doesNotThrow should pass through all errors
        try {
            assertx.doesNotThrow(makeBlock(thrower, TypeError), assertx.AssertionError);
            t.fail('doesNotThrow with an explicit error is eating extra errors');
        } catch (e) {
            t.ok(utilx.objectInstanceOf(e, TypeError), 'threw correct constructor');
            t.pass('doesNotThrow with an explicit error is not eating extra errors');
        }

        // key difference is that throwing our correct error makes an assertion error
        try {
            assertx.doesNotThrow(makeBlock(thrower, TypeError), TypeError);
            t.fail('doesNotThrow is not catching type matching errors');
        } catch (e) {
            t.ok(utilx.objectInstanceOf(e, assertx.AssertionError), 'threw correct constructor');
            t.pass('doesNotThrow is catching type matching errors');
        }

        t.end();
    });

    test('assertx.ifError', function (t) {
        t.throws(function () {
            assertx.ifError(new Error('test error'));
        }, assertx.AssertionError, 'error does throw');

        t.doesNotThrow(function () {
            assertx.ifError(null);
        }, 'null does not throw');

        t.doesNotThrow(function () {
            assertx.ifError();
        }, 'undefined does not throw');

        t.end();
    });

    test('assertx - make sure that validating using constructor really works', function (t) {
        try {
            assertx.throws(function () {
                throw ({});
            }, Array);

            t.fail('wrong constructor validation');
        } catch (e) {
            t.pass('correct constructor validation');
        }

        t.end();
    });

    test('assertx - use a RegExp to validate error message', function (t) {
        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, TypeError), rxTest);
        });

        t.end();
    });

    test('assertx - set a fn to validate error object', function (t) {
        t.doesNotThrow(function () {
            assertx.throws(makeBlock(thrower, TypeError), function (err) {
                var result;

                if (utilx.objectInstanceOf(err, TypeError) && rxTest.test(err)) {
                    result = true;
                }

                return result;
            });
        });

        t.end();
    });

    test('assertx - Make sure deepEqual doesn\'t loop forever on circular refs', function (t) {
        var b = {},
            c = {};

        b.b = b;
        c.b = c;

        try {
            assertx.deepEqual(b, c);
            t.fail('cirular did not throw');
        } catch (e) {
            t.pass('cirular threw');
        }

        t.end();
    });

    test('assertx - Make sure deepStricEqual doesn\'t loop forever on circular refs', function (t) {
        var b = {},
            c = {};

        b.b = b;
        c.b = c;

        try {
            assertx.deepStricEqual(b, c);
            t.fail('cirular did not throw');
        } catch (e) {
            t.pass('cirular threw');
        }

        t.end();
    });

    test('assertx - test assertion message', function (t) {
        function f() {}

        t.doesNotThrow(function () {
            testAssertionMessage(undefined, '"undefined"');
            testAssertionMessage(null, 'null');
            testAssertionMessage(true, 'true');
            testAssertionMessage(false, 'false');
            testAssertionMessage(0, '0');
            testAssertionMessage(100, '100');
            testAssertionMessage(NaN, '"NaN"');
            testAssertionMessage(Infinity, '"Infinity"');
            testAssertionMessage(-Infinity, '"-Infinity"');
            testAssertionMessage('', '""');
            testAssertionMessage('foo', '"foo"');
            testAssertionMessage([], '[]');
            testAssertionMessage([1, 2, 3], '[1,2,3]');
            testAssertionMessage(/a/, '"/a/"');
            testAssertionMessage(f, utilx.jsonStringify(f.toString()));
            testAssertionMessage({}, '{}');

            testAssertionMessage({
                a: undefined,
                b: null
            }, '{"a":"undefined","b":null}');

            testAssertionMessage({
                a: NaN,
                b: Infinity,
                c: -Infinity
            }, '{"a":"NaN","b":"Infinity","c":"-Infinity"}');

        });

        t.end();
    });

    test('assertx - regressions from node.js testcase', function (t) {
        var threw = false;

        try {
            assertx.throws(function () {
                assertx.ifError(null);
            });
        } catch (e) {
            threw = true;
            assertx.equal(e.message, 'Missing expected exception..');
        }

        t.ok(threw, 'null threw error');

        try {
            assertx.equal(1, 2);
        } catch (e) {
            t.equal(e.toString().split('\n')[0], 'AssertionError: 1 == 2');
        }

        try {
            assertx.equal(1, 2, 'oh no');
        } catch (e) {
            t.equal(e.toString().split('\n')[0], 'AssertionError: oh no');
        }

        t.end();
    });
}());
