var Backbone = require('./../core/backbone.js');
var CollectionView = require('./../core/CollectionView.js');
var $ = require('jquery');
var Axis = require('./Axis.js');

var dragging;
var placeholder = $('<div class="sortablelist-placeholder"/>');
var dragElement;

function sortablelist(view) {

    return {
        dragstart: function (e) {
            if (!e.target.draggable) return false;
            var dataTransfer = e.originalEvent.dataTransfer;
            dataTransfer.effectAllowed = 'move';
            dataTransfer.setData('Text', 'dummy');
            dragging = {
                $el: $(e.currentTarget),
                view: view,
            };
            dragElement = $(e.currentTarget.cloneNode(true));
            dragElement.addClass('drag-image').css({
                width: dragging.$el.width()
            });
            dragElement.find('.series-num').html('');
            dragElement.find('.series-item-controls').html('');
            dragElement.appendTo(document.body);
            dataTransfer.setDragImage(dragElement[0], 0, 0);

            dragging.index = dragging.$el.addClass('sortable-dragging').index();
            var copy = $(e.currentTarget.innerHTML);
            copy.find('.series-num').html('');
            copy.find('.series-item-controls').html('');
            placeholder.empty().append(copy);
        },
        dragend: function (e) {
            if (!dragging) return;
            dragging.$el.removeClass('sortable-dragging').show();
            placeholder.detach();
            if (dragElement) {
                dragElement.detach();
                dragElement = null;
            }
            // if (index !== dragging.index()) {
            //   var t = $(e.target);
            //   var newIndex = t.index();
            //   t.trigger({type: 'reorder', item: dragging, oldIndex: index, newIndex: newIndex});
            // }

            // no-cancel behaviour
            if (dragging.index !== dragging.tempIndex || view !== dragging.view) {
                var t = $(e.currentTarget);
                t.trigger({
                    type: 'reorder',
                    view: dragging.view,
                    item: dragging.$el,
                    oldIndex: dragging.index,
                    newIndex: dragging.tempIndex
                });
            }
            dragging = null;
        },
        dragover: function (e) {
            if (e.type === 'drop') {
                e.stopPropagation();
                if (placeholder.is(':visible')) {
                    placeholder.after(dragging);
                }
                dragging.$el.trigger('dragend');
                return false;
            }
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            if (e.target.draggable) {
                dragging.$el.hide();
                var t = $(e.currentTarget);
                var after = placeholder.index() < t.index();
                var p = t[after ? 'after' : 'before'](placeholder);

                // no-cancel behaviour
                dragging.tempIndex = view.$('>*:visible').index(placeholder);
                dragging.view = view;
            } else if (e.currentTarget === view.el && !view.collection.length) {
                dragging.$el.hide();
                $(e.currentTarget).append(placeholder);
                dragging.view = view;
                dragging.tempIndex = 0;
            }
            return false;
        }
    };
}

var instances = 0;

var ViewSeriesList = CollectionView.extend({

    className: function () {
        return 'view-series-list' + (this.isUnusedCollection ? ' unused ' : '');
    },

    constructor: function (options) {
        options = options || {};
        this.isUnusedCollection = !!options.isUnusedCollection;
        return CollectionView.prototype.constructor.apply(this, arguments);
    },

    initialize: function () {
        CollectionView.prototype.initialize.apply(this, arguments);
        this._sortablelist = sortablelist(this);
        if (this.isUnusedCollection) {
            this.listenTo(this.collection, 'reset add remove', function () {
                this.el.style.display = !!this.collection.length ? 'block' : 'none';
            });
        }
    },

    events: {
        'dragstart .view-series-list-item': function (event) {
            return this._sortablelist.dragstart(event);
        },
        'dragend .view-series-list-item': function (event) {
            return this._sortablelist.dragend(event);
        },
        'dragover .view-series-list-item': 'dragover',
        'dragenter .view-series-list-item': 'dragover',
        'drop .view-series-list-item': 'dragover',
        reorder: function (event) {
            var model;
            if (this === event.view) {
                model = this.collection.at(event.oldIndex);
                this.collection.remove(model, {silent: true});
                this.collection.add(model, {at: event.newIndex});
            } else {
                model = this.collection.at(event.oldIndex);
                this.collection.remove(model);
                event.view.collection.add(model, {at: event.newIndex});
            }
        }
    },

    dragover: function (event) {
        return this._sortablelist.dragover(event);
    },

    createView: function (model, index) {
        var o = {
            model: model,
            index: index,
            isLast: index >= this.collection.length - 1,
            isUnusedCollection: this.isUnusedCollection
        };
        return new this._ItemClass(o);
    },

    itemView: Backbone.View.extend({

        constructor: function (options) {
            options = options || {};
            this.index = options.index || 0;
            return Backbone.View.prototype.constructor.apply(this, arguments);
        },

        initialize: function (o) {
            this.isUnusedCollection = !!o.isUnusedCollection;
            this.isLast = o.isLast;
            this.listenTo(this.model, 'change:isOther', this.updateClassName);
        },

        className: function () {
            return 'view-series-list-item series-' + (this.model.get('isOther') ? 'other' : this.index + 1);
        },

        events: {
            'mousedown [name="label"]': function (event) {
                if (event.target == document.activeElement) return;
                event.preventDefault();
            },
            'click [name="label"]': function (event) {
                if (event.target == document.activeElement) return;
                event.target.focus();
            },
            'focus [name="label"]': 'selectText',
            'blur [name="label"]': 'blurLabelField',
            'keydown [name="label"]': 'keydownLabelField',
            'input [name="label"]': 'blurLabelField',
            'click [name="remove-series"]': 'removeSeries'
        },

        bindings: {
            '[name="label"]': {
                observe: 'label',
                update: function ($el, val, model, options) {
                    if (document.activeElement !== $el[0]) {
                        $el[0].textContent = val;
                    }
                }
            },
            '[name="isOther"]': 'isOther'
        },

        template: require('./../templates/ordered-column.hbs'),

        keydownLabelField: function (event) {
            var esc = event.which === 27;
            var newline = event.which === 13;
            if (esc) {
                document.execCommand('undo');
                event.target.blur();
            } else if (!event.altKey && newline) {
                event.preventDefault();
                event.target.blur();
            }
        },

        updateClassName: function () {
            this.el.className = this.className();
        },

        blurLabelField: function (event) {
            // FIXME: allow line breaks in the value
            var value = event.target.textContent;
            var isBlurring = event.type === 'focusout';
            var isEmptyField = !value.trim();
            if (isBlurring && isEmptyField) {
                value = event.target.textContent = this.model.get('property');
            }
            this.model.set('label', value);
            if (isBlurring) {
                console.log('isBlurring');
                this.deselectText();
            }
        },

        selectText: function (event) {
            window.requestAnimationFrame(function () {
                var range = document.createRange();
                range.selectNodeContents(event.target);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            });
        },

        deselectText: function () {
            window.requestAnimationFrame(function () {
                if (document.selection) {
                    document.selection.empty();
                } else if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
            });
        },

        removeSeries: function (event) {
            var model = this.model;
            var collection = model.collection;
            if (collection) {
                this.$el.animate({opacity: 0}, 160).delay(80).hide(0, function () {
                    collection.remove(model);
                });
            }
        },

        render: function () {
            var d = this.model.toJSON();
            d.index = this.index + 1;
            d.primary = d.index === 1;
            d.isLast = this.isLast;
            d.unused = this.isUnusedCollection;
            this.el.innerHTML = this.template(d);
            this.stickit();
            return this;
        }

    })

});

module.exports = ViewSeriesList;
