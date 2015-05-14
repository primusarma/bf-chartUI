var Backbone = require('./../core/backbone.js');

function getKeyLabel(d) {
    var property = d.get('property');
    var label = d.get('label') || property;
    return {key: property, label: label};
}

var GraphicVariation = Backbone.Model.extend({

    defaults: {
        svg: null
    },

    initialize: function (attributes, options) {
        this.variation = options.variation;
        this.graphic = options.graphic;
        this.graphicType = options.graphicType;
        this.errors = new Backbone.Collection([]);
    },

    createConfig: function () {
        // FIXME: is it still necessary to make a copy of the data?
        var data = this.graphic.chart.dataset.get('rows').map(function (d) {
            return Object.create(d);
        });

        if (!data.length) return;

        var xAxisProperty = this.graphic.chart.xAxis.get('property');
        var yAxisProperties = this.graphic.chart.yAxis.columns.map(getKeyLabel);

        if (!xAxisProperty || !yAxisProperties.length) {
            return;
        }

        var g = this.graphic.toJSON();

        var config = {

            width: this.variation.get('width'),
            height: this.variation.get('height'),

            title: g.title,
            subtitle: g.subtitle,
            source: g.source,
            hideSource: g.noSource,
            footnote: g.footnote,

            data: data,
            dateParser: this.graphic.chart.xAxis.get('dateFormat'),

            x: {
                series: {
                    key: xAxisProperty,
                    label: xAxisProperty
                }
            },

            y: {
                series: yAxisProperties
            }

        };

        return this.graphicType.controls.overrideConfig(config);
    },

    toJSON: function () {

        var d = Backbone.Model.prototype.toJSON.call(this);

        d.graphic = this.graphic.toJSON();
        d.graphicType = this.graphicType.toJSON();
        d.variation = this.variation.toJSON();

        var svg = this.attributes.svg;

        if (!svg) {
            d.svg = null;
        } else {
            var svgRect = svg.getBoundingClientRect();
            d.svg = {
                width: svgRect.width,
                height: svgRect.height
            };
        }

        return d;
    }
});

module.exports = GraphicVariation;
