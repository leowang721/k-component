/**
 * @file activate $k in windows
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('underscore');
    var $ = require('./lib/zepto');
    var Promise = require('fc-core/Promise');
    var cache = require('./cache');
    var config = require('./config');

    // var _$k = window.$k;

    var getK = function (el) {
        return cache._data(el, config.CACHED_ACTION_KEY);
    };

    function K(query) {
        var me = this;

        if (typeof query === 'string') {
            me.target = $(query);
            // merge shadow
            me.target = $(_.toArray(me.target).concat(_.toArray($('::shadow ' + query))));
        }
        else {
            me.target = $(query);
        }
        var promises = [];
        _.each(me.target, function (item) {
            promises.push(item.promise);
        });
        me.components = [];
        me.promise = Promise.all(promises).then(function () {
            _.each(me.target, function (eachTarget) {
                me.components.push(getK(eachTarget));
            });
        });
    }


    K.prototype.then = function (method) {
        var me = this;
        me.target && me.promise.then(function () {
            method.apply(me, me.components);
        });
    };
    K.prototype.execute = function (methodName) {
        var me = this;
        var args = _.toArray(arguments).slice(1);
        me.target && me.promise.then(function () {
            _.each(me.components, function (item) {
                item[methodName].apply(item, args);
            });
        });
    };
    K.prototype.on = function () {
        var me = this;
        var args = _.toArray(arguments);
        me.target && me.promise.then(function () {
            _.each(me.components, function (item) {
                item.on.apply(item, args);
            });
        });
    };

    var $k = function (el) {
        return new K(el);
    };

    // window.$k.noConflict = function () {
    //     window.$k = _$k;
    //     return window.$k;
    // };

    return $k;
});
