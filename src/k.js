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

    var isSupportShadowDOM = !!document.body.createShadowRoot;  // support shadow DOM?

    var getAction = function (el) {
        return cache._data(el, config.CACHED_ACTION_KEY);
    };

    function _$(query, condition) {
        if (typeof query === 'string') {
            var result = $(query, condition);
            if (isSupportShadowDOM) {
                // merge shadow
                result = $(_.toArray(result).concat(_.toArray($('::shadow ' + query, condition))));
            }
            return result;
        }
        return $(query, condition);
    }

    function initPromise(me, resolve, reject) {
        var promises = [];
        var eachEl;
        for (var i = 0, l = me.length; i < l; i++) {
            eachEl = me[i];
            if (eachEl.promise) {
                promises.push(eachEl.promise);
            }
        }

        if (promises.length > 0) {
            Promise.all(promises).then(resolve, reject);
        }
        else {
            resolve();
        }
    }

    function execute(methodName) {
        var me = this;
        var args = _.toArray(arguments).slice(1);
        var action;

        for (var i = 0, l = me.length; i < l; i++) {
            action = getAction(me[i]);
            // if (action && action[methodName]) {
            action[methodName].apply(action, args);
            // }
        }
    }

    var $k = function (el, condition) {
        var result = _$(el, condition);
        result.promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                initPromise(result, resolve, reject);
            }, 1);
        });

        result.then = function (onResolved, onRejected) {
            return result.promise.then(function () {
                execute.call(result, 'ready', onResolved);
            })['catch'](function () {
                execute.call(result, 'ready', onRejected);
            });
        };
        result['catch'] = function (onRejected) {
            return result.promise['catch'](function () {
                execute.call(result, 'ready', onRejected);
            });
        };

        // 覆盖 data，不使用 zepto 的，如果是 component
        result.data = function () {
            var args = [].slice.call(arguments);
            args.unshift('data');
            return result.promise.then(function () {
                execute.apply(result, args);
            })['catch'](function () {
                result.data.apply(result, args);
            });
        };

        return result;
    };

    return $k;
});
