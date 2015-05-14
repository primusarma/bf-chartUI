var RegionView = require('./../core/RegionView.js');
var Datatypes = require('./Datatypes.js');
var ViewDatatype = require('./ViewDatatype.js');
var ViewHighlight = require('./ViewHighlight.js');
var ViewSeriesControls = require('./ViewSeriesControls.js');

var ViewDependantAxisControls = RegionView.extend({

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:warningMessage', this.render);
        this.dataImport = options.dataImport;
        if (this.dataImport) {
            this.listenTo(this.dataImport.columns, 'change:axis', function (column, axis) {
                if (axis === 'X') {
                    this.render();
                }
            });
            this.listenTo(this.dataImport.columns, 'reset', this.render);
        }
    },

    className: 'view-single-axis',

    template: require('./../templates/axis.hbs'),

    regions: {
        '[data-region="series"]': function () {
            return new ViewSeriesControls({
                model: this.model,
                dataImport: this.dataImport
            });
        },
        '[data-region="datatype"]': function () {
            return new ViewDatatype({
                model: this.model,
                show: {categorical: false}
            });
        },
        '[data-region="highlight"]': function () {
            return new ViewHighlight({model: this.model});
        }
    },

    events: {
        submit: function (event) {
            event.preventDefault();
        }
    },

    bindings: {
        '[name="label"]': {
            observe: ['label', 'suggestedLabel'],
            onGet: function (values) {
                return values[0] || values[1];
            },
            onSet: function (value) {
                return [(value || '').trim(), this.model.get('suggestedLabel')];
            }
        },
        '[data-section-name="forecast"]': {
            observe: 'datatype',
            visible: Datatypes.isTime
        },
        '[data-section-name="label-format"]': {
            observe: 'datatype',
            visible: Datatypes.isNumeric
        },
        '[name="prefix"]': 'prefix',
        '[name="suffix"]': 'suffix'
    },

    render: function () {
        RegionView.prototype.render.apply(this, arguments);
        this.stickit();
        return this;
    }

});

module.exports = ViewDependantAxisControls;
