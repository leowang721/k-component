/**
 * @file cache based on mass Framework
 *
 * @see [mass-Framework](https://github.com/RubyLouvre/mass-Framework/)
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('lodash');

    var owners = [];
    var caches = [];

    var rparse = /^(?:null|false|true|NaN|\{.*\}|\[.*\])$/;

    /**
     * cache based on mass Framework
     *
     * @class component.cache
     */
    var cacheUtil = {
        hasData: function(owner) {
            // 判定是否关联了数据
            return owners.indexOf(owner) > -1;
        },

        data: function(target, name, data) {
            // 读写用户数据
            return innerData(target, name, data);
        },

        _data: function(target, name, data) {
            // 读写内部数据
            return innerData(target, name, data, true);
        },

        removeData: function(target, name) {
            // 删除用户数据
            return innerRemoveData(target, name);
        },

        _removeData: function(target, name) {
            // 移除内部数据
            return innerRemoveData(target, name, true);
        },

        parseData: function(target, name, cache, value) {
            // 将HTML5 data-*的属性转换为更丰富有用的数据类型，并保存起来
            var data;
            var _eval;
            var key = _.camelize(name);
            if (cache && (key in cache)) {
                return cache[key];
            }
            if (arguments.length !== 4) {
                var attr = 'data-' + name.replace(/([A-Z])/g, '-$1').toLowerCase();
                value = target.getAttribute(attr);
            }
            if (typeof value === 'string') { // 转换 /^(?:\{.*\}|null|false|true|NaN)$/
                if (rparse.test(value) || +value + '' === value) {
                    _eval = true;
                }
                try {
                    data = _eval ? eval('0,' + value) : value;
                }
                catch (e) {
                    data = value;
                }
                if (cache) {
                    cache[key] = data;
                }
            }
            return data;
        },

        curry: function (target) {
            var toReturn = {
                get: _.partial(cacheUtil.data, target),
                set: function (name, data) {
                    var diffNew;
                    if (name && typeof name === 'object') {
                        // diff && fire
                        diffNew = determineDiff(name, toReturn.get());
                    }
                    else if (typeof name === 'string' && data !== void 0) {
                        diffNew = determineDiff(data, toReturn.get(name), name);
                    }

                    var diff;
                    if (_.keys(diffNew).length > 0) {
                        diff = {
                            newValue: diffNew,
                            oldValue: _.clone(toReturn.get())
                        };
                    }

                    // set
                    cacheUtil.data(target, name, data);

                    if (diff) {
                        toReturn.fire('change', diff);
                        _.each(diff.newValue, function (item, key) {
                            toReturn.fire('change:' + key, {
                                newValue: item,
                                oldValue: diff.oldValue[key]
                            });
                        });
                    }
                },
                // remove: _.partial(cacheUtil.removeData, target),
                remove: function (name) {
                    var toRemove = toReturn.get(name);
                    cacheUtil.removeData(target, name);
                    if (toRemove !== undefined) {
                        toReturn.fire('change:' + name, {
                            newValue: undefined,
                            oldValue: toRemove
                        });
                    }
                },
                hasData: _.partial(cacheUtil.hasData, target)
            };

            require('mini-event/EventTarget').enable(toReturn);
            return toReturn;
        }
        // 不想搞$.Object.merge，先去掉
        // mergeData: function(cur, src) {
        //     // 合并数据
        //     if (cacheUtil.hasData(cur)) {
        //         var oldData = cacheUtil._data(src);
        //         var curData = cacheUtil._data(cur);
        //         var events = oldData.events;
        //         $.Object.merge(curData, oldData);
        //         if (events) {
        //             curData.events = [];
        //             for (var i = 0, item; item = events[i++];) {
        //                 $.event.bind(cur, item);
        //             }
        //         }
        //     }
        // }
    };

    /**
     * 为目标对象指定一个缓存体
     *
     * @private
     *
     * @param {*} owner 目标对象
     *
     * @return {Object} 缓存体
     */
    function add(owner) {
        var index = owners.push(owner);
        return caches[index - 1] = {
            data: {}
        };
    }

    /**
     * 为目标对象读写数据
     *
     * @private
     *
     * @param {*} owner 目标对象
     * @param {Object|string} name ? 要处理的数据或数据包
     * @param {*} data ? 要写入的数据
     * @param {boolean} pvt ? 标识为内部数据
     *
     * @return {*}
     */
    function innerData(owner, name, data, pvt) { // IE678不能为文本节点注释节点添加数据
        var index = owners.indexOf(owner);
        var table = index === -1 ? add(owner) : caches[index];
        var getOne = typeof name === 'string';  // 取得单个属性
        var cache = table;
        // 私有数据都是直接放到table中，普通数据放到table.data中
        if (!pvt) {
            table = table.data;
        }

        // 修改，处理事件
        if (name && typeof name === 'object') {
            _.extend(table, name); // 写入一组属性
        }
        else if (getOne && data !== void 0) {
            table[name] = data;  // 写入单个属性
        }

        // 以下为数据返回
        if (getOne) {
            if (name in table) {
                return table[name];
            }
            else if (!pvt && owner && owner.nodeType === 1) {
                // 对于用HTML5 data-*属性保存的数据， 如<input id="test" data-full-name="Planet Earth"/>
                // 我们可以通过data("full-name")或data("fullName")访问到
                return cacheUtil.parseData(owner, name, cache);
            }
        }
        else {
            return table;
        }
    }
    /**
     * 为目标对象移除数据
     *
     * @private
     *
     * @param {*} owner 目标对象
     * @param {*} name ? 要移除的数据
     * @param {boolean} pvt ? 标识为内部数据
     *
     * @return {*}
     */
    function innerRemoveData(owner, name, pvt) {
        var index = owners.indexOf(owner);
        if (index > -1) {
            var delOne = typeof name === 'string';
            var table = caches[index];
            var cache = table;
            if (delOne) {
                if (!pvt) {
                    table = table.data;
                }
                if (table) {
                    delOne = table[name];
                    delete table[name];
                }
                // 在data_fix模块，我们已经对JSON进行补完
                if (JSON.stringify(cache) === '{"data":{}}') {
                    owners.splice(index, 1);
                    caches.splice(index, 1);
                }
            }
            return delOne; // 返回被移除的数据
        }
    }

    function determineDiff(newValue, oldValue, key) {
        var diff = {};

        if (key === undefined) {
            if (typeof oldValue === 'object' && typeof newValue === 'object') {
                _.each(newValue, function (item, eachKey) {
                    var currentDiff = determineDiff(newValue[eachKey], oldValue[eachKey], eachKey);
                    if (currentDiff !== undefined) {
                        diff[eachKey] = currentDiff;
                    }
                });
                return diff;
            }

            if (oldValue !== newValue) {
                return newValue;
            }
            return;
        }

        var result = determineDiff(newValue, oldValue);
        if (result !== undefined) {
            diff[key] = result;
        }
        return diff;
    }

    return cacheUtil;

});
