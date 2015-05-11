/**
 * @file some preserved attributes handler
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

define(function (require) {
    var $ = require('./lib/zepto');

    var preservedAttributes = {
        'hidden': function (newVal, oldVal) {
            if (newVal == null) {  // 要显示
                $(this.el).css({
                    height: 'auto',
                    visibility: 'visible'
                });
            }
            else {
                $(this.el).css({
                    height: 0,
                    visibility: 'hidden'
                });
            }
        }
    };

    return preservedAttributes;
});
