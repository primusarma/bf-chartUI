var Axis = require('./Axis.js');
var Datatype = require('./Datatypes.js');
var _ = require('underscore');
var Column = require('./Column.js');

var defaultDatatype = Datatype.TIME;

function convertPipelineIndexHeader(property, datatype) {
    if (property === '&') {
        if (Datatype.isCategorical(datatype)) {
            return 'Category';
        } else if (Datatype.isTime(datatype)) {
            return 'Time';
        }
    }
    return property;
}

var IndependantAxis = Axis.extend({

    initialize: function () {
        this.on('change:property', function (model, value) {
            this.set({
                suggestedLabel: convertPipelineIndexHeader(value, this.get('datatype')),
                label: null
            });
        });
    },

    defaults: _.extend({}, Axis.prototype.defaults, {
        name: Axis.X,
        datatype: defaultDatatype
    }),

    useColumn: function (column) {

        if (!column) {
            this._column = null;
            this.set('property', null);
            return;
        }

        var typeInfo = column.get('typeInfo');
        var datatype = typeInfo && typeInfo.datatype ? typeInfo.datatype : defaultDatatype;
        var dateFormat = Datatype.isTime(datatype) && typeInfo ? typeInfo.mostPopularDateFormat : null;
        this._column = column;

        this.set({
            property: column.get('property'),
            datatype: datatype,
            dateFormat: dateFormat
        });
    },

    createColumn: function () {
        var attributes = _.extend({}, this._column.attributes);
        attributes.property = this.attributes.property;
        attributes.datatype = this.attributes.datatype;
        attributes.label = this.attributes.label || this.attributes.property;
        attributes.axis = Axis.X;
        return new Column(attributes);
    }
});

module.exports = IndependantAxis;
