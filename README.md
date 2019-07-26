<a
  href="https://travis-ci.org/Xotic750/assert-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/assert-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a
  href="https://david-dm.org/Xotic750/assert-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/assert-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/assert-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/assert-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a
  href="https://badge.fury.io/js/assert-x"
  title="npm version">
<img src="https://badge.fury.io/js/assert-x.svg"
  alt="npm version" height="18">
</a>
<a
  href="https://www.jsdelivr.com/package/npm/assert-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/assert-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>
<a
  href="https://bettercodehub.com/results/Xotic750/assert-x"
  title="bettercodehub score">
<img src="https://bettercodehub.com/edge/badge/Xotic750/assert-x?branch=master"
  alt="bettercodehub score" height="18">
</a>

<a name="module_assert-x"></a>

## assert-x

A Javascript assertion library.

**See**: https://nodejs.org/dist/latest-v12.x/docs/api/assert.html

This is legacy mode by default.

**See**:https://nodejs.org/dist/latest-v12.x/docs/api/assert.html#assert_legacy_mode

- [assert-x](#module_assert-x)
  - [~AssertionError](#module_assert-x.AssertionError) ⇐ <code>Error</code>
    - [`new AssertionError([message])`](#new_module_assert-x.AssertionError_new)
  - [`~deepEqual`](#module_assert-x.deepEqual)
  - [`~deepStrictEqual`](#module_assert-x.deepStrictEqual)
  - [`~doesNotThrow`](#module_assert-x.doesNotThrow)
  - [`~equal`](#module_assert-x.equal)
  - [`~fail`](#module_assert-x.fail)
  - [`~ifError`](#module_assert-x.ifError)
  - [`~notDeepEqual`](#module_assert-x.notDeepEqual)
  - [`~notDeepStrictEqual`](#module_assert-x.notDeepStrictEqual)
  - [`~notEqual`](#module_assert-x.notEqual)
  - [`~notStrictEqual`](#module_assert-x.notStrictEqual)
  - [`~ok`](#module_assert-x.ok)
  - [`~strictEqual`](#module_assert-x.strictEqual)
  - [`~throws`](#module_assert-x.throws)
  - [`~$assert(value, message)`](#module_assert-x.$assert)

Strict mode is available.

**See**: https://nodejs.org/dist/latest-v12.x/docs/api/assert.html#assert_strict_mode

<a name="module_assert-x.AssertionError"></a>

### assert-x~AssertionError ⇐ <code>Error</code>

**Kind**: inner class of [<code>assert-x</code>](#module_assert-x)  
**Extends**: <code>Error</code>  
<a name="new_module_assert-x.AssertionError_new"></a>

#### `new AssertionError([message])`

Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.

| Param     | Type                | Description                      |
| --------- | ------------------- | -------------------------------- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_assert-x.deepEqual"></a>

### `assert-x~deepEqual`

Tests for deep equality, coercive equality with the equal comparison
operator ( == ) and equivalent.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.deepStrictEqual"></a>

### `assert-x~deepStrictEqual`

Tests for deep equality, coercive equality with the equal comparison
operator ( === ) and equivalent.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.doesNotThrow"></a>

### `assert-x~doesNotThrow`

Expects block not to throw an error, see assert~throws for details.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                     | Description                                   |
| --------- | ------------------------ | --------------------------------------------- |
| block     | <code>function</code>    | The function block to be executed in testing. |
| [error]   | <code>constructor</code> | The comparator.                               |
| [message] | <code>string</code>      | Text description of test.                     |

<a name="module_assert-x.equal"></a>

### `assert-x~equal`

Tests shallow, coercive equality with the equal comparison
operator ( == ).

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.fail"></a>

### `assert-x~fail`

Throws an exception that displays the values for actual and expected
separated by the provided operator.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)  
**Throws**:

- <code>Error</code> Throws an `AssertionError`.

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |
| operator  | <code>string</code> | The compare operator.                         |

<a name="module_assert-x.ifError"></a>

### `assert-x~ifError`

Tests if value is not a falsy value, throws if it is a truthy value.
Useful when testing the first argument, error in callbacks.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)  
**Throws**:

- <code>\*</code> The value `err` if truthy.

| Param | Type            | Description                            |
| ----- | --------------- | -------------------------------------- |
| err   | <code>\*</code> | The value to be tested for truthiness. |

<a name="module_assert-x.notDeepEqual"></a>

### `assert-x~notDeepEqual`

Tests for any deep inequality. Opposite of `deepEqual`.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.notDeepStrictEqual"></a>

### `assert-x~notDeepStrictEqual`

Tests for deep inequality. Opposite of `deepStrictEqual`.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.notEqual"></a>

### `assert-x~notEqual`

Tests shallow, coercive non-equality with the not equal comparison
operator ( != ).

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.notStrictEqual"></a>

### `assert-x~notStrictEqual`

Tests strict non-equality, as determined by the strict not equal
operator ( !== ).

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.ok"></a>

### `assert-x~ok`

Tests if value is truthy, it is equivalent to
`equal(!!value, true, message)`.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| value     | <code>\*</code>     | The value to be tested.   |
| [message] | <code>string</code> | Text description of test. |

<a name="module_assert-x.strictEqual"></a>

### `assert-x~strictEqual`

Tests strict equality, as determined by the strict equality
operator ( === ).

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| actual    | <code>\*</code>     | The actual value to be tested.                |
| expected  | <code>\*</code>     | The expected value to compare against actual. |
| [message] | <code>string</code> | Text description of test.                     |

<a name="module_assert-x.throws"></a>

### `assert-x~throws`

Expects block to throw an error. `error` can be constructor, regexp or
validation function.

**Kind**: inner property of [<code>assert-x</code>](#module_assert-x)

| Param     | Type                                                                     | Description                                   |
| --------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| block     | <code>function</code>                                                    | The function block to be executed in testing. |
| [error]   | <code>constructor</code> \| <code>RegExp</code> \| <code>function</code> | The comparator.                               |
| [message] | <code>string</code>                                                      | Text description of test.                     |

<a name="module_assert-x.$assert"></a>

### `assert-x~$assert(value, message)`

Tests if value is truthy, it is equivalent to `equal(!!value, true, message)`.

**Kind**: inner method of [<code>assert-x</code>](#module_assert-x)

| Param   | Type                | Description               |
| ------- | ------------------- | ------------------------- |
| value   | <code>\*</code>     | The value to be tested.   |
| message | <code>string</code> | Text description of test. |
