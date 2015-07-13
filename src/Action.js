/**
 * @file action of component
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('lodash');
    var $k = require('./k');
    var util = require('./lib/util');
    var EventTarget = require('mini-event/EventTarget');
    var eoo = require('eoo');
    var Promise = require('promise');
    var cache = require('./cache');
    var Model = require('emc/Model');
    var preservedAttributes = require('./preservedAttributes');

    /**
     * basic action process Class
     * @class component.Action
     */
    var overrides = {

        $: function (query) {
            return $k.$(query, this.el);
        },

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

            me.el['k-component'] = true;

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
                me.initBehavior();
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

            // there is some default watching attributes that is preserved
            if (preservedAttributes[attrName]) {
                preservedAttributes[attrName].call(this, newVal, oldVal);
                return;
            }

            var attributes = this.getAttributes();
            if (attributes && 'function' === typeof attributes[attrName] && oldVal !== newVal) {
                attributes[attrName].call(this, newVal, oldVal);
            }
            // if is data-*
            if (/^data\-/.test(attrName) && oldVal !== newVal) {
                var key = _.camelCase(attrName.replace(/^data\-/g, ''));
                this.model.set(key, newVal);
            }
        },

        /**
         * process behavior
         *
         * @method initBehavior
         */
        initBehavior: _.noop,

        /**
         * bind dom events
         *
         * @method bindEvents
         */
        bindEvents: _.noop,

        /**
         * get parent component
         * @return {component.Action} parent component
         */
        getParent: function () {
            var p = this.el;
            while (p !== document.body) {
                p = p.parentNode || p.host;
                if (!p) {
                    return;
                }
                if (p['k-component']) {
                    return $k.get(p);
                }
            }
        },

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
         * getter
         *
         * @param {string} propName property name to get
         *
         * @return {*} value of the property
         */
        get: function (propName) {
            return this[propName];
        },

        /**
         * setter
         *
         * @param {string} propName property name to set
         * @param {*} newVal value to set
         */
        set: function (propName, newVal) {
            this[propName] = newVal;
        },

        /**
         * dispose process
         *
         * @method dispose
         */
        dispose: function () {
            var body = document.getElementsByTagName('body')[0];
            this.data = null;
            this.content = '';
            body.remove(this.el);
            this.destroyEvents();
        }
    };

    var Action = eoo.create(EventTarget, overrides);

    return Action;
});
