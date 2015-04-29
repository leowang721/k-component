/**
 * @file util methods
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
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

    return util;
});
