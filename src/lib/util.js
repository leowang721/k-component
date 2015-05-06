/**
 * @file util methods
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {

    var _ = require('lodash');

    /**
     * util methods
     * @class component.lib.util
     * @type {Object}
     */
    var util = {

        /**
         * check if it's a XML doc
         *
         * @param {Document} doc document node
         *
         * @return {boolean} if it's a XML doc
         */
        isXML: function (doc) {
            return doc.createElement('p').nodeName !== doc.createElement('P').nodeName;
        },

        /**
         * check if param 1 contains param 2
         *
         * @param {HTMLElement} a param 1
         * @param {HTMLElement} b param 2
         * @param {boolean} same if allows a === b
         *
         * @return {boolean} if param 1 contains param 2
         */
        contains: function (a, b, same) {
            if (a === b) {
                return !!same;
            }
            if (!b.parentNode) {
                return false;
            }
            if (a.contains) {
                return a.contains(b);
            }
            else if (a.compareDocumentPosition) {
                // 000000 0 same
                // 000001 1 not in the same doc
                // 000010 2 after
                // 000100 4 before
                // 001000 8 contains by
                // 010000 16 contains
                // 100000 32 browser's private use
                // if a contains b, and a is before b, then result is 20
                return !!(a.compareDocumentPosition(b) & 16);
            }

            while ((b = b.parentNode)) {
                if (a === b) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * Generates a random GUID legal string of the given length.
     * @param {number} len 要生成串的长度
     * @return {string} 指定长度的16进制数随机串
     */
    function rand16Num(len) {
        len = len || 0;
        var result = [];
        for (var i = 0; i < len; i++) {
            result.push('0123456789abcdef'.charAt(
                Math.floor(Math.random() * 16))
            );
        }
        return result.join('');
    }

    /**
     * get a guid as 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
     * 其中每个 x 是 0-9 或 a-f 范围内的一个32位十六进制数
     * 第四版的GUID使用了新的算法，其产生的数字是一个伪随机数。
     * 它生成的GUID的第三组数字的第一位是4
     *
     * @return {string} 符合guid格式的字符串
     */
    util.guid = function() {
        var curr = (new Date()).valueOf().toString();
        return ['4b534c46',  // Fixed first group. and a trick, I've forgotten what it is.
                rand16Num(4),
                '4' + rand16Num(3),  // The first character of 3rd group is '4'.
                rand16Num(4),
                curr.substring(0, 12)].join('-');
    };

    /**
     * 生成一个唯一性的unique id串，在这里认为是guid的mini版本，并不是uuid
     * 保证因素：按照时间粒度的唯一性
     * so 生成算法是在当前时间戳的基础上增加随机数的方式
     *
     * @return {string} 一个16位的随机字符串
     */
    util.uid = function () {
        return [
            (new Date()).valueOf().toString(),  // 取前12位
            rand16Num(4)
        ].join('');
    };

    /**
     * 错误处理
     * @param {Error|Object|Event|string} ex 错误信息
     */
    util.processError = function (ex) {
        if (ex instanceof Error) {
            window.console.error(ex.stack);
        }
        else if (ex.error instanceof Error || _.isArray(ex.error)) {
            util.processError(ex.error);
        }
        else if (_.isArray(ex)) {
            _.each(ex, util.processError);
        }
        else if (ex instanceof require('mini-event/Event')
            && ex.type === 'error') {
            window.console.error(ex.error.failType, ex.error.reason, ex);
        }
        else {
            window.console.error(ex);
        }
    };

    return util;
});
