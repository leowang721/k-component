/**
 * @file a simple browser info module from mass
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var w = window;
    var ver = w.opera
        ? (opera.version().replace(/\d$/, '') - 0)
        : parseFloat((/(?:IE |fox\/|ome\/ion\/)(\d+\.\d)/.exec(navigator.userAgent) || [, 0])[1]);

    /**
     * a simple browser info module from mass
     *
     * @class component.lib.browser
     */
    var browser = {
        ie: !!w.VBArray && Math.max(document.documentMode || 0, ver),  // trident
        firefox: !!w.netscape && ver,  // Gecko
        opera: !!w.opera && ver,  // Kestrel for Presto 9.5, Carakan for 10
        chrome: !!w.chrome && ver,  // v8
        safari: /apple/i.test(navigator.vendor) && ver  // webcore
    };

    return browser;
});
