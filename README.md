Nightingale  [![Circle CI](https://circleci.com/gh/Financial-Times/nightingale/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/nightingale/tree/master)
========================
> A tool for journalists to create FT styled charts

## How to make a chart

* Source data in CSV or TSV format. You can also copy a range of cells from Excel.
* Drag and drop or paste the data file into [Nightingale](http://nightingale.ft.com/)
* Nightingale will try to guess the data type of each column and configure the axes
* Give the chart a title, subtitle and source line. A great title is crucial. The subtitle should be descriptive of the data show in the chart.
* Correct the configured axes if Nightingale didn't automatically do what you wanted
* Click the chart that you want for your article
* Click the big blue button to download the image

## Limitiations

* We have only implemented basic time series charts (line and columns) so far.
* PNG is the main image format for now as that's the best our publishing systems offer. SVG is a hidden feature at the moment (alt+click the blue download button) because it's only useful to a small handful of people -- it's better to keep the UI simple and obvious, rather than offering lots of download options.
* The background colour is fixed as pink. This is forced limitation for now and we'll remove it once other things improve. It 's mainly due to this pink being the best preference for *all* use cases. 
* Requires the latest version of Chrome, Firefox or IE. We are never going to support older browsers.

## Contribute to Nightingale

As an end-user feel free to send the development team an [email](mailto:help.nightingale@ft.com) or add an issue on [github](https://github.com/Financial-Times/nightingale/issues/new).

As a Developer, [Read More >](CONTRIBUTING.md).

Things we've used to make this:

* [D3](https://github.com/mbostock/d3/wiki/API-Reference)
* [Backbone](http://backbonejs.org/) (plus jQuery and underscore)
* [Backbone.stickit](https://github.com/NYTimes/backbone.stickit)
* [o-charts](https://github.com/ft-interactive/o-charts) (Nightingale's sister project)
* [Bootstrap](http://getbootstrap.com/)
