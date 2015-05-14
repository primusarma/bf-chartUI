var Backbone = require('./../core/backbone.js');
var Datatypes = require('./Datatypes.js');

var ViewHighlight = Backbone.View.extend({

    className: 'view-highlight',

    template: require('./../templates/highlight.hbs'),

    bindings: {
        '[data-section-name="categorical"]': {
            observe: 'datatype',
            visible: Datatypes.isCategorical
        },
        '[data-section-name="numeric"]': {
            observe: 'datatype',
            visible: Datatypes.isNumeric
        },
        '[data-section-name="time"]': {
            observe: 'datatype',
            visible: Datatypes.isTime
        }
    },

    render: function () {
        var data = this.model ? this.model.toJSON() : {};
        this.el.innerHTML = this.template(data);
        this.stickit();
        return this;
    }

});

module.exports = ViewHighlight;
