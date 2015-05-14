var Backbone = require('./backbone.js');
var _ = require('underscore');

var last;
var RegionView = Backbone.View.extend({

    initRegions: function () {
        this.regions = _.extend({}, this.regions);
        _.each(this.regions, function (region, selector) {
            region = _.isFunction(region) ? {factory: region} : (!!region ? region : {
                factory: function () {
                }
            });
            region._dirty = false;
            region._view = null;
            this.regions[selector] = region;
        }, this);
    },

    initialize: function () {
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.initRegions();
    },

    renderRegions: function () {
        _.each(this.regions, function (region, selector) {
            var el = this.findRegionContainer(selector);
            if (!!region._view && (this.regionsDirty || !el)) {
                region._view.remove();
                region._view = null;
            }
            if (!el) return;
            if (!region._view) {
                region._view = this.createRegion(selector);
                region._view.render();
            }
            el.appendChild(region._view.el);
        }, this);
        this.regionsDirty = false;
    },

    createRegion: function (selector) {
        return this.regions[selector].factory.call(this);
    },

    findRegionContainer: function (selector) {
        return selector === ':el' ? this.el : this.$el.find(selector)[0];
    },

    removeRegions: function () {
        _.each(this.regions, function (region) {
            region._view.remove();
            // TODO: remove from the DOM too?
        });
    },

    remove: function () {
        this.removeRegions();
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    render: function () {
        Backbone.View.prototype.render.apply(this, arguments);
        this.el.innerHTML = !!this.template ? (!!this.model ? this.template(this.model.toJSON()) : this.template()) : '';
        this.renderRegions();
        return this;
    }
});

module.exports = RegionView;
