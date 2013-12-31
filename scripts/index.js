/*global module, require, process */

(function () {
    'use strict';

    var required = {
        utilx: require('util-x')
    };

    if (required.utilx.strictEqual(process.env.ASSERTX_WHICH, '1')) {
        required.assertx = require('../lib/assert-x.min');
    } else {
        required.assertx = require('../lib/assert-x');
    }

    module.exports = required;
}());
