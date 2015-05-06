/**
 * @file action of component
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('lodash');
    var util = require('./lib/util');
    var EventTarget = require('mini-event/EventTarget');
    var eoo = require('eoo');
    var Promise = require('promise');
    var cache = require('./cache');
    var Model = require('emc/Model');

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

            /**
             * root element
             * @member component.Action
             * @type {HTMLElement}
             */
            me.el = opts.el;

            /**
             * content element
             * @member component.Action
             * @type {HTMLElement}
             */
            me.content = opts.el.content;

            /**
             * shadowRoot element
             * @member component.Action
             * @type {HTMLElement}
             */
            me.shadowRoot = opts.el.shadowRoot;

            /**
             * private data getter && setter, can also get data-* from #el
             * @member component.Action
             * @type {HTMLElement}
             */
            me.data = cache.curry(me.el);

            me.el.setAttribute('data-guid', util.guid());

            me.initialize();

            var html = me.content.innerHTML;

            /**
             * content render method
             * @member component.Action
             * @type {Function}
             */
            me.renderer = require('etpl').compile(html);
            me.createModel();

            /**
             * promise of current Action
             * @private
             * @member component.Action
             * @type {meta.Promise}
             */
            this.promise = new Promise(function (resolve, reject) {
                me.bindEvents();
                resolve();
            });
        },

        /**
         * initialize methods which will be excuted after constructor
         *
         * @method initialize
         */
        initialize: _.noop,

        /**
         * create model, this model is for rendering content
         *
         * @return {meta.Model} #model
         */
        createModel: function () {

            /**
             * model for rendering content
             * @member component.Action
             * @type {meta.Model}
             */
            this.model = new Model();
            return this.model;
        },

        /**
         * get #model for renderer to use
         *
         * @return {meta.Model} #model for renderer to use
         */
        getModel: function () {
            return this.model.dump();
        },

        /**
         * render content using #model
         */
        render: function () {
            this.content.innerHTML = this.renderer(this.getModel());
        },

        /**
         * execute after initialize and before bindEvents
         *
         * @method ready
         *
         * @param {Function} method method to execute
         */
        ready: function (method) {
            this.promise.then(_.bind(method, this));
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
            // if is data-*
            if (/^data\-/.test(attrName) && oldVal !== newVal) {
                var key = _.camelCase(attrName.replace(/^data\-/g, ''));
                this.model.set(key, newVal);
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
         * dispose process
         *
         * @method dispose
         */
        dispose: function () {
            this.data = null;
            this.destroyEvents();
        }
    };

    var Action = eoo.create(EventTarget, overrides);

    return Action;
});
