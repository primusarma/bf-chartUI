var pkg = require('./package.json');

module.exports = {
    build: ['sass', 'mustache', 'browserify'],
    test: 'karma',
    release: ['git', 'gh-pages'],
    serve: 'staticApp',
    browserify: {
        insertGlobals : true,
        detectGlobals : false,
        noParse: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/underscore/underscore.js',
            './bower_components/backbone/backbone.js',
            './node_modules/hbsfy/runtime.js',
            './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            './bower_components/d3/d3.js'
        ],
        //vendorBundle: [
            //{ file :'./bower_components/underscore/underscore.js', expose: 'underscore'},
            //{ file :'./bower_components/backbone/backbone.js', expose: 'backbone'},
            //{ file :'./node_modules/hbsfy/runtime.js', expose: 'hbsfy'},
            //{ file :'./bower_components/d3/d3.js', expose: 'd3'},
            //{ file :'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js', expose: 'bootstrap-sass'},
            //{ file :'./bower_components/jquery/dist/jquery.js', expose: 'jquery'},
            //{ file :'./node_modules/handlebars/runtime.js', expose: 'handlebars'}
        //]
    },
    karma : {
        config: './test/karma.conf.js',
        summary: './test/coverage/summary.json'
    },
    staticApp: {
        server: { baseDir : '_site' },
        port: 3456
    },
    paths: {
        /*
        All paths also have `script`, `styles`, `fonts`, `icons` and `images` properties
        Feel free to specify a custom path i.e. `scripts: './src/js'`
        */
        "bower": {
            root: './bower_components',
            fonts: './bower_components/*/dist/fonts'
        },
        source: { //source files to build your component / site
            root: "./src"
        },
        demo: false,
        dist : false,
        "site": { // Final build (Compiled demo + source) code pushed to your chosen release cloud i.e. AWS
            root: './_site'
        }
    },
    pkg: pkg
};