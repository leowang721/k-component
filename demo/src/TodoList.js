/**
 * @file TodoList.js
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('lodash');
    var $ = require('k-component/lib/zepto');

    require('k-component/component!./todo-list');
    require('css!./todo-list.less');

    /**
     * TodoList.js
     * @class
     */
    var overrides = {

        /**
         * 事件绑定处理，直接使用 DOM 行为即可
         */
        bindEvents: function () {
            var me = this;
            $(me.el).on('click', 'li', function (e) {
                var target = $(e.target);
                var finished = target.attr('finished');
                target.attr('finished', finished ? null : true);
                me.fire('change');
            });

            var addNewInput = $('#new-todo-text', me.shadowRoot);
            var addNewSubmit = $('#new-todo-submit', me.shadowRoot);
            var doAdd = function () {
                var text = _.trim(addNewInput.val());
                if (text) {
                    $(me.content).append('<li>' + text + '</li>');
                    addNewInput.val('');
                    me.fire('change');
                }
            };

            addNewSubmit.on('click', function () {
                doAdd();
                addNewInput.focus();
            });
            addNewInput.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    doAdd();
                }
            });

            me.on('change', function () {
                console.log(me.getFinishedItems());
            });
        },

        /**
         * 属性监听配置
         * - key 为要监听的属性名
         * - value 为处理函数：{function(oldVal:string, newVal:string)}
         *
         * @type {Object}
         */
        attributes: {},

        getFinishedItems: function () {
            return $('[finished]', this.content);
        }
    };

    var TodoList = require('eoo').create(require('k-component/Action'), overrides);

    return TodoList;
});
