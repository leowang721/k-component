/**
 * @file action of component
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('underscore');
    var util = require('fc-core/util');
    var EventTarget = require('fc-core/EventTarget');
    var oo = require('fc-core/oo');
    var Promise = require('fc-core/Promise');
    var $k = require('./k');
    var cache = require('./cache');

    /**
     * basic action process Class
     * @class component.Action
     */
    var overrides = {
        /**
         * constructor
         *
         * @constructor
         *
         * @param {Object?} opts options
         *
         */
        constructor: function (opts) {
            var me = this;
            opts = opts || {};

            me.el = opts.el;
            me.content = opts.el.content;
            me.shadowRoot = opts.el.shadowRoot;

            me.data = cache.curry(me);

            me.el.setAttribute('data-guid', util.guid());

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

        /**
         * initialize methods which will be excuted after constructor
         *
         * @method initialize
         */
        initialize: _.noop,

        /**
         * prepare the data especially like ajax request
         *
         * @return {meta.Promise} promise
         */
        prepare: function () {
            return Promise.resolve();
        },

        /**
         * attributes to watch
         * @accessor
         * @type {Object}
         */
        attributes: {},

        /**
         * get the value of {@link #attributes}
         *
         * @method getAttributes
         *
         * @return {Object} {@link #attributes}
         */
        getAttributes: function () {
            return this.attributes || {};
        },

        /**
         * set the value of {@link #attributes}
         *
         * @method getAttributes
         *
         * @param {Object} newAttr new value of {@link #attributes}
         *
         */
        setAttributes: function (newAttr) {
            this.attributes = newAttr;
        },

        /**
         * attributeChangedCallback, process the attribute changed event using attributes
         *
         * @param {string} attrName the name of attribute
         * @param {?string} oldVal old value
         * @param {?string} newVal new value
         *
         */
        attributeChangedCallback: function (attrName, oldVal, newVal) {
            var attributes = this.getAttributes();
            if (attributes && 'function' === typeof attributes[attrName] && oldVal !== newVal) {
                attributes[attrName].call(this, oldVal, newVal);
            }
        },

        /**
         * bind dom events
         *
         * @method bindEvents
         */
        bindEvents: _.noop,

        /**
         * process error
         *
         * @param {string | Error} e error or message
         *
         */
        processError: function (e) {
            util.processError(e);
        },

        /**
         * private variable for parent component
         * @private
         * @type {?component.Action}
         */
        _parent: null,

        /**
         * get parent component, if it is exsited
         *
         * @return {?component.Action} parent component's el
         */
        parent: function () {
            if (this._parent) {
                return this._parent;
            }

            var p = this.el.parentNode;
            while (p && p !== document.body) {
                if ($k(p)) {
                    return $k(p);
                }
                p = p.parentNode;
            }
        },

        /**
         * get first level children component
         *
         * @return {Array.<component.Action>} first level children component
         */
        children: function () {
            // return this.el.children('[k-component]');
            var children = [];
            _.each(this.el.children, function (item) {
                if ($k(item)) {
                    children.push($k(item));
                }
            });

            return children;
        },

        /**
         * dispose process
         *
         * @method dispose
         */
        dispose: _.noop
    };

    var Action = oo.derive(EventTarget, overrides);

    return Action;
});
