var $ = require('jquery');

module.exports = {

    selector: '.btn-group-radio',

    events: ['click'],

    update: function ($el, val) {
        $el.find('.btn.active').removeClass('active');
        $el.find('.btn[value="' + val + '"]').addClass('active');
    },

    getVal: function ($el, event, options) {
        var $target = $(event.target);
        var val = $target.val();
        var currentVal = options.view.model.get(options.observe);
        if (val !== currentVal) {
            options.update($el, val, options.view.model, options);
        }
        return val;
    },

    onSet: function (val, options) {
        var v;

        if (!options.type) {
            return val;
        }

        switch (options.type.toLowerCase()) {
            case 'number':
                v = Number(val.replace(/(^[^\d]+|\,|[^\d]+$)/g, ''));
                v = isNaN(v) ? val : v;
                break;
            case 'string':
                v = String(val);
                break;
            case 'boolean':
                v = /^true$/i.test(val);
                break;
            default:
                v = val;
        }
        return v;
    }
};
