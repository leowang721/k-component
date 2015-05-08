/**
 * @file activate $k in windows
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('lodash');
    var $ = require('./lib/zepto');
    var Promise = require('promise');
    var cache = require('./cache');
    var config = require('./config');

    // var _$k = window.$k;

    var isSupportShadowDOM = !!document.body.createShadowRoot;  // support shadow DOM?
    var getK = function (el) {
        return cache._data(el, config.CACHED_ACTION_KEY);
    };

    var $k = function (el) {
        return new K(el);
    };

    $k.get = getK;

    $k.$ = function (query, condition) {
        if (typeof query === 'string') {
            var result = $(query, condition);
            if (isSupportShadowDOM) {
                // merge shadow
                result = $(_.toArray(result).concat(_.toArray($('::shadow ' + query, condition))));
            }
            return result;
        }
        return $(query, condition);
    };

    function K(query) {
        var me = this;

        if (typeof query === 'string') {
            me.target = $k.$(query);
        }
        else {
            me.target = $(query);
        }

        var promises = [];
        _.each(me.target, function (item) {
            if (!item.promise) {
                setTimeout((function (promise) {
                    promises.push(promise);
                })(item.promise), 1);
            }
            else {
                promises.push(item.promise);
            }
        });
        me.components = [];
        me.promise = Promise.all(promises).then(function () {
            var index = 0;
            _.each(me.target, function (eachTarget) {
                me[index++] = getK(eachTarget);
                me.components.push(getK(eachTarget));
            });
        });
    }

    K.prototype.execute = function (methodName) {
        var me = this;
        var args = _.toArray(arguments).slice(1);
        me.target && me.promise.then(function () {
            _.each(me.components, function (item) {
                item[methodName].apply(item, args);
            });
        });
    };

    /**
     * 注册一个事件处理函数
     *
     * @param {string} type 事件的类型
     * @param {Function | boolean} fn 事件的处理函数，
     * 特殊地，如果此参数为`false`，将被视为特殊的事件处理函数，
     * 其效果等于`preventDefault()`及`stopPropagation()`
     * @param {Mixed} [thisObject] 事件执行时`this`对象
     * @param {Object} [options] 事件相关配置项
     * @param {boolean} [options.once=false] 控制事件仅执行一次
     */
    K.prototype.on = function (type, fn, thisObject, options) {
        var args = [].slice.call(arguments);
        args.unshift('on');
        this.execute.apply(this, args);
    };

    /**
     * Action ready 后执行一个函数处理
     *
     * @param {Function} fn 要执行的处理函数
     */
    K.prototype.ready = function (fn) {
        var args = [].slice.call(arguments);
        args.unshift('ready');
        this.execute.apply(this, args);
    };

    // window.$k.noConflict = function () {
    //     window.$k = _$k;
    //     return window.$k;
    // };

    return $k;
});
