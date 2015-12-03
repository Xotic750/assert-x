<a name="module_assert-x"></a>
## assert-x
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

A Javascript assertion library. Works in ES3 environments if es5-shim is
loaded, which is recommended for all environments to fix native bugs.

**See**: https://nodejs.org/api/assert.html  
**Version**: 1.2.0  
**Author:** Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  

* [assert-x](#module_assert-x)
  * [`module.exports(value, message)`](#exp_module_assert-x--module.exports) ⏏
    * [~AssertionError](#module_assert-x--module.exports..AssertionError) ⇐ <code>Error</code>
      * [`new AssertionError([message])`](#new_module_assert-x--module.exports..AssertionError_new)
    * [`~fail`](#module_assert-x--module.exports..fail)
    * [`~ok(value, [message])`](#module_assert-x--module.exports..ok)
    * [`~notOk(value, [message])`](#module_assert-x--module.exports..notOk)
    * [`~equal(actual, expected, [message])`](#module_assert-x--module.exports..equal)
    * [`~notEqual(actual, expected, [message])`](#module_assert-x--module.exports..notEqual)
    * [`~deepEqual(actual, expected, [message])`](#module_assert-x--module.exports..deepEqual)
    * [`~notDeepEqual(actual, expected, [message])`](#module_assert-x--module.exports..notDeepEqual)
    * [`~deepStrictEqual(actual, expected, [message])`](#module_assert-x--module.exports..deepStrictEqual)
    * [`~notDeepStrictEqual(actual, expected, [message])`](#module_assert-x--module.exports..notDeepStrictEqual)
    * [`~strictEqual(actual, expected, [message])`](#module_assert-x--module.exports..strictEqual)
    * [`~notStrictEqual(actual, expected, [message])`](#module_assert-x--module.exports..notStrictEqual)
    * [`~throws(block, [error], [message])`](#module_assert-x--module.exports..throws)
    * [`~doesNotThrow(block, [error], [message])`](#module_assert-x--module.exports..doesNotThrow)
    * [`~ifError(err)`](#module_assert-x--module.exports..ifError)

<a name="exp_module_assert-x--module.exports"></a>
### `module.exports(value, message)` ⏏
Tests if value is truthy, it is equivalent to
`equal(!!value, true, message)`.

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to be tested. |
| message | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..AssertionError"></a>
#### module.exports~AssertionError ⇐ <code>Error</code>
**Kind**: inner class of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  
**Extends:** <code>Error</code>  
<a name="new_module_assert-x--module.exports..AssertionError_new"></a>
##### `new AssertionError([message])`
Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_assert-x--module.exports..fail"></a>
#### `module.exports~fail`
Throws an exception that displays the values for actual and expected
separated by the provided operator.

**Kind**: inner property of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  
**Throws**:

- <code>Error</code> Throws an `AssertionError`.


| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |
| operator | <code>string</code> | The compare operator. |

<a name="module_assert-x--module.exports..ok"></a>
#### `module.exports~ok(value, [message])`
Tests if value is truthy, it is equivalent to
`equal(!!value, true, message)`.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to be tested. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..notOk"></a>
#### `module.exports~notOk(value, [message])`
Specification extension.
Tests if value is truthy, it is equivalent to
`equal(!value, true, message)`.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to be tested. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..equal"></a>
#### `module.exports~equal(actual, expected, [message])`
Tests shallow, coercive equality with the equal comparison
operator ( == ).

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..notEqual"></a>
#### `module.exports~notEqual(actual, expected, [message])`
Tests shallow, coercive non-equality with the not equal comparison
operator ( != ).

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..deepEqual"></a>
#### `module.exports~deepEqual(actual, expected, [message])`
Tests for deep equality, coercive equality with the equal comparison
operator ( == ) and equivalent.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..notDeepEqual"></a>
#### `module.exports~notDeepEqual(actual, expected, [message])`
Tests for any deep inequality. Opposite of `deepEqual`.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..deepStrictEqual"></a>
#### `module.exports~deepStrictEqual(actual, expected, [message])`
Tests for deep equality, coercive equality with the equal comparison
operator ( === ) and equivalent.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..notDeepStrictEqual"></a>
#### `module.exports~notDeepStrictEqual(actual, expected, [message])`
Tests for deep inequality. Opposite of `deepStrictEqual`.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..strictEqual"></a>
#### `module.exports~strictEqual(actual, expected, [message])`
Tests strict equality, as determined by the strict equality
operator ( === ).

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..notStrictEqual"></a>
#### `module.exports~notStrictEqual(actual, expected, [message])`
Tests strict non-equality, as determined by the strict not equal
operator ( !== ).

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>\*</code> | The actual value to be tested. |
| expected | <code>\*</code> | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..throws"></a>
#### `module.exports~throws(block, [error], [message])`
Expects block to throw an error. `error` can be constructor, regexp or
validation function.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| block | <code>function</code> | The function block to be executed in testing. |
| [error] | <code>constructor</code> &#124; <code>RegExp</code> &#124; <code>function</code> | The comparator. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..doesNotThrow"></a>
#### `module.exports~doesNotThrow(block, [error], [message])`
Expects block not to throw an error, see assert~throws for details.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| block | <code>function</code> | The function block to be executed in testing. |
| [error] | <code>constructor</code> | The comparator. |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x--module.exports..ifError"></a>
#### `module.exports~ifError(err)`
Tests if value is not a falsy value, throws if it is a truthy value.
Useful when testing the first argument, error in callbacks.

**Kind**: inner method of <code>[module.exports](#exp_module_assert-x--module.exports)</code>  
**Throws**:

- <code>\*</code> The value `err` if truthy.


| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | The value to be tested for truthiness. |

