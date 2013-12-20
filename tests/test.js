/*global require */

(function () {
    'use strict';

    var required = require('./'),
        utilx = required.utilx,
        test = required.test,
        assertx = required.assertx,

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

    function testAssertionMessage(actual, expected) {
        try {
            assertx.equal(actual, '');
        } catch (e) {
            assertx.equal(e.toString(), ['AssertionError:', expected, '==', '""'].join(' '));
        }
    }

    function makeBlock(f) {
        var args = utilx.argumentsSlice(arguments, 1);

        return function () {
            return f.apply(null, args);
        };
    }

    test('assertx', function (t) {
        try {
            assertx.throws(makeBlock(assertx, false), assertx.AssertionError, 'assertx(false)');

            assertx.throws(makeBlock(assertx, true), assertx.AssertionError, 'assertx(true)');

            assertx.throws(makeBlock(assertx, 'test', 'assertx(\'test\')'));

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.ok', function (t) {
        try {
            assertx.throws(makeBlock(assertx.ok, false), assertx.AssertionError, 'ok(false)');

            assertx.doesNotThrow(makeBlock(assertx.ok, true), assertx.AssertionError, 'ok(true)');

            assertx.doesNotThrow(makeBlock(assertx.ok, 'test'), 'ok(\'test\')');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.equal', function (t) {
        try {
            assertx.throws(makeBlock(assertx.equal, true, false), assertx.AssertionError, 'equal');

            assertx.doesNotThrow(makeBlock(assertx.equal, null, null), 'equal');

            assertx.doesNotThrow(makeBlock(assertx.equal, undefined, undefined), 'equal');

            assertx.doesNotThrow(makeBlock(assertx.equal, null, undefined), 'equal');

            assertx.doesNotThrow(makeBlock(assertx.equal, true, true), 'equal');

            assertx.doesNotThrow(makeBlock(assertx.equal, 2, '2'), 'equal');

            assertx.doesNotThrow(makeBlock(assertx.notEqual, true, false), 'notEqual');

            assertx.throws(makeBlock(assertx.notEqual, true, true), assertx.AssertionError, 'notEqual');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.strictEqual', function (t) {
        try {
            assertx.throws(makeBlock(assertx.strictEqual, 2, '2'), assertx.AssertionError, 'strictEqual');

            assertx.throws(makeBlock(assertx.strictEqual, null, undefined), assertx.AssertionError, 'strictEqual');

            assertx.doesNotThrow(makeBlock(assertx.notStrictEqual, 2, '2'), 'notStrictEqual');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepEqual - 7.2', function (t) {
        try {
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, new Date(2000, 3, 14), new Date(2000, 3, 14)), 'deepEqual date');

            assertx.throws(makeBlock(assertx.deepEqual, new Date(), new Date(2000, 3, 14)), assertx.AssertionError, 'deepEqual date');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepEqual - 7.3', function (t) {
        try {
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, /a/, /a/));
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, /a/g, /a/g));
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, /a/i, /a/i));
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, /a/m, /a/m));
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, /a/igm, /a/igm));
            assertx.throws(makeBlock(assertx.deepEqual, /ab/, /a/));
            assertx.throws(makeBlock(assertx.deepEqual, /a/g, /a/));
            assertx.throws(makeBlock(assertx.deepEqual, /a/i, /a/));
            assertx.throws(makeBlock(assertx.deepEqual, /a/m, /a/));
            assertx.throws(makeBlock(assertx.deepEqual, /a/igm, /a/im));

            var re1 = /a/;

            re1.lastIndex = 3;
            assertx.throws(makeBlock(assertx.deepEqual, re1, /a/));

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepEqual - 7.4', function (t) {
        try {
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, 4, '4'), 'deepEqual == check');
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, true, 1), 'deepEqual == check');
            assertx.throws(makeBlock(assertx.deepEqual, 4, '5'), assertx.AssertionError, 'deepEqual == check');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepEqual - 7.5', function (t) {
        try {
            // having the same number of owned properties && the same set of keys
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, {
                a: 4
            }, {
                a: 4
            }));

            assertx.doesNotThrow(makeBlock(assertx.deepEqual, {
                a: 4,
                b: '2'
            }, {
                a: 4,
                b: '2'
            }));

            assertx.doesNotThrow(makeBlock(assertx.deepEqual, [4], ['4']));

            assertx.throws(makeBlock(assertx.deepEqual, {
                a: 4
            }, {
                a: 4,
                b: true
            }), assertx.AssertionError);

            assertx.doesNotThrow(makeBlock(assertx.deepEqual, ['a'], {
                0: 'a'
            }));

            //(although not necessarily the same order),
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, {
                a: 4,
                b: '1'
            }, {
                b: '1',
                a: 4
            }));

            var a1 = [1, 2, 3],
                a2 = [1, 2, 3];

            a1.a = 'test';
            a1.b = true;
            a2.b = true;
            a2.a = 'test';
            assertx.throws(makeBlock(assertx.deepEqual, utilx.objectKeys(a1), utilx.objectKeys(a2)), assertx.AssertionError);
            assertx.doesNotThrow(makeBlock(assertx.deepEqual, a1, a2));

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepEqual - instances', function (t) {
        try {
            NameBuilder2.prototype = nbRoot;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.doesNotThrow(makeBlock(assertx.deepEqual, nb1, nb2));

            NameBuilder2.prototype = Object;
            nb2 = new NameBuilder2('John', 'Smith');
            assertx.throws(makeBlock(assertx.deepEqual, nb1, nb2), assertx.AssertionError);

            // String literal + object blew up my implementation...
            assertx.throws(makeBlock(assertx.deepEqual, 'a', {}), assertx.AssertionError);

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        try {
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, new Date(2000, 3, 14), new Date(2000, 3, 14)), 'deepStrictEqual date');

            assertx.throws(makeBlock(assertx.deepStrictEqual, new Date(), new Date(2000, 3, 14)), assertx.AssertionError, 'deepStrictEqual date');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        try {
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, /a/, /a/));
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, /a/g, /a/g));
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, /a/i, /a/i));
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, /a/m, /a/m));
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, /a/igm, /a/igm));
            assertx.throws(makeBlock(assertx.deepStrictEqual, /ab/, /a/));
            assertx.throws(makeBlock(assertx.deepStrictEqual, /a/g, /a/));
            assertx.throws(makeBlock(assertx.deepStrictEqual, /a/i, /a/));
            assertx.throws(makeBlock(assertx.deepStrictEqual, /a/m, /a/));
            assertx.throws(makeBlock(assertx.deepStrictEqual, /a/igm, /a/im));

            var re1 = /a/;

            re1.lastIndex = 3;
            assertx.throws(makeBlock(assertx.deepStrictEqual, re1, /a/));

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        try {
            assertx.throws(makeBlock(assertx.deepStrictEqual, 4, '4'), 'deepStrictEqual === check');
            assertx.throws(makeBlock(assertx.deepStrictEqual, true, 1), 'deepStrictEqual === check');
            assertx.throws(makeBlock(assertx.deepStrictEqual, 4, '5'), assertx.AssertionError, 'deepStrictEqual === check');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepStrictEqual', function (t) {
        try {
            // having the same number of owned properties && the same set of keys
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, {
                a: 4
            }, {
                a: 4
            }));

            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, {
                a: 4,
                b: '2'
            }, {
                a: 4,
                b: '2'
            }));

            assertx.throws(makeBlock(assertx.deepStrictEqual, [4], ['4']));

            assertx.throws(makeBlock(assertx.deepStrictEqual, {
                a: 4
            }, {
                a: 4,
                b: true
            }), assertx.AssertionError);

            assertx.throws(makeBlock(assertx.deepStrictEqual, ['a'], {
                0: 'a'
            }));

            //(although not necessarily the same order),
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, {
                a: 4,
                b: '1'
            }, {
                b: '1',
                a: 4
            }));

            var a1 = [1, 2, 3],
                a2 = [1, 2, 3];

            a1.a = 'test';
            a1.b = true;
            a2.b = true;
            a2.a = 'test';
            assertx.throws(makeBlock(assertx.deepStrictEqual, utilx.objectKeys(a1), utilx.objectKeys(a2)), assertx.AssertionError);
            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, a1, a2));

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.deepStrictEqual - instances', function (t) {
        try {
            NameBuilder2.prototype = nbRoot;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.doesNotThrow(makeBlock(assertx.deepStrictEqual, nb1, nb2));

            NameBuilder2.prototype = Object;
            nb2 = new NameBuilder2('John', 'Smith');
            assertx.throws(makeBlock(assertx.deepStrictEqual, nb1, nb2), assertx.AssertionError);

            // String literal + object blew up my implementation...
            assertx.throws(makeBlock(assertx.deepStrictEqual, 'a', {}), assertx.AssertionError);

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    function thrower(ErrorConstructor) {
        throw new ErrorConstructor('test');
    }

    test('assertx - Testing the throwing', function (t) {
        try {
            var threw;

            makeBlock(thrower, assertx.AssertionError);
            makeBlock(thrower, assertx.AssertionError);

            // the basic calls work
            assertx.throws(makeBlock(thrower, assertx.AssertionError), assertx.AssertionError, 'message');
            assertx.throws(makeBlock(thrower, assertx.AssertionError), assertx.AssertionError);
            assertx.throws(makeBlock(thrower, assertx.AssertionError));

            // if not passing an error, catch all.
            assertx.throws(makeBlock(thrower, TypeError));

            // when passing a type, only catch errors of the appropriate type
            threw = false;
            try {
                assertx.throws(makeBlock(thrower, TypeError), assertx.AssertionError);
            } catch (e) {
                threw = true;
                assertx.ok(utilx.objectInstanceOf(e, TypeError), 'type');
            }

            assertx.equal(true, threw, 'a.throws with an explicit error is eating extra errors', assertx.AssertionError);
            threw = false;

            // doesNotThrow should pass through all errors
            try {
                assertx.doesNotThrow(makeBlock(thrower, TypeError), assertx.AssertionError);
            } catch (e) {
                threw = true;
                assertx.ok(utilx.objectInstanceOf(e, TypeError));
            }

            assertx.equal(true, threw, 'a.doesNotThrow with an explicit error is eating extra errors');

            // key difference is that throwing our correct error makes an assertion error
            try {
                assertx.doesNotThrow(makeBlock(thrower, TypeError), TypeError);
            } catch (e) {
                threw = true;
                assertx.ok(utilx.objectInstanceOf(e, assertx.AssertionError));
            }

            assertx.equal(true, threw, 'a.doesNotThrow is not catching type matching errors');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx.ifError', function (t) {
        try {
            assertx.throws(function () {
                assertx.ifError(new Error('test error'));
            });

            assertx.doesNotThrow(function () {
                assertx.ifError(null);
            });

            assertx.doesNotThrow(function () {
                assertx.ifError();
            });

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx - make sure that validating using constructor really works', function (t) {
        try {
            var threw = false;

            try {
                assertx.throws(function () {
                    throw ({});
                }, Array);
            } catch (e) {
                threw = true;
            }

            assertx.ok(threw, 'wrong constructor validation');

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx - use a RegExp to validate error message', function (t) {
        try {
            assertx.throws(makeBlock(thrower, TypeError), /test/);

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx - set a fn to validate error object', function (t) {
        try {
            assertx.throws(makeBlock(thrower, TypeError), function (err) {
                var result;

                if (utilx.objectInstanceOf(err, TypeError) && /test/.test(err)) {
                    result = true;
                }

                return result;
            });

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx - Make sure deepEqual doesn\'t loop forever on circular refs', function (t) {
        try {
            var b = {},
                c = {},
                gotError = false;

            b.b = b;
            c.b = c;

            try {
                assertx.deepEqual(b, c);
            } catch (e) {
                gotError = true;
            }

            assertx.ok(gotError);

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });


    test('assertx - test assertion message', function (t) {
        try {
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
            testAssertionMessage(function f() {}, '"function f() {}"');
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

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });

    test('assertx - regressions from node.js testcase', function (t) {
        try {
            var threw = false;

            try {
                assertx.throws(function () {
                    assertx.ifError(null);
                });
            } catch (e) {
                threw = true;
                assertx.equal(e.message, 'Missing expected exception..');
            }

            assertx.ok(threw);

            try {
                assertx.equal(1, 2);
            } catch (e) {
                assertx.equal(e.toString().split('\n')[0], 'AssertionError: 1 == 2');
            }

            try {
                assertx.equal(1, 2, 'oh no');
            } catch (e) {
                assertx.equal(e.toString().split('\n')[0], 'AssertionError: oh no');
            }

            t.pass(t.name);
        } catch (e) {
            t.error(e, t.name);
        }

        t.end();
    });
}());
