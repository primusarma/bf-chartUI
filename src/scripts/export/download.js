var svgDataURI = require('./svgDataURI.js');
var util = require('./utils.js');

module.exports = function download(name, svg, types, bgColor, callback) {
    callback = callback || function () {
        };
    window.requestAnimationFrame(function () {
        types = types instanceof Array ? types : [types];
        types.forEach(function (type) {
            var filename = util.createFilename(name, type);
            var download = util.fileDownloader(filename);
            if (type === 'svg') {
                download.dataURI(svgDataURI.elementToDataURI(svg, {
                    encoding: 'utf8',
                    bgColor: bgColor
                })).start(callback);
            } else if (type === 'png' || type === 'jpg' || type === 'jpeg') {
                svgDataURI.elementToImageDataURI(svg, {type: type, bgColor: bgColor}, function (err, datauri) {
                    if (err) {
                        console.error(err.message);
                        return;
                    }
                    download.dataURI(datauri).start(callback);
                });
            } else {
                console.error('Unsupported format:', type);
                callback();
            }
        });
    });
};
