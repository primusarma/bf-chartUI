var _ = require('underscore');
var RegionView = require('./../core/RegionView.js');
var ViewGraphicTypeControls = require('./ViewGraphicTypeControls.js');
var ViewLineControls = require('./ViewLineControls.js');
var download = require('./../export/download.js');
var util = require('util');
var attributeStyler = require('o-charts').util.attributeStyler;
var tracking = require('./../utils/tracking.js');

var ViewSelectedVariation = RegionView.extend({

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        var debounced = _.bind(_.debounce(this.render, 50), this);
        this.listenTo(this.model.graphic, 'change', debounced);
        this.listenTo(this.model.graphic.chart.xAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis.columns, 'change add', debounced);
        this.listenTo(this.model.graphicType.controls, 'change', debounced);
        this.listenTo(this.model.graphic.chart.dataset, 'change:rows', debounced);
        this.listenTo(this.model.errors, 'reset', this.renderErrors);
    },

    className: 'view-selected-variation',

    template: require('./../templates/selected-variation.hbs'),

    events: {
        'click [name="save"]': 'save',
    },

    regions: {
        '[data-region="graphic-type-controls"]': function () {
            return new ViewLineControls({model: this.model.graphicType});

            // TODO: once we have more chart types then we'll
            // need to be able to switch between different views here
            // return new ViewGraphicTypeControls({model: this.model.graphicType});
        }
    },

    save: function (event) {

        event.preventDefault();
        event.stopPropagation();

        var svg = this.model.get('svg');
        var el = event.target;
        var format = event.altKey ? 'svg' : 'png';

        el.setAttribute('disabled', 'disabled');

        function removeDisabledState() {
            el.removeAttribute('disabled');
        }

        var d = this.model.toJSON();

        // TODO: check it's possible to make the image.
        //         - dont allow the user to download a chart with validation errors
        //         - dont allow a user to download an empty image

        var filename = util.format('%s-%s-%s-%sx%s',
            (d.graphic.title ? d.graphic.title.replace(/\s/g, '_') : 'Untitled'),
            d.graphicType.typeName.toLowerCase() + '_chart',
            d.variation.variationName,
            d.svg.width,
            d.svg.height
        ).replace(/\s/g, '');

        // TODO: allow transparent and specified colour backgrounds
        // set this to null for transparent backgrounds
        var bgColor = '#fff1e0';

        // FIXME: this is a hack, we shouldn't need this.
        attributeStyler();

        download(filename, svg, format, bgColor, function () {
            // TODO: alert the user when there's an error creating the image

            // prevent doubleclick
            setTimeout(removeDisabledState, 200);
        });
        tracking.trackEvent('saveImage-' + format);
    },

    render: function () {

        if (!this.model.get('svg')) {
            this.el.innerHTML = '';
            return this;
        }

        var data = this.model.toJSON();
        this.el.innerHTML = this.template(data);
        this.renderRegions();
        return this;

    },

});

module.exports = ViewSelectedVariation;

// function closeDropdown(event) {
//   $('[data-toggle="dropdown"]').parent().removeClass('open');
// }
// document.addEventListener('click', closeDropdown, true);

