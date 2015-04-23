/**
 * @file action of component
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var EventTarget = require('fc-core/EventTarget');
    var oo = require('fc-core/oo');
    var Promise = require('fc-core/Promise');

    var overrides = {
        constructor: function (opts) {
            var me = this;
            opts = opts || {};
            me.el = opts.el;
            me.initialize();

            try {
                me.prepare().then(function () {
                    me.bindEvents();
                }).catch(me.processError);
            }
            catch (e) {
                me.processError(e);
            }
        },
        initialize: _.noop,
        prepare: function () {
            return Promise.resolve();
        },
        attributes: {},
        getAttributes: function () {
            return this.attributes || {};
        },
        setAttributes: function (newAttributes) {
            this.attributes = newAttributes;
        },
        attributeChangedCallback: function (attrName, oldVal, newVal) {
            var attributes = this.getAttributes();
            if (attributes && 'function' === typeof attributes[attrName] && oldVal !== newVal) {
                attributes[attrName].call(this, oldVal, newVal);
            }
        },
        bindEvents: _.noop,
        processError: function (e) {
            fc.util.processError(e);
        },
        dispose: _.noop
    };

    var Action = oo.derive(EventTarget, overrides);

    return Action;
});
