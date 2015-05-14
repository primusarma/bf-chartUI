var Backbone = require('backbone');
var _ = require('underscore');

var Mutator = function () {
    },
    oldGet = Backbone.Model.prototype.get,
    oldSet = Backbone.Model.prototype.set,
    oldToJson = Backbone.Model.prototype.toJSON;

// This is necessary to ensure that Models declared without the mutators object do not throw and error
Mutator.prototype.mutators = {};

// override get functionality to fetch the mutator props
Mutator.prototype.get = function (attr) {
    var isMutator = this.mutators !== undefined;
    console.log('get', isMutator, this.mutators);

    // check if we have a getter mutation
    if (isMutator === true && _.isFunction(this.mutators[attr]) === true) {
        return this.mutators[attr].call(this);
    }

    // check if we have a deeper nested getter mutation
    if (isMutator === true && _.isObject(this.mutators[attr]) === true && _.isFunction(this.mutators[attr].get) === true) {
        return this.mutators[attr].get.call(this);
    }

    return oldGet.call(this, attr);
};

// override set functionality to set the mutator props
Mutator.prototype.set = function (key, value, options) {
    var isMutator = this.mutators !== undefined,
        ret = null,
        attrs = null;

    console.log('set', isMutator, this.mutators);
    ret = oldSet.call(this, key, value, options);

    // seamleassly stolen from backbone core
    // check if the setter action is triggered
    // using key <-> value or object
    if (_.isObject(key) || key === null) {
        attrs = key;
        options = value;
    } else {
        attrs = {};
        attrs[key] = value;
    }

    // check if we have a deeper nested setter mutation
    if (isMutator === true && _.isObject(this.mutators[key]) === true) {

        // check if we need to set a single value
        if (_.isFunction(this.mutators[key].set) === true) {
            ret = this.mutators[key].set.call(this, key, attrs[key], options, _.bind(oldSet, this));
        } else if (_.isFunction(this.mutators[key])) {
            ret = this.mutators[key].call(this, key, attrs[key], options, _.bind(oldSet, this));
        }
    }

    if (isMutator === true && _.isObject(attrs)) {
        _.each(attrs, _.bind(function (attr, attrKey) {
            if (_.isObject(this.mutators[attrKey]) === true) {
                // check if we need to set a single value

                var meth = this.mutators[attrKey];
                if (_.isFunction(meth.set)) {
                    meth = meth.set;
                }

                if (_.isFunction(meth)) {
                    if (options === undefined || (_.isObject(options) === true && options.silent !== true && (options.mutators !== undefined && options.mutators.silent !== true))) {
                        this.trigger('mutators:set:' + attrKey);
                    }
                    meth.call(this, attrKey, attr, options, _.bind(oldSet, this));
                }

            }
        }, this));
    }

    return ret;
};

// override toJSON functionality to serialize mutator properties
Mutator.prototype.toJSON = function (options) {
    // fetch ye olde values
    var attr = oldToJson.call(this),
        isSaving,
        isTransient;
    // iterate over all mutators (if there are some)
    _.each(this.mutators, _.bind(function (mutator, name) {
        // check if we have some getter mutations
        if (_.isObject(this.mutators[name]) === true && _.isFunction(this.mutators[name].get)) {
            isSaving = _.has(options || {}, 'emulateHTTP');
            isTransient = this.mutators[name].transient;
            if (!isSaving || !isTransient) {
                attr[name] = _.bind(this.mutators[name].get, this)();
            }
        } else {
            attr[name] = _.bind(this.mutators[name], this)();
        }
    }, this));

    return attr;
};

// override get functionality to get HTML-escaped the mutator props
Mutator.prototype.escape = function (attr) {
    var val = this.get(attr);
    return _.escape(val === null ? '' : '' + val);
};

// extend the models prototype
_.extend(Backbone.Model.prototype, Mutator.prototype);

// make mutators globally available under the Backbone namespace
Backbone.Mutators = Mutator;

module.exports = Mutator;
