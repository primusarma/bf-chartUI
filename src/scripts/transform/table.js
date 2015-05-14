var Datatypes = require('../charting/Datatypes.js');
var series = require('./series.js');

module.exports = transformTable;

function transformTable(data, columns, transform, type, customLogic) {

    if (typeof type === 'string') {
        if (type === Datatypes.TIME) {
            type = Datatypes.isTime;
        } else if (type === Datatypes.NUMERIC) {
            type = Datatypes.isNumeric;
        } else if (type === Datatypes.isCategorical) {
            type = Datatypes.isCategorical;
        }
    }

    if (type === null) {
        type = function () {
            return true;
        };
    }

    if (typeof type !== 'function') {
        return;
    }

    var typeInfo;
    var colName;
    var transformFn;

    for (var i = 0, x = columns.length; i < x; i++) {
        typeInfo = columns[i].get('typeInfo');
        colName = typeInfo.colName;
        if (type(typeInfo.datatype)) {
            transformFn = transform(typeInfo);
            if (transformFn) {
                series(data, colName, transformFn, customLogic);
            }
        }
    }
}
