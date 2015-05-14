var Backbone = require('./../core/backbone.js');
var Help = require('./../help/index.js');

var ViewInlineHelp = Backbone.View.extend({
    render: function () {
        this.$el.popover({
            selector: '[data-help]',
            html: true,
            trigger: 'hover',
            content: function (el) {
                var dataset = this.dataset;
                var msg;
                if (dataset && dataset.help && dataset.help in Help) {
                    msg = Help[dataset.help];
                    if (typeof msg !== 'function') {
                        return msg;
                    }
                    try {
                        return msg(dataset);
                    } catch (tmplError) {
                        console.log('Error parsing Help template', dataset.help, msg);
                        return null;
                    }
                }
                return null;
            }
        });

        this.$el.tooltip({
            selector: '[rel="tooltip"]'
        });
        return this;
    }
});

ViewInlineHelp.init = function () {
    (new ViewInlineHelp({el: document.body})).render();
};

module.exports = ViewInlineHelp;



