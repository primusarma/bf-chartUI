module.exports = series;

function series(array, property, transformer, customLogic) {
    var oldValue;
    var newValue;
    var hasCustomLogic = typeof customLogic === 'function';
    var customValue;
    for (var i = 0, x = array.length; i < x; i++) {
        oldValue = array[i][property];
        newValue = transformer(oldValue);
        if (newValue === undefined) newValue = null;
        customValue = hasCustomLogic ? customLogic(oldValue, newValue, property, i) : newValue;
        if (customValue === undefined) customValue = newValue;
        array[i][property] = customValue;
    }
}
