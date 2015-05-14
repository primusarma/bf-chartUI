var CollectionView = require('./../core/CollectionView.js');
var RegionView = require('./../core/RegionView.js');
var GraphicVariation = require('./GraphicVariation.js');
var ViewGraphicVariation = require('./ViewGraphicVariation.js');
var Backbone = require('./../core/backbone.js');

var ViewGraphicTypes = CollectionView.extend({

    className: 'view-graphic-type-collection',

    itemView: CollectionView.extend({

        className: 'view-graphic-variation-collection',

        template: require('./../templates/graphic-type.hbs'),

        itemContainer: '[data-region="variations"]',

        createView: function (variation, index) {

            var gv = new GraphicVariation({}, {
                graphic: this.model.graphic,
                variation: variation,
                graphicType: this.model
            });

            return new this._ItemClass({model: gv});

        },

        itemView: ViewGraphicVariation

    }),

    events: {
        'click svg .chart-title, svg .chart-subtitle, svg .chart-footnote, svg .chart-source': 'selectElement'
    },

    selectElement: function (event) {
        var matches = event.currentTarget.className && event.currentTarget.className.baseVal.match(/\bchart\-(.+)/);
        if (matches && matches.length === 2) {
            Backbone.trigger('selectChartElement', matches[1]);
        }
    },

    createView: function (model, index) {

        return new this._ItemClass({
            model: model,
            collection: model.variations
        });

    },

});

module.exports = ViewGraphicTypes;
