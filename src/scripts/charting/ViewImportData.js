var Backbone = require('./../core/backbone.js');
var DataImport = require('./DataImport.js');
var $ = require('jquery');

var tracking = require('./../utils/tracking.js');

var ViewImportData = Backbone.View.extend({

    className: 'view-importdata',

    initialize: function () {
        this.listenTo(this.model, 'invalid', function (model) {
            this.showError(model.validationError);
        });
        this.listenTo(this.model, 'change:data', this.clearError);
        this.listenTo(this.model, 'change:data', this.hide);
        this.listenTo(this.model, 'change:warning', this.renderWarning);
    },

    delegateEvents: function () {
        Backbone.View.prototype.delegateEvents.apply(this, arguments);
        this.__dragover = (function (e) {
            e.preventDefault();
            //console.log('over', e.dataTransfer.files);
            // TODO: show rejection cursor if wrong file type.
            //e.dataTransfer.effectAllowed = "none";
            //this.$el.addClass('dropzone');
        }).bind(this);
        this.__dropFile = (function (event) {
            var dt = event.dataTransfer;
            if (!dt || !dt.files || !dt.files.length) return;
            event.preventDefault();
            this.$el.removeClass('dropzone');
            this.readFile(dt.files[0]);
        }).bind(this);
        this.__paste = (function (event) {
            var clipboardData = event.clipboardData;
            if (!clipboardData) return;
            var types = clipboardData.types;
            var data;
            if (types && types.length && /^text\/[A-Za-z\-]+/.test(types[0]) && types[1] !== 'Files') {
                data = (clipboardData.getData('text/plain') || '');
                if (data) {
                    this.model.set({dataAsString: data}, {validate: true});
                }
            }
        }).bind(this);
        window.addEventListener('dragover', this.__dragover, false);
        var self = this;
        window.addEventListener('dragenter', function (event) {
            //console.log(event.type, event);
            self.$el.addClass('dropzone');
        }, false);
        window.addEventListener('dragleave', function (event) {
            // console.log(event.type, event);
            // self.$el.removeClass('dropzone');
        }, false);
        window.addEventListener('dragend', function (event) {
            // console.log(event.type, event);
            self.$el.removeClass('dropzone');
        }, false);
        window.addEventListener('drop', this.__dropFile, false);
        window.addEventListener('paste', this.__paste, false);
    },

    undelegateEvents: function () {
        Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        window.removeEventListener('dragover', this.__dragover, false);
        window.removeEventListener('drop', this.__dropFile, false);
        window.removeEventListener('paste', this.__paste, false);
    },

    events: {
        'change [name="file"]': 'file',
        'click [name="select-file"]': 'selectFile',
        'click [name="ignore-warning"]': 'ignoreWarning'
    },

    file: function (event) {
        var fileList = event.target.files;
        var file;

        if (!fileList || !fileList.length) {
            return;
        }

        file = fileList[0];

        this.readFile(file);
    },

    selectFile: function (event) {
        this.$('[name="file"]')[0].click();
        event.preventDefault();
        event.stopPropagation();
    },

    remove: function () {
        this.undelegateEvents();
        return Backbone.View.prototype.remove.apply(this, arguments);
    },

    readFile: function (file) {
        if (!DataImport.isValidType(file.type)) {
            this.showError({message: 'Invalid file type.'});
            return;
        }

        var reader = new FileReader();
        var self = this;
        reader.onload = function () {
            if (reader.readyState === FileReader.DONE) {
                self.model.set({dataAsString: reader.result, type: file.type}, {validate: true});
            }
        };
        reader.error = function (evt) {
            // TODO : this is just a placeholder implementation
            // Needs testing and better error messages
            var msg = '';
            var error = evt.target.error;
            var code = error.code;
            switch (code) {
                case error.NOT_FOUND_ERR:
                    msg = 'File Not Found!';
                    break;
                case error.NOT_READABLE_ERR:
                    msg = 'File is not readable';
                    break;
                case error.ABORT_ERR:
                    msg = 'Import aborted';
                    break;
                default:
                    msg = 'An error occurred reading this file.';
            }

            self.showError({message: msg});
        };

        reader.readAsText(file);
    },

    template: require('./../templates/import.hbs'),

    hide: function () {
        var numRows = this.model.get('numRows');
        var warning = this.model.get('warning');
        var hasWarnings = !!warning && !!warning.message;
        if (!numRows || hasWarnings) {
            window.addEventListener('paste', this.__paste, false);
            this.$el.delay(50).fadeIn(100);
        } else {
            window.removeEventListener('paste', this.__paste, false);
            this.$el.delay(200).fadeOut(100);
            //track that the data collection view has been removed and graphic view will be seen
            tracking.trackPage('GraphicsPreview');
        }
    },

    renderWarning: function () {
        var warning = this.model.get('warning');
        var show = (!!warning && !!warning.message);
        var el = this.$('.warning-message');
        if (show) {
            el.fadeIn('fast').html(warningMessageTemplate(warning));
        } else {
            el.hide();
        }
    },

    ignoreWarning: function () {
        this.model.ignoreWarning();
        this.hide();
    },

    clearError: function () {
        this.showError(null);
    },

    showError: function (error) {
        var show = (error && error.message);
        var message = show ? error.message : '&nbsp;';
        this.$('.error-message').css('opacity', (show ? 1 : 0)).html(message);
    },

    render: function () {
        var data = {};
        this.el.innerHTML = this.template(data);
        this.clearError();
        this.renderWarning();
        var self = this;
        return this;
    }

});

var warningMessageTemplate = require('./../templates/import-warning.hbs');

module.exports = ViewImportData;
