/*global module, require, process */

(function () {
    'use strict';

    var required = {
        utilx: require('util-x'),

        test: require('tape-compact')
    };

    if (required.utilx.strictEqual(process.env.ASSERTX_WHICH, '1')) {
        required.assertx = require('../lib/assert-x');
    } else {
        required.assertx = require('../lib/assert-x.min');
    }

    module.exports = required;
}());
