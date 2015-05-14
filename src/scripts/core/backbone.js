var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');


// this nasty little line fixes Boostrap's jQuery plugins and Backbone
// as they both are not fit for using with Browserify
window.jQuery = Backbone.$ = $;
var Stickit = require('backbone.stickit');
require('bootstrap-sass');

$(document.body).tooltip({selector: '.has-tooltip[title]'});

var handlers = [
    require('./stickit-handlers/btn-group-radio.js')
];

handlers.forEach(function (handler) {
    Backbone.Stickit.addHandler(handler);
});

module.exports = Backbone;
