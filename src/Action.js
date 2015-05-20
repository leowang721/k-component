/**
 * @file action of component
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var _ = require('lodash');
    var $k = require('./k');
    var util = require('./lib/util');
    var Promise = require('promise');
    var cache = require('./cache');
    var preservedAttributes = require('./preservedAttributes');

    /**
     * basic action process Class
     *
     * @class component.Action
     * @constructor
     *
     * @param {Object?} opts options
     */
    function Action(opts) {
        var me = this;
        opts = opts || {};

        /**
         * root element
         * @member component.Action
         * @type {HTMLElement}
         */
        me.el = me.$(opts.el);

        me.el.attr('k-component', '');
        me.el.attr('data-guid', util.guid());

        /**
         * Add event handlers to the current host element
         *
         * ## usage
         * - on(type, [selector], function(e){ ... })  ⇒ self
         * - on(type, [selector], [data], function(e){ ... })  ⇒ self
         * - on({ type: handler, type2: handler2, ... }, [selector])  ⇒ self
         * - on({ type: handler, type2: handler2, ... }, [selector], [data])  ⇒ self
         *
         * @method on
         */
        me.on = me.el.on;

        /**
         * Adds an event handler that removes itself the first time it runs, ensuring that the handler only fires once
         *
         * ## usage
         * - one(type, [selector], function(e){ ... })  ⇒ self
         * - one(type, [selector], [data], function(e){ ... })  ⇒ self v1.1+
         * - one({ type: handler, type2: handler2, ... }, [selector])  ⇒ self
         * - one({ type: handler, type2: handler2, ... }, [selector], [data])  ⇒ self
         *
         * @method one
         */
        me.one = me.el.one;

        /**
         * Detach event handlers added with on
         *
         * ## usage
         * - off(type, [selector], function(e){ ... })  ⇒ self
         * - off({ type: handler, type2: handler2, ... }, [selector])  ⇒ self
         * - off(type, [selector])  ⇒ self
         * - off()  ⇒ self
         *
         * @method off
         */
        me.off = me.el.off;

        /**
         * Trigger the specified event on elements of the collection
         *
         * ##useage
         * - trigger(event, [args])
         *
         * @method trigger
         */
        me.trigger = me.el.trigger;

        /**
         * Like trigger, but triggers only event handlers on current elements and doesn’t bubble.
         *
         * ##useage
         * - triggerHandler(event, [args])
         *
         * @method triggerHandler
         */
        me.triggerHandler = me.el.triggerHandler;

        /**
         * content element
         * @member component.Action
         * @type {HTMLElement}
         */
        me.content = me.$(opts.el.content);

        /**
         * shadowRoot element
         * @member component.Action
         * @type {HTMLElement}
         */
        me.shadowRoot = me.$(opts.el.shadowRoot);

        /**
         * private data getter && setter, can also get data-* from #el
         * @member component.Action
         * @type {HTMLElement}
         */
        me.data = cache.curry(me.el);

        me.initialize();

        var html = me.content.html();

        /**
         * content render method
         * @member component.Action
         * @type {Function}
         */
        me.renderer = require('etpl').compile(html);

        /**
         * promise of current Action
         * @private
         * @member component.Action
         * @type {meta.Promise}
         */
        me.promise = new Promise(
            function (resolve, reject) {
                me.initBehavior();
                me.bindEvents();
                resolve();
            }
        );
    }

    Action.prototype = {

        constructor: Action,

        $: function (query) {
            return $k(query, this.el);
        },

        /**
         * initialize methods which will be excuted after constructor
         *
         * @method initialize
         */
        initialize: _.noop,

        /**
         * get data for renderer to use
         *
         * @return {Object} data for renderer to use
         */
        getRenderingData: function () {
            var data = this.data;
            var visit = function (propertyPath) {
                var path = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
                var propertyName = path.shift();
                var value = data.get(propertyName);

                while (value && (propertyName = path.shift())) {
                    value = value[propertyName];
                }

                return value;
            };

            return {get: visit, relatedModel: data};
        },

        /**
         * render content using #model
         */
        render: function () {
            this.content.html(this.renderer(this.getRenderingData()));
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

            if (this.get('disposed')) {
                return;
            }

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
                this.data.set(key, newVal);
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
         * prop getter
         *
         * @param {string} propName property name to get
         *
         * @return {*} value of the property
         */
        get: function (propName) {
            return this[propName];
        },

        /**
         * prop setter
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
            this.data = null;
            this.set('disposed', true);
        }
    };

    // console.log(Action.prototype.constructor)

    return Action;
});
