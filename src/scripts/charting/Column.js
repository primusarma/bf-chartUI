var Backbone = require('./../core/backbone.js');
var Axis = require('./Axis.js');

module.exports = Backbone.Model.extend({

    defaults: {
        property: '',
        label: '',
        axis: Axis.NONE,
        isOther: false
    }

});
