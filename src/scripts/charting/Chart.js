var Backbone = require('./../core/backbone.js');
var DependantAxis = require('./DependantAxis.js');
var IndependantAxis = require('./IndependantAxis.js');
var Dataset = require('./Dataset.js');
var Axis = require('./Axis.js');

var Chart = Backbone.Model.extend({

    initialize: function () {
        this.xAxis = new IndependantAxis();
        this.yAxis = new DependantAxis({
            name: Axis.Y
        });
        this.zAxis = new DependantAxis({
            name: Axis.Z
        });
        this.xAxis.chart = this.yAxis.chart = this.zAxis.chart = this;
        this.unusedSeries = new Backbone.Collection();

        var currentAxisCol;

        this.listenTo(this.xAxis, 'change:property', function (model, property) {
            var previousXCol = currentAxisCol;

            currentAxisCol = !property ? null : this.xAxis.createColumn();

            function getCol(collection) {
                return !property ? null : collection.findWhere({property: property});
            }

            var column = getCol(this.yAxis.columns);

            if (column) {

                this.yAxis.columns.remove(column);

            } else {

                column = getCol(this.zAxis.columns);

                if (column) {
                    this.zAxis.columns.remove(column);
                } else {
                    column = getCol(this.unusedSeries);

                    if (column) {
                        this.unusedSeries.remove(column);
                    }

                }
            }

            if (previousXCol) {
                var typeInfo = previousXCol.get('typeInfo');
                if (typeInfo && typeInfo.predictedAxis === Axis.Y) {
                    this.yAxis.columns.add(previousXCol);
                } else if (typeInfo && typeInfo.predictedAxis === Axis.Z) {
                    this.zAxis.columns.add(previousXCol);
                } else {
                    this.unusedSeries.add(previousXCol);
                }
            }

        });

        function removeSeries(model) {

            // todo: before doing the tasks below you need to remove the listeners
            //          in the axis objects that set the model.collection
            // todo: dont add if the model being moved from one axis to another
            // todo: dont add if the model is being moved to the X Axis
            // todo: dont add is it's already being added to the unused series
            var isXAxis = currentAxisCol && (model.get('property') === this.xAxis.get('property'));

            if (!isXAxis) {
                model.collection = this.unusedSeries;
                this.unusedSeries.add(model);
            }
        }

        function addSeries(model) {
            this.unusedSeries.remove(model);
        }

        function resetSeries(collection) {
            var unused = this.unusedSeries;
            collection.forEach(function (m) {
                var d = unused.findWhere({property: m.get('property')});
                d && unused.remove(d);
            });
        }

        this.listenTo(this.yAxis.columns, 'remove', removeSeries);
        this.listenTo(this.zAxis.columns, 'remove', removeSeries);

        this.listenTo(this.yAxis.columns, 'add', addSeries);
        this.listenTo(this.zAxis.columns, 'add', addSeries);

        this.listenTo(this.yAxis.columns, 'reset', resetSeries);
        this.listenTo(this.zAxis.columns, 'reset', resetSeries);

        this.dataset = new Dataset();
    }

});

module.exports = Chart;
