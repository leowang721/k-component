/**
 * @file registry center
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {

    var _ = require('lodash');
    var cache = require('./cache');

    // IE8 should do sth special to support, check demo/IE8.html
    require('custom-element-shim');

    var config = require('./config');
    var etpl = require('etpl');
    var Promise = require('promise');

    // register component.config#REGISTER_TAG
    /**
     * the prototype of register tag
     * @class component.registerTagPrototype
     * @type {Object}
     */
    var registerTagPrototype = {};

    var isSupportShadowDOM = !!document.body.createShadowRoot;  // support shadow DOM?

    var getK = function (el) {
        return cache._data(el, config.CACHED_ACTION_KEY);
    };

    /**
     * the customed element of component
     *
     * @class component.element
     */

    /**
     * on element created callback
     * @this current dom element
     */
    registerTagPrototype.createdCallback = function () {
        var tagName = this.getAttribute('name');
        var template = this.querySelector('template');
        var actionPath = this.getAttribute('action');

        // register directly
        register(tagName, {
            template: template,
            actionPath: actionPath,
            createdCallback: function () {
                var me = this;
                this.setAttribute('k-component', true);
                processShadowRoot(this);
                me.promise = new Promise(function (resolve, reject) {
                    if (me.actionPath) {
                        Promise.require([me.actionPath]).then(function (Action) {
                            // promise sometimes returns Array, but othertimes returns Function...
                            if (_.isArray(Action)) {
                                Action = Action[0];
                            }
                            var action = new Action({
                                el: me
                            });
                            cache._data(me, config.CACHED_ACTION_KEY, action);
                            action.ready(function () {
                                resolve();
                            });
                        }).catch(reject);
                    }
                    else {
                        resolve();
                    }
                });
            },
            attachedCallback: function () {
            },
            detachedCallback: function () {
            },
            attributeChangedCallback: function (attrName, oldVal, newVal) {
                var me = this;
                me.promise && me.promise.then(function () {
                    getK(me) && getK(me).attributeChangedCallback(attrName, oldVal, newVal);
                });
            }
        });
    };

    function processShadowRoot (me) {
        var template = me.template;

        if (me.componentInited) {
            return;
        }

        if (isSupportShadowDOM) {
            var shadow = me.createShadowRoot();
            var clone = document.importNode(template.content, true);
            shadow.appendChild(clone);
            var content = shadow.querySelector('content');
            if (!content) {
                content = document.createElement('content');
                shadow.appendChild(content);
            }

            /**
             * content of element, hide the html structure we created
             * using component.content.innerHTML to get the html code like using shadowDOM
             * @member component.element
             * @type {HTMLElement}
             */
            me.content = me;
        }
        else {
            var fakeShadowRoot = document.createElement('fake-shadow-root');
            fakeShadowRoot.innerHTML = template.innerHTML;

            /**
             * shadowRoot of element, using component.element.shadowRoot to get full html with structure we created
             * @member component.element
             * @type {HTMLElement}
             */
            me.shadowRoot = fakeShadowRoot;
            me.appendChild(fakeShadowRoot);

            var content = fakeShadowRoot.querySelector('content');
            if (!content) {
                content = document.createElement('content');
                fakeShadowRoot.appendChild(content);
            }
            me.content = content;
            for (var i = me.childNodes.length - 1; i >= 0; i--) {
                if (me.childNodes[i].nodeType === 1 && me.childNodes[i].tagName.toLowerCase() === 'fake-shadow-root') {
                    continue;
                }
                if (content.childNodes.length === 0) {
                    content.appendChild(me.childNodes[i]);
                }
                else {
                    content.insertBefore(me.childNodes[i], content.firstChild);
                }
            }
        }

        me.componentInited = true;
    }

    /**
     * on element attched callback
     * @this current dom element
     */
    registerTagPrototype.attachedCallback = function () {
        // alert('attached');
    };

    register(config.REGISTER_TAG, registerTagPrototype);

    /**
     * do register custom element
     * @param  {string} name  tag name
     * @param  {Object=} protoExt the customed extra methods and properties of prototype
     */
    function register(name, protoExt) {
        document.registerElement(name, {
            prototype: _.extend(Object.create(HTMLElement.prototype), protoExt || {})
        });
    }


    /**
     * registry center
     * using component.registry to register component from HTML
     * @type {Object}
     */
    var registry = {
        registerFromHTML: function (html) {
            var container;
            // in IE 9, FF, etc. we can not use document fragment to trigger attachedCallback, so...
            container = getRegisterContaienr();  // will trigger attchedCallback
            // var etplEngine = new etpl.Engine();
            // var renderer = etplEngine.compile(html);
            // container.innerHTML = renderer({});
            container.innerHTML = html;
        }
    };

    function getRegisterContaienr() {
        var id = '$$$__register_temp_container__$$$';
        var container = document.getElementById(id);
        if (container) {
            return container;
        }
        container = document.createElement('div');
        container.id = id;
        container.style.width = 0;
        container.style.height = 0;
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
        return container;
    }

    return registry;
});
