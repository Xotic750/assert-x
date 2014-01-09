/*global module, require, process */

(function () {
    'use strict';

    var required = {};

    if ('1' === process.env.ASSERTX_WHICH) {
        required.assertx = require('../lib/assert-x.min');
    } else {
        required.assertx = require('../lib/assert-x');
    }

    module.exports = required;
}());
