var Backbone = require('./core/backbone');
var Graphic = require('./charting/Graphic.js');
var ViewGraphicControls = require('./charting/ViewGraphicControls.js');
var ViewGraphicTypes = require('./charting/ViewGraphicTypes.js');
var GraphicType = require('./charting/GraphicType.js');
var DataImport = require('./charting/DataImport.js');
var ViewImportData = require('./charting/ViewImportData.js');
var ViewInlineHelp = require('./charting/ViewInlineHelp.js');
var ViewSelectedVariation = require('./charting/ViewSelectedVariation.js');
var Variations = require('./charting/Variations.js');
var LineControls = require('./charting/LineControls.js');
var transform = require('./transform/index.js');
var Datatypes = require('./charting/Datatypes.js');
var fontFix = require('./export/svgDataURI.js').fontFix;
var Authentication = require('./utils/authentication.js');

var _ = require('underscore');
var $ = require('jquery');
var version = require('./utils/version');

function init() {

    var graphic = new Graphic();
    var importdata = new DataImport();
    var graphicControls = new ViewGraphicControls({model: graphic, dataImport: importdata});

    document.getElementById('controls').appendChild(graphicControls.render().el);

    var types = new Backbone.Collection([
        new GraphicType({
            typeName: 'Line'
        }, {
            graphic: graphic,
            controls: new LineControls(),
            variations: Variations
        })
    ]);

    var charts = new ViewGraphicTypes({collection: types});
    document.getElementById('charts').appendChild(charts.render().el);

    var viewSelectedVariation;
    Backbone.on('selectVariation', function (variation) {
        if (viewSelectedVariation) {
            if (viewSelectedVariation.model === variation) {
                return;
            } else {
                viewSelectedVariation.remove();
            }
        }

        if (!variation || !variation.get('svg')) {
            return;
        }

        viewSelectedVariation = new ViewSelectedVariation({model: variation});
        viewSelectedVariation.render();
        document.getElementById('selection').appendChild(viewSelectedVariation.el);
    });

    importdata.on('change:pipelineOptions', function (model, pipelineOption) {
        if (!pipelineOption) {
            graphic.set(graphic.defaults);
            return;
        }
        var expectedValues = _.pick(pipelineOption, 'title', 'subtitle', 'source', 'footnote');
        graphic.set(expectedValues);
    });

    importdata.on('change:data', function (model, data) {
        graphic.chart.dataset.set('rows', data);
    });

    var importdataView = new ViewImportData({model: importdata});
    document.getElementById('controls').appendChild(importdataView.render().el);

    var setColumnAxis = function (column, value) {
        column.collection = null;
        var oldValue;
        var newValue = column.get('axis');
        if (typeof column._previousAttributes.axis !== 'undefined') {
            oldValue = column._previousAttributes.axis;
            if (oldValue && (newValue !== oldValue)) {
                if (oldValue === 'Y') {
                    graphic.chart.yAxis.columns.remove(column);
                } else if (oldValue === 'Z') {
                    graphic.chart.zAxis.columns.remove(column);
                }
            }
        }
        if (newValue) {
            if (newValue === 'Y') {
                graphic.chart.yAxis.columns.add(column);
            } else if (newValue === 'Z') {
                graphic.chart.zAxis.columns.add(column);
            }
        }
    };

    importdata.columns.on('change:axis', setColumnAxis);
    importdata.columns.on('reset', function () {

        var dims = {};

        importdata.columns.each(function (column) {
            var d = column.get('axis') || 'NONE';
            if (!dims[d]) dims[d] = [];
            d.collection = null;
            dims[d].push(column);
        });

        graphic.chart.unusedSeries.reset(dims.NONE || []);

        if (dims.X && dims.X.length) {
            graphic.chart.xAxis.useColumn(dims.X[0]);
        } else {
            graphic.chart.xAxis.set(graphic.chart.xAxis.defaults);
        }
        graphic.chart.yAxis.columns.reset(dims.Y || []);
        graphic.chart.zAxis.columns.reset(dims.Z || []);

    });

    // REFACTOR: isOther modelling is rubbish, doesn't really work.
    graphic.chart.yAxis.columns.on('change:isOther', function (model) {
        console.log('IS OTHERS', this.findWhere({isOther: true}));
    });

    function revertColumn(array, property) {
        var originalData = importdata.get('originalData');
        return array.map(function (d, i) {
            d[property] = originalData[i][property];
            return d;
        });
    }

    // REFACTOR: this logic should be in a model somewhere.
    graphic.chart.xAxis.on('change:datatype change:dateFormat', function (model) {

        var property = model.get('property');
        var datatype = model.get('datatype');
        var currentDataset = importdata.get('data');
        var dateFormat = model.get('dateFormat');
        var revertedDataset = revertColumn(currentDataset, property);

        //transform the data
        if (Datatypes.isNumeric(datatype)) {
            transform.series(revertedDataset, property, transform.number());
        } else if (Datatypes.isTime(datatype) && dateFormat) {
            transform.series(revertedDataset, property, transform.time(dateFormat));
        }

        graphic.chart.dataset.set('rows', revertedDataset);
    });

    importdata.columns.each(setColumnAxis);

    ViewInlineHelp.init();

    // FIXME: this is a quick fix to the font rendering issue on the png exports
    //        find out why we need this and if there's a better way to fix.
    document.body.appendChild(fontFix());

    // REFACTOR: move this into a separate application
    if (document.location.hash === '#test') {
        var fs = require('fs');
        var samplePipeline = fs.readFileSync(__dirname + '/sampledata/BigChinaSlowdown.txt', 'utf8');
        importdata.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    }
}

function nightingale() {
    var auth = new Authentication(init);
    auth.renderButton();
    return {
        version: version,
        oChartsVersion: require('o-charts').version
    };
}

module.exports = window.nightingale = nightingale;
