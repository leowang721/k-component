/**
 * @file activate $k in windows
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var cache = require('./cache');
    var config = require('./config');

    // var _$k = window.$k;

    var $k = function (el) {
        if (cache.hasData(el)) {
            return cache._data(el, config.CACHED_ACTION_KEY);
        }
    };

    // window.$k.noConflict = function () {
    //     window.$k = _$k;
    //     return window.$k;
    // };

    return $k;
});
