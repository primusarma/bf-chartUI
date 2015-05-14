var Backbone = require('./../core/backbone.js');
var $ = require('jquery');
var linechart = require('o-charts').chart.line;
var d3 = require('d3');
var _ = require('underscore');

//todo: variation -- to variant
var ViewGraphicVariation = Backbone.View.extend({

    initialize: function (options) {
        this.chart = linechart();
        var debounced = _.bind(_.debounce(this.render, 50), this);
        this.listenTo(this.model.graphic, 'change', debounced);
        this.listenTo(this.model.graphic.chart.xAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis.columns, 'change add', debounced);
        this.listenTo(this.model.graphicType.controls, 'change', debounced);
        this.listenTo(this.model.graphic.chart.dataset, 'change:rows', debounced);
        this.listenTo(this.model.errors, 'reset', this.renderErrors);
        _.bindAll(this, 'reportErrors');
    },

    className: 'view-graphic-variation',

    template: require('./../templates/graphic.hbs'),

    events: {
        'click .graphic-container>svg.graphic': 'select'
    },

    select: function (event) {
        Backbone.trigger('selectVariation', this.model, event.currentTarget);
    },

    empty: function () {
        this.el.innerHTML = '';
        this.el.style.display = 'none';
    },

    renderErrors: function (errors) {
        if (!this.svg) return;
        if (!errors || !errors.length) {
            this.svg.classList.remove('error');
        } else {
            this.svg.classList.add('error');
        }
    },

    reportErrors: function (errors) {
        this.model.errors.reset(Array.isArray(errors) ? errors : [errors]);
    },

    render: function () {

        var config = this.model.createConfig();

        if (!config) {
            this.empty();
            return;
        }

        this.el.innerHTML = this.template();
        this.svg = this.el.querySelector('.graphic-container');
        var selectionBorderWidth = 3 * 2; // 3px on the left, 3px on the right

        this.el.style.width = (config.width + selectionBorderWidth) + 'px';
        this.el.style.display = 'block';
        this.svg.style.width = config.width + 'px';

        config.error = this.reportErrors;

        d3.select(this.svg).data([config]).call(this.chart);

        this.model.set('svg', this.el.querySelector('.graphic-container>svg.graphic'));

        return this;
    }

});

module.exports = ViewGraphicVariation;
