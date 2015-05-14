var Datatypes = module.exports = {
    CATEGORICAL: 'categorical',
    NUMERIC: 'numeric',
    TIME: 'time',
    NONE: '',

    isCategorical: function (value) {
        return value === Datatypes.CATEGORICAL;
    },
    isNumeric: function (value) {
        return value === Datatypes.NUMERIC;
    },
    isTime: function (value) {
        return value === Datatypes.TIME;
    }
};
