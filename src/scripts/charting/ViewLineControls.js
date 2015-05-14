var Backbone = require('./../core/backbone.js');

var ViewLineControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/type-controls-line.hbs'),

    bindings: {
        '[name="startFromZero"]': 'startFromZero',
        '[name="thinLines"]': 'thinLines',
        '[name="flipYAxis"]': 'flipYAxis',
        '[name="nice"]': 'nice'
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit(this.model.controls);
        return this;
    }

});

module.exports = ViewLineControls;
