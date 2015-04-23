/**
 * @file a simple component loader for AMD
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

 define(
     function (require, exports, module) {
         'use strict';

         var config = require('k-component/config');
         var registry = require('k-component/registry');

         /**
          * @class component.loader
          * @requires component.config
          * @requires component.registry
          */
         return {
             /**
              * esl plugin method
              *
              * @param {string} resourceId path of resource to load
              * @param {Object} req request Object
              * @param {Function} load callback method
              */
             load: function (resourceId, req, load) {
                 /* istanbul ignore next */
                 var xhr = window.XMLHttpRequest
                     ? new XMLHttpRequest()
                     : new ActiveXObject('Microsoft.XMLHTTP');

                 xhr.open(
                     'GET',
                     req.toUrl(resourceId + '.' + config.LOADER_FILE_SUFFIX),
                     true
                 );

                 xhr.onreadystatechange = function () {
                     /* istanbul ignore else */
                     if (xhr.readyState === 4) {
                         /* istanbul ignore else */
                         if (xhr.status >= 200 && xhr.status < 300) {
                             var source = xhr.responseText;
                             registry.registerFromHTML(source);
                             load(source);
                         }

                         /* jshint -W054 */
                         xhr.onreadystatechange = new Function();
                         /* jshint +W054 */
                         xhr = null;
                     }
                 };

                 xhr.send(null);
             }
         };
     }
 );
