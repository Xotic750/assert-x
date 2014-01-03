/*global require, describe, it */

(function () {
    'use strict';

    var required = require('../scripts/'),
        utilx = required.utilx,
        assertx = required.assertx,
        rxSplit = new RegExp('[\\r\\n]'),
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

    function testAssertionMessage(actual, expected) {
        try {
            assertx.strictEqual(actual, '');
        } catch (e) {
            assertx.strictEqual(e.toStringX(), 'AssertionError: ' + expected + ' === ' + '""');
        }
    }

    describe('Error', function () {
        /*global console*/
        it('look at toString', function () {
            try {
                throw new Error('show me the money');
            } catch (e) {
                console.log('# ' + e.toString());
            }
        });
    });

    describe('AssertionError', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: false,
                    expected: false,
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: true,
                    expected: true,
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: true,
                    expected: false,
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: false,
                    expected: true,
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: '',
                    expected: 'test',
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: 'test',
                    expected: '',
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: 'test',
                    expected: 'test',
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    message: 'assertx.AssertionError is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    actual: 'assertx.AssertionError',
                    expected: 'is an Error function'
                });
            }, assertx.AssertionError, 'assertx.AssertionError');

            assertx.throws(function () {
                throw new assertx.AssertionError();
            }, assertx.AssertionError, 'assertx.AssertionError');
        });
    });

    describe('assertx.ok', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.ok(false);
            }, assertx.AssertionError, 'ok(false)');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.ok(true);
            }, 'ok(true)');

            assertx.doesNotThrow(function () {
                assertx.ok('test');
            }, 'ok("test")');
        });
    });

    describe('assertx.notOk', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.notOk(true);
            }, assertx.AssertionError, 'notOk(true)');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.notOk(false);
            }, assertx.AssertionError, 'notOk(false)');

            assertx.doesNotThrow(function () {
                assertx.notOk();
            }, 'notOk()');
        });
    });

    describe('assertx.equal', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.equal(true, false);
            }, assertx.AssertionError, 'equal');

            assertx.throws(function () {
                assertx.notEqual(true, true);
            }, assertx.AssertionError, 'notEqual');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.equal(null, null);
            }, 'equal');

            assertx.doesNotThrow(function () {
                assertx.equal(undefined, undefined);
            }, 'equal');

            assertx.doesNotThrow(function () {
                assertx.equal(null, undefined);
            }, 'equal');

            assertx.doesNotThrow(function () {
                assertx.equal(true, true);
            }, 'equal');

            assertx.doesNotThrow(function () {
                assertx.equal(2, '2');
            }, 'equal');

            assertx.doesNotThrow(function () {
                assertx.notEqual(true, false);
            }, 'notEqual');
        });
    });

    describe('assertx.strictEqual', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.strictEqual(2, '2');
            }, assertx.AssertionError, 'strictEqual');

            assertx.throws(function () {
                assertx.strictEqual(null, undefined);
            }, assertx.AssertionError, 'strictEqual');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.notStrictEqual(2, '2');
            }, 'notStrictEqual');
        });
    });

    describe('assertx.deepEqual - 7.2', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepEqual(new Date(), new Date(2000, 3, 14));
            }, assertx.AssertionError, 'deepEqual date');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
            }, 'deepEqual date');
        });
    });

    describe('assertx.deepEqual - 7.3', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepEqual(/ab/, /a/);
            });

            assertx.throws(function () {
                assertx.deepEqual(/a/g, /a/);
            });

            assertx.throws(function () {
                assertx.deepEqual(/a/i, /a/);
            });

            assertx.throws(function () {
                assertx.deepEqual(/a/m, /a/);
            });

            assertx.throws(function () {
                assertx.deepEqual(/a/igm, /a/im);
            });

            var re1 = /a/;

            re1.lastIndex = 3;
            assertx.throws(function () {
                assertx.deepEqual(re1, /a/);
            });
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepEqual(/a/, /a/);
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(/a/g, /a/g);
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(/a/i, /a/i);
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(/a/m, /a/m);
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(/a/igm, /a/igm);
            });
        });
    });

    describe('assertx.deepEqual - 7.4', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepEqual(4, '5');
            }, assertx.AssertionError, 'deepEqual == check');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepEqual(4, '4');
            }, 'deepEqual == check');

            assertx.doesNotThrow(function () {
                assertx.deepEqual(true, 1);
            }, 'deepEqual == check');
        });
    });

    describe('assertx.deepEqual - 7.5', function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];

        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';

        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepEqual({
                    a: 4
                }, {
                    a: 4,
                    b: true
                });
            }, assertx.AssertionError);

            assertx.throws(function () {
                assertx.deepEqual(utilx.objectKeys(a1), utilx.objectKeys(a2));
            }, assertx.AssertionError);
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepEqual({
                    a: 4
                }, {
                    a: 4
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual({
                    a: 4,
                    b: '2'
                }, {
                    a: 4,
                    b: '2'
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual([4], ['4']);
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(['a'], {
                    0: 'a'
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual({
                    a: 4,
                    b: '1'
                }, {
                    b: '1',
                    a: 4
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepEqual(a1, a2);
            });
        });
    });

    describe('assertx.deepEqual - instances', function () {
        it('should throw an error in each case', function () {
            NameBuilder2.prototype = Object;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.throws(function () {
                assertx.deepEqual(nb1, nb2);
            }, assertx.AssertionError);

            assertx.throws(function () {
                assertx.deepEqual('a', {});
            }, assertx.AssertionError);
        });

        it('should not throw an error in each case', function () {
            NameBuilder2.prototype = nbRoot;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.doesNotThrow(function () {
                assertx.deepEqual(nb1, nb2);
            });
        });
    });

    describe('assertx.deepStrictEqual', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepStrictEqual(new Date(), new Date(2000, 3, 14));
            }, assertx.AssertionError, 'deepStrictEqual date');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
            }, 'deepStrictEqual date');
        });
    });

    describe('assertx.deepStrictEqual', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepStrictEqual(/ab/, /a/);
            });

            assertx.throws(function () {
                assertx.deepStrictEqual(/a/g, /a/);
            });

            assertx.throws(function () {
                assertx.deepStrictEqual(/a/i, /a/);
            });

            assertx.throws(function () {
                assertx.deepStrictEqual(/a/m, /a/);
            });

            assertx.throws(function () {
                assertx.deepStrictEqual(/a/igm, /a/im);
            });

            var re1 = /a/;

            re1.lastIndex = 3;
            assertx.throws(function () {
                assertx.deepStrictEqual(re1, /a/);
            });
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(/a/, /a/);
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(/a/g, /a/g);
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(/a/i, /a/i);
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(/a/m, /a/m);
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(/a/igm, /a/igm);
            });
        });
    });

    describe('assertx.deepStrictEqual', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepStrictEqual(4, '4');
            }, 'deepStrictEqual === check');

            assertx.throws(function () {
                assertx.deepStrictEqual(true, 1);
            }, 'deepStrictEqual === check');

            assertx.throws(function () {
                assertx.deepStrictEqual(4, '5');
            }, assertx.AssertionError, 'deepStrictEqual === check');
        });
    });

    describe('assertx.deepStrictEqual', function () {
        var a1 = [1, 2, 3],
            a2 = [1, 2, 3];

        a1.a = 'test';
        a1.b = true;
        a2.b = true;
        a2.a = 'test';

        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.deepStrictEqual([4], ['4']);
            });

            assertx.throws(function () {
                assertx.deepStrictEqual({
                    a: 4
                }, {
                    a: 4,
                    b: true
                });
            }, assertx.AssertionError);

            assertx.throws(function () {
                assertx.deepStrictEqual(['a'], {
                    0: 'a'
                });
            });

            assertx.throws(function () {
                assertx.deepStrictEqual(utilx.objectKeys(a1), utilx.objectKeys(a2));
            }, assertx.AssertionError);
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual({
                    a: 4
                }, {
                    a: 4
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual({
                    a: 4,
                    b: '2'
                }, {
                    a: 4,
                    b: '2'
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual({
                    a: 4,
                    b: '1'
                }, {
                    b: '1',
                    a: 4
                });
            });

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(a1, a2);
            });
        });
    });

    describe('assertx.deepStrictEqual - instances', function () {
        it('should throw an error in each case', function () {
            NameBuilder2.prototype = Object;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.throws(function () {
                assertx.deepStrictEqual(nb1, nb2);
            }, assertx.AssertionError);

            assertx.throws(function () {
                assertx.deepStrictEqual('a', {});
            }, assertx.AssertionError);
        });

        it('should not throw an error in each case', function () {
            NameBuilder2.prototype = nbRoot;

            var nb1 = new NameBuilder('John', 'Smith'),
                nb2 = new NameBuilder2('John', 'Smith');

            assertx.doesNotThrow(function () {
                assertx.deepStrictEqual(nb1, nb2);
            });
        });
    });

    describe('assertx - Testing the throwing', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                throw new TypeError('test');
            }, TypeError, 'thrower working');

            assertx.throws(function () {
                throw new assertx.AssertionError({
                    message: 'test'
                });
            }, assertx.AssertionError, 'thrower working');
        });

        it('should not throw an error in each case', function () {
            // the basic calls work
            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new assertx.AssertionError({
                        message: 'test'
                    });
                }, assertx.AssertionError, 'message');
            });

            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new assertx.AssertionError({
                        message: 'test'
                    });
                }, assertx.AssertionError);
            });

            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new assertx.AssertionError({
                        message: 'test'
                    });
                });
            });

            // if not passing an error, catch all.
            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new TypeError('test');
                });
            });

            // when passing a type, only catch errors of the appropriate type
            try {
                assertx.throws(function () {
                    throw new TypeError('test');
                }, assertx.AssertionError);

                assertx.fail('throws with an explicit error is eating extra errors');
            } catch (e) {
                assertx.ok(utilx.objectInstanceOf(e, TypeError), 'threw correct constructor');
                assertx.ok(true, 'throws with an explicit error is not eating extra errors');
            }

            // doesNotThrow should pass through all errors
            try {
                assertx.doesNotThrow(function () {
                    throw new TypeError('test');
                }, assertx.AssertionError);

                assertx.fail('doesNotThrow with an explicit error is eating extra errors');
            } catch (e) {
                assertx.ok(utilx.objectInstanceOf(e, TypeError), 'threw correct constructor');
                assertx.ok(true, 'doesNotThrow with an explicit error is not eating extra errors');
            }

            // key difference is that throwing our correct error makes an assertion error
            try {
                assertx.doesNotThrow(function () {
                    throw new TypeError('test');
                }, TypeError);

                assertx.fail('doesNotThrow is not catching type matching errors');
            } catch (e) {
                assertx.ok(utilx.objectInstanceOf(e, assertx.AssertionError), 'threw correct constructor');
                assertx.ok(true, 'doesNotThrow is catching type matching errors');
            }
        });
    });

    describe('assertx.ifError', function () {
        it('should throw an error in each case', function () {
            assertx.throws(function () {
                assertx.ifError(new Error('test error'));
            }, Error, 'error does throw');
        });

        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.ifError(null);
            }, 'null does not throw');

            assertx.doesNotThrow(function () {
                assertx.ifError();
            }, 'undefined does not throw');
        });
    });

    describe('assertx - make sure that validating using constructor really works', function () {
        it('should not throw an error in each case', function () {
            try {
                assertx.throws(function () {
                    throw ({});
                }, Array);

                assertx.fail('wrong constructor validation');
            } catch (e) {
                assertx.ok(true, 'correct constructor validation');
            }
        });
    });

    describe('assertx - use a RegExp to validate error message', function () {
        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new TypeError('test');
                }, rxTest);
            });

            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new assertx.AssertionError({
                        message: 'test'
                    });

                }, rxTest);
            });
        });
    });

    describe('assertx - set a fn to validate error object', function () {
        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new TypeError('test');
                }, function (err) {
                    return utilx.objectInstanceOf(err, TypeError) &&
                        rxTest.test(assertx.AssertionError.errorToString(err));
                });
            });

            assertx.doesNotThrow(function () {
                assertx.throws(function () {
                    throw new assertx.AssertionError({
                        message: 'test'
                    });
                }, function (err) {
                    return utilx.objectInstanceOf(err, assertx.AssertionError) &&
                        rxTest.test(assertx.AssertionError.errorToString(err));
                });
            });
        });
    });

    describe('assertx - Make sure deepEqual doesn\'t loop forever on circular refs', function () {
        it('should not throw an error in each case', function () {
            var b = {},
                c = {};

            b.b = b;
            c.b = c;

            try {
                assertx.deepEqual(b, c);
                assertx.fail('cirular did not throw');
            } catch (e) {
                assertx.ok(true, 'cirular threw');
            }
        });
    });

    describe('assertx - Make sure deepStrictEqual doesn\'t loop forever on circular refs', function () {
        it('should not throw an error in each case', function () {
            var b = {},
                c = {};

            b.b = b;
            c.b = c;

            try {
                assertx.deepStricEqual(b, c);
                assertx.fail('cirular did not throw');
            } catch (e) {
                assertx.ok(true, 'cirular threw');
            }
        });
    });

    describe('assertx - test assertion message', function () {
        it('should not throw an error in each case', function () {
            assertx.doesNotThrow(function () {
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
                testAssertionMessage(utilx.noop, utilx.jsonStringify(utilx.noop.toString()));
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
        });
    });

    describe('assertx - regressions from node.js testcase', function () {
        it('should not throw an error in each case', function () {
            var threw = false;

            try {
                assertx.throws(function () {
                    assertx.ifError(null);
                });
            } catch (e) {
                threw = true;
                assertx.equal(e.message, 'Missing expected exception..');
            }

            assertx.ok(threw, 'null threw error');

            try {
                assertx.equal(1, 2);
            } catch (e) {
                assertx.equal(e.toStringX(), 'AssertionError: 1 == 2');
            }

            try {
                assertx.equal(1, 2, 'oh no');
            } catch (e) {
                assertx.equal(e.toStringX(), 'AssertionError: oh no');
            }
        });
    });
}());
