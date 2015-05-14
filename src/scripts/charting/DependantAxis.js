var Backbone = require('./../core/backbone.js');
var Axis = require('./Axis.js');
var _ = require('underscore');
var Datatypes = require('./Datatypes.js');

function captitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/^./, function (match) {
        return match.toUpperCase();
    });
}

var defaultDatatype = Datatypes.NUMERIC;

var DependantAxis = Axis.extend({
    initialize: function () {
        this.columns = new Backbone.Collection();

        var fn = (function (model) {
            model.set('axis', this.get('name'));
            model.collection = this.columns;
        }).bind(this);

        this.listenTo(this.columns, 'remove', function (model) {
            model.set('axis', Axis.NONE);
            model.collection = null;
        });
        this.listenTo(this.columns, 'add', fn);
        this.listenTo(this.columns, 'reset', function (collection) {
            collection.forEach(fn);
        });
        this.listenTo(this.columns, 'add remove reset', function () {
            var numCols = this.columns.length;
            var warning = '';
            if (numCols === 0) {
                this.set({
                    datatype: Datatypes.NONE,
                    suggestedLabel: ''
                });
            } else if (numCols === 1) {
                var column = this.columns.at(0);
                var typeInfo = column.get('typeInfo');
                this.set({
                    datatype: typeInfo.datatype,
                    suggestedLabel: captitalizeFirstLetter(column.get('property'))
                });
            } else if (numCols > 1) {
                var current;
                var last;
                var types = {};
                for (var i = numCols; i--;) {
                    current = this.columns.at(i).get('typeInfo').datatype;
                    if (last && current && current !== last) {
                        warning = 'Mismatching datatypes';
                        break;
                    }
                    if (!types[current]) {
                        types[current] = 1;
                    } else {
                        types[current] += 1;
                    }
                    last = current;
                }
                types = _.pairs(types).sort(function (a, b) {
                    return a[1] < b[1];
                });
                var mostPopularType = types.length ? types[0][0] : Datatypes.CATEGORICAL;
                this.set({
                    suggestedLabel: '',
                    datatype: mostPopularType
                });
            }
            this.set('warningMessage', warning);
        });
        this.listenTo(this.columns, 'all', function () {
            var length = this.columns ? this.columns.length : 0;
            this.set({hasSeries: !!length, multiseries: length > 1, numSeries: length});
        });
    },
    defaults: _.extend({}, Axis.prototype.defaults, {
        name: Axis.Y,
        datatype: defaultDatatype,
        hasSeries: false,
        multiseries: false,
        numSeries: 0,
    })
});

module.exports = DependantAxis;
