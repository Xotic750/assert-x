<a name="module_assert-x"></a>

## assert-x

[![Greenkeeper badge](https://badges.greenkeeper.io/Xotic750/assert-x.svg)](https://greenkeeper.io/)
<a href="https://travis-ci.org/Xotic750/assert-x"
title="Travis status">
<img src="https://travis-ci.org/Xotic750/assert-x.svg?branch=master"
alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/assert-x"
title="Dependency status">
<img src="https://david-dm.org/Xotic750/assert-x.svg"
alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/assert-x#info=devDependencies"
title="devDependency status">
<img src="https://david-dm.org/Xotic750/assert-x/dev-status.svg"
alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/assert-x" title="npm version">
<img src="https://badge.fury.io/js/assert-x.svg"
alt="npm version" height="18">
</a>

A Javascript assertion library.

**See**: https://nodejs.org/api/assert.html  
**Version**: 1.6.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  

* [assert-x](#module_assert-x)
    * [~AssertionError](#module_assert-x..AssertionError) ⇐ <code>Error</code>
        * [`new AssertionError([message])`](#new_module_assert-x..AssertionError_new)
    * [`~fail`](#module_assert-x..fail)
    * [`~truncate`](#module_assert-x..truncate) : <code>Object</code>
    * [`~assertIt(value, message)`](#module_assert-x..assertIt)
    * [`~deepEqual(actual, expected, [message])`](#module_assert-x..deepEqual)
    * [`~deepStrictEqual(actual, expected, [message])`](#module_assert-x..deepStrictEqual)
    * [`~doesNotThrow(block, [error], [message])`](#module_assert-x..doesNotThrow)
    * [`~equal(actual, expected, [message])`](#module_assert-x..equal)
    * [`~ifError(err)`](#module_assert-x..ifError)
    * [`~notDeepEqual(actual, expected, [message])`](#module_assert-x..notDeepEqual)
    * [`~notDeepStrictEqual(actual, expected, [message])`](#module_assert-x..notDeepStrictEqual)
    * [`~notEqual(actual, expected, [message])`](#module_assert-x..notEqual)
    * [`~notStrictEqual(actual, expected, [message])`](#module_assert-x..notStrictEqual)
    * [`~ok(value, [message])`](#module_assert-x..ok)
    * [`~strictEqual(actual, expected, [message])`](#module_assert-x..strictEqual)
    * [`~throws(block, [error], [message])`](#module_assert-x..throws)

<a name="module_assert-x..AssertionError"></a>

### assert-x~AssertionError ⇐ <code>Error</code>
**Kind**: inner class of [<code>assert-x</code>](#module_assert-x)  
**Extends**: <code>Error</code>  
<a name="new_module_assert-x..AssertionError_new"></a>

#### `new AssertionError([message])`
Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_assert-x..fail"></a>

### `assert-x~fail`
Throws an exception that displays the values for actual and expected
separated by the provided operator.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)  
**Throws**:

- <code>Error</code> Throws an `AssertionError`.


| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |
| operator | <code>string</code> | The compare operator. |

<a name="module_assert-x..truncate"></a>

### `assert-x~truncate` : <code>Object</code>
Allows `truncate` options of AssertionError to be modified. The
`truncate` used is the one from `lodash`.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)  
**See**: [https://github.com/Xotic750/truncate-x](https://github.com/Xotic750/truncate-x)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| length | <code>number</code> | <code>128</code> | The maximum string length. |
| omission | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The string to indicate text is omitted. |
| separator | <code>RegExp</code> \| <code>string</code> | <code>&#x27;&#x27;</code> | The pattern to truncate to. |

<a name="module_assert-x..assertIt"></a>

### `assert-x~assertIt(value, message)`
Tests if value is truthy, it is equivalent to
`equal(!!value, true, message)`.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to be tested. |
| message | <code>string</code> | message Text description of test. |

<a name="module_assert-x..deepEqual"></a>

### `assert-x~deepEqual(actual, expected, [message])`
Tests for deep equality, coercive equality with the equal comparison
operator ( == ) and equivalent.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..deepStrictEqual"></a>

### `assert-x~deepStrictEqual(actual, expected, [message])`
Tests for deep equality, coercive equality with the equal comparison
operator ( === ) and equivalent.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..doesNotThrow"></a>

### `assert-x~doesNotThrow(block, [error], [message])`
Expects block not to throw an error, see assert~throws for details.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| block | <code>function</code> | The function block to be executed in testing. |
| [error] | <code>constructor</code> | The comparator. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..equal"></a>

### `assert-x~equal(actual, expected, [message])`
Tests shallow, coercive equality with the equal comparison
operator ( == ).

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..ifError"></a>

### `assert-x~ifError(err)`
Tests if value is not a falsy value, throws if it is a truthy value.
Useful when testing the first argument, error in callbacks.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  
**Throws**:

- <code>\*</code> The value `err` if truthy.


| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | The value to be tested for truthiness. |

<a name="module_assert-x..notDeepEqual"></a>

### `assert-x~notDeepEqual(actual, expected, [message])`
Tests for any deep inequality. Opposite of `deepEqual`.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..notDeepStrictEqual"></a>

### `assert-x~notDeepStrictEqual(actual, expected, [message])`
Tests for deep inequality. Opposite of `deepStrictEqual`.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..notEqual"></a>

### `assert-x~notEqual(actual, expected, [message])`
Tests shallow, coercive non-equality with the not equal comparison
operator ( != ).

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..notStrictEqual"></a>

### `assert-x~notStrictEqual(actual, expected, [message])`
Tests strict non-equality, as determined by the strict not equal
operator ( !== ).

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..ok"></a>

### `assert-x~ok(value, [message])`
Tests if value is truthy, it is equivalent to
`equal(!!value, true, message)`.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to be tested. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..strictEqual"></a>

### `assert-x~strictEqual(actual, expected, [message])`
Tests strict equality, as determined by the strict equality
operator ( === ).

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x..throws"></a>

### `assert-x~throws(block, [error], [message])`
Expects block to throw an error. `error` can be constructor, regexp or
validation function.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)  

| Param | Type | Description |
| --- | --- | --- |
| block | <code>function</code> | The function block to be executed in testing. |
| [error] | <code>constructor</code> \| <code>RegExp</code> \| <code>function</code> | The comparator. |
| [message] | <code>string</code> | Text description of test. |

