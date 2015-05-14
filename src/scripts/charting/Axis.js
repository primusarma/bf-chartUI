var Backbone = require('./../core/backbone.js');
var Datatypes = require('./Datatypes.js');

var Axis = Backbone.Model.extend({
        defaults: {
            name: '',
            label: '',
            labelOverride: false,
            suggestedLabel: '',
            datatype: Datatypes.CATEGORICAL,
            warningMessage: '',
            dateFormat: '',
            prefix: '',
            suffix: ''
        }
    },
    {
        X: 'X',
        Y: 'Y',
        Z: 'Z',
        NONE: null
    });

module.exports = Axis;
