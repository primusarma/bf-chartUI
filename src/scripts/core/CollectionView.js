var Backbone = require('./backbone.js');
var _ = require('underscore');

var CollectionView = Backbone.View.extend({

    _views: [],

    initialize: function (options) {
        Backbone.View.prototype.initialize.apply(this, arguments);
        var itemView = options.itemView || this.itemView || {};
        this.itemContainer = options.itemContainer || this.itemContainer || null;
        this.template = options.template || this.template || null;
        if (_.isFunction(itemView)) {
            this._ItemClass = itemView;
        } else {
            if (itemView.template && !itemView.render) {
                if (!!itemView.bindings) {
                    itemView.render = function () {
                        this.el.innerHTML = !!this.model ? this.template(this.model.toJSON()) : '';
                        this.stickit();
                        return this;
                    };
                } else {
                    itemView.render = function () {
                        this.el.innerHTML = !!this.model ? this.template(this.model.toJSON()) : '';
                        return this;
                    };
                }
            }
            this._ItemClass = Backbone.View.extend(itemView);
        }

        this.listenTo(this.collection, 'add remove reset sort', function (e) {
            this.itemsDirty = true;
            this.render();
        });
    },

    itemsDirty: false,

    removeViews: function () {
        this._views.forEach(function (view) {
            view.remove();
        });
        this._views = [];
        this.itemsDirty = false;
    },

    createView: function (model, index) {
        var o = model instanceof Backbone.Collection ? {collection: model} : {model: model};
        return new this._ItemClass(o);
    },

    createViews: function () {
        if (!this.collection) return [];
        return this.collection.map(function (model, index) {
            return this.createView.call(this, model, index, this._ItemClass);
        }, this);
    },

    renderItems: function () {
        var isDirty = this.itemsDirty;
        if (isDirty) {
            this.removeViews();
        }
        var el = this.itemContainer ? this.$(this.itemContainer)[0] : this.el;
        if (!el) return;
        var render = isDirty || !this._views.length;
        if (render) {
            this._views = this.createViews();
        }
        this._views.forEach(function (view) {
            if (render) view.render();
            el.appendChild(view.el);
        });
    },

    render: function () {
        this.el.innerHTML = !!this.template ? (!!this.model ? this.template(this.model.toJSON()) : this.template()) : '';
        this.renderItems();
        return this;
    }
});

module.exports = CollectionView;
