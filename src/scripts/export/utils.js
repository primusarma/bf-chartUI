/* globals unescape, MouseEvent, XMLSerializer */
exports.createFilename = function createFilename(name, ext) {
    ext = '.' + (ext || 'txt').trim().replace(/(^\.+|\s.|\.+$)/g, '').toLowerCase();
    return (name || 'untitled')
            .replace(/\s+/g, '-')
            .replace(/&/g, 'and')
            .replace(/[@£$%€^!]/g, '')
            .replace(new RegExp('\\' + ext + '$', 'i'), '') +
        ext;
};

exports.fileDownloader = function fileDownloader(filename, href, target) {
    var a = document.createElement('a');
    a.style.display = 'none';
    a.target = target || '_top';
    a.download = true;
    var me = {
        filename: function (name) {
            a.setAttribute('download', name);
            return me;
        },
        dataURI: function (datauri) {
            a.setAttribute('href', datauri || '');
            return me;
        },
        start: function (callback) {
            document.body.appendChild(a);
            var evt = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            a.dispatchEvent(evt);
            document.body.removeChild(a);
            if (callback) {
                setTimeout(callback, 0);
            }
            return me;
        }
    };
    me.dataURI(href).filename(filename);
    return me;
};


var svgSchema = 'http://www.w3.org/2000/svg';
var xlinkSchema = 'http://www.w3.org/1999/xlink';
var xmlnsSchema = 'http://www.w3.org/2000/xmlns/';
var svgProcessingInstruction = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
var svgDTDElement = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

exports.svgToString = function svgToString(svg) {

    if (svg.nodeName.toLowerCase() !== 'svg') {
        throw new Error('A root SVG element is required');
    }

    if (!svg.hasAttribute('xmlns')) {
        svg.setAttribute('xmlns', svgSchema);
    }

    if (!svg.hasAttribute('xmlns:xlink')) {
        svg.setAttributeNS(xmlnsSchema, 'xmlns:xlink', xlinkSchema);
    }

    //var source = svg.outerHTML; // although it's fast, not sure using outerHTML is completely safe
    var source = (new XMLSerializer()).serializeToString(svg); // this may break when SVG elements are not strictly XML because they follow HTML validation rules instead

    return svgProcessingInstruction + svgDTDElement + source;
};

var utf8ToBase64 = exports.utf8ToBase64 = function utf8ToBase64(str) {
    // unescape and encodeURIComponent are used when unicode characters appear
    // in the SVG. Othewise the SVG -> PNG/JPG wont work.

    // This method of converting to Base64 should suffice for now.
    // If it proves not to be robust enough or slow then read these articles
    //   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob%28%29_and_btoa%28%29_using_TypedArrays_and_UTF-8
    //   - https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView

    return window.btoa(unescape(encodeURIComponent(str)));
};

exports.toDataURI = function toDataURI(data, type, encoding) {

    if (!type) throw new Error('Content MIME type required');

    encoding = encoding.toLowerCase();

    var isPixelImage = /^image\/(jpg|png|gif|jpeg)$/.test(type); // dont include SVG and other text based image formats
    var encodedData;

    if (isPixelImage) {
        encodedData = window.btoa(data);
    } else if (encoding === 'base64') {
        encodedData = utf8ToBase64(data);
    } else {
        encodedData = data;
    }

    return 'data:' + type + ';' + encoding + ',' + encodedData;
};

