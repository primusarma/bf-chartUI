var RegionView = require('./../core/RegionView.js');
var ViewSeriesList = require('./ViewSeriesList.js');

var ViewSeriesControls = RegionView.extend({

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        this.dataImport = options.dataImport;
    },

    template: function () {
        return '<div data-region="added"></div><div data-region="not-added"></div>';
    },

    events: {
        'click [name="add-column"]': 'addColumn'
    },

    addColumn: function (event) {
        console.log('add column');
        var property = event.target.dataset.property;
        var model = this.model.chart.unusedSeries.findWhere({property: property});
        this.model.columns.add(model);
    },

    regions: {
        '[data-region="added"]': function () {
            return new ViewSeriesList({collection: this.model.columns});
        },
        '[data-region="not-added"]': function () {
            return new ViewSeriesList({
                collection: this.model.chart.unusedSeries,
                isUnusedCollection: true
            });
        }
    }

});

module.exports = ViewSeriesControls;
