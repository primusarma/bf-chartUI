var Backbone = require('./../core/backbone');

var GraphicType = Backbone.Model.extend({

    initialize: function (attributes, options) {
        this.graphic = options.graphic;
        this.variations = options.variations;
        this.controls = options.controls;
    },

    defaults: {
        typeName: ''
    }
});

module.exports = GraphicType;
