var Backbone = require('./../core/backbone.js');
var _ = require('underscore');
var Chart = require('./Chart.js');

var Graphic = Backbone.Model.extend({

    initialize: function () {
        this.chart = new Chart();
    },

    defaults: {
        title: 'Untitled chart',
        subtitle: '',
        source: '',
        footnote: '',
        noSource: false
    },

    subtitleSuggestion: function (save) {
        var label = this.chart.yAxis.get('label') || this.chart.yAxis.get('suggestedLabel');
        var units = this.chart.yAxis.get('prefix') + this.chart.yAxis.get('suffix');
        var result;

        if (label) {
            result = !units ? label : label + ' (' + units + ')';
            if (save) {
                this.set('subtitle', result);
            }
        }

        return result;
    }
});

module.exports = Graphic;
