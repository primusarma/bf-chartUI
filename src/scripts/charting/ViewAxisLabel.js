var Backbone = require('./../core/backbone.js');

var ViewAxisLabel = Backbone.View.extend({

    className: 'view-axis-label',

    template: require('./../templates/axis-label.hbs'),

    bindings: {
        '[name="label"]': {
            observe: ['label', 'suggestedLabel'],
            onGet: function (values) {
                return values[0] || values[1];
            },
            onSet: function (value) {
                return [(value || '').trim(), this.model.get('suggestedLabel')];
            }
        }
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit();
        return this;
    }

});

module.exports = ViewAxisLabel;
