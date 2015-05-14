var Backbone = require('./../core/backbone.js');
var _ = require('underscore');
var Chart = require('./Chart.js');
var TickStyle = require('./TickStyle.js');

var LineControls = Backbone.Model.extend({

    defaults: {
        thinLines: false,
        flipYAxis: false,
        startFromZero: false,
        nice: false,
        tickStyleX: TickStyle.AUTO,
        tickStyleY: TickStyle.AUTO
    },

    overrideConfig: function (config) {
        config.numberAxisOrient = this.attributes.flipYAxis ? 'left' : 'right';
        config.y.zeroOrigin = config.falseOrigin = !this.attributes.startFromZero;
        config.y.flip = this.attributes.flipYAxis;
        config.niceValue = this.attributes.nice;
        config.lineThickness = this.attributes.thinLines ? 'small' : 'medium';
        return config;
    }

});


module.exports = LineControls;
