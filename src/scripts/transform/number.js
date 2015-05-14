var currencySymbol = /^(\$|€|¥|£)/;
var allCommas = /\,/g;
var percent = /(\%)$/;

module.exports = createNumberTransformer;

function createNumberTransformer(options) {

    options = options || {};

    function transformNumber(d) {

        var _NaN = options.interpolateNulls ? null : NaN;

        if (d === null || d === undefined) return _NaN;

        var type = typeof d;

        if (type === 'number') return d;

        if (type !== 'string') return _NaN;

        d = d.trim()
            .replace(allCommas, '')
            .replace(currencySymbol, '')
            .replace(percent, '');

        if (d === '') return _NaN;

        if (d === '*') return null;

        return Number(d);

    }

    return transformNumber;
}
