//reusable linechart

var d3 = require('d3');
var dateAxis = require('../axis/date.js');
var numberAxis = require('../axis/number.js');
var textArea = require('../element/text-area.js');
var lineKey = require('../element/line-key.js');
var ftLogo = require('../element/logo.js');
var lineThickness = require('../util/line-thickness.js');
var interpolator = require('../util/line-interpolators.js');
var ratios = require('../util/aspect-ratios.js');

function isDate(d) {
	return d && d instanceof Date && !isNaN(+d);
}

function isTruthy(value) {
	return !!value;
}

function normaliseSeriesOptions(value) {
	var d = {key: null, label: null};

	if (!value) {
		return d;
	}

	if (typeof value === 'string') {
		d.key = d.label = value;
	} else if (Array.isArray(value) && value.length <= 2 && typeof value[0] === 'string') {
		d.key = value[0];
		d.label = typeof value[1] !== 'string' ? d.key : value[1];
	} else if (typeof value === 'function') {
		d = value();
	} else if (value.key) {
		d.key = value.key;
		d.label = value.label || d.key;
	}

	if (typeof d.key === 'function') {
		d.key = d.key();
	}

	if (typeof d.label === 'function') {
		d.label = d.label();
	}

	return d;
}

function normaliseYAxisOptions(value) {
	if (!value) return [];
	return (!Array.isArray(value) ? [normaliseSeriesOptions(value)] : value.map(normaliseSeriesOptions)).filter(isTruthy);
}

function getHeight(selection) {
	return Math.ceil(selection.node().getBoundingClientRect().height);
}

function getWidth(selection) {
	return Math.ceil(selection.node().getBoundingClientRect().width);
}

function translate(margin) {
	return function(position) {
		var left = position.left || 0;
		var top = position.top || 0;
		return 'translate(' + (margin + left) + ',' + top + ')';
	};
}

function lineChart(p) {
    'use strict';

	var lineClasses = ['series1', 'series2', 'series3', 'series4', 'series5', 'series6', 'series7', 'accent'];

	//these classes can be used in addition to those above
	var complementaryLineCLasses = ['forecast'];

	function buildModel(opts) {
		var m = {
			//layout stuff
			height: undefined,
			width: 300,
			chartHeight: undefined,
			chartWidth: undefined,
			blockPadding: 8,
			simpleDate: false,
			simpleValue: false,
			logoSize: 28,
			//data stuff
			falseorigin: false, //TODO, find out if there's a standard 'pipeline' temr for this
			error: function(err) { console.log('ERROR: ', err); },
			lineClasses: {},
			niceValue: true,
			hideSource: false,
			numberAxisOrient: 'left',
			margin: 2,
			lineThickness: undefined,
			x: {
				series: '&'
			},
			y: {
				series: []
			},
			labelLookup: null,
			sourcePrefix: 'Source: '
		};

		for (var key in opts) {
			m[key] = opts[key];
		}

		m.contentWidth = m.width - (m.margin * 2);

		m.translate = translate(0);

		// only set the chart width if hasn't been defined
		// explicitly in the config
		if (!m.chartWidth) {
			// minus gutter for logo
			var rightGutter = m.contentWidth < 260 ? 16 : 26;
			m.chartWidth = m.contentWidth - rightGutter;
		}

		if (!m.chartHeight) {
			// The chart size should have a nice aspect ratio
			var isNarrow = m.chartWidth < 220;
			var isWide = m.chartWidth > 400;
			var ratio = isNarrow ? 1.1 : (isWide ? ratios.commonRatios.widescreen : ratios.commonRatios.standard);
			m.chartHeight = ratios.heightFromWidth(m.chartWidth, ratio);
		}

		m.lineStrokeWidth = lineThickness(m.lineThickness);

		m.x.series = normaliseSeriesOptions(m.x.series);
		m.y.series = normaliseYAxisOptions(m.y.series)
							.filter(function (d) {
								return !!d.key && d.key !== m.x.series.key;
							})
							.map(function (d, i) {
								d.index = i;
								d.className = lineClasses[i];
								return d;
							});

		if (typeof m.key !== 'boolean') {
			m.key = m.y.series.length > 1;
		} else if (m.key && !m.y.series.length) {
			m.key = false;
		}

		m.data = !Array.isArray(m.data) ? [] : m.data.map(function (d, i) {

			var s = d[m.x.series.key];
			var error = {
				node: null,
				message: '',
				row: i,
				column: m.x.series.key,
				value: s
			};

			if (!d) {
				error.message = 'Empty row';
			} else if (!s) {
				error.message = 'X axis value is empty or null';
			} else if (!isDate(s)) {
				error.message = 'Value is not a valid date';
			}

			if (error.message) {
				m.error(error);
				d[m.x.series.key] = null;
			}

			return d;

		});

		//make sure all the lines are numerical values, calculate extents...
		var extents = [];
		m.y.series.forEach(function (l, i) {
			var key = l.key;
			m.data = m.data.map(function (d, j) {

				var value = d[key];
				var isValidNumber = value === null || typeof value === 'number';
				if (!isValidNumber) {
					m.error({
						node: null,
						message: 'Value is not a number',
						value: value,
						row: j,
						column: key
					});
				}
				return d;
			});
			var ext = d3.extent(m.data, function(d){
				return d[key];
			});
			extents = extents.concat (ext);
		});

		//work out the time domain
		if (!m.timeDomain) {
			m.timeDomain = d3.extent(m.data, function (d) {
				return d[m.x.series.key];
			});
		}

		//work out the value domain
		if (!m.valueDomain) {
			m.valueDomain = d3.extent(extents);
			// unless a false origin has been specified
			if (!m.falseorigin && m.valueDomain[0] > 0) {
				m.valueDomain[0] = 0;
			}
		}

		return m;
	}

	function chart(g){

		//the model is built froma  copy of the data
		var model = buildModel(Object.create(g.data()[0]));

		var svg = g.append('svg')
				.attr({
					'class': 'graphic line-chart',
					//we don't necessarily know the height at the moment so may be undefiend...
					height: model.height,
					width: model.width
				});

		var defaultLineHeight = 1.2;
		// TODO: don't hard-code the fontsize, get from CSS somehow.
		var titleFontSize = 18;
		// TODO: move calculation of lineheight to the textarea component;
		var titleLineHeight = defaultLineHeight;
		var titleLineHeightActual = Math.ceil(titleFontSize * titleLineHeight);
		var titleLineSpacing = titleLineHeightActual - titleFontSize;
		var footerLineHeight = 15;
		var subtitleFontSize = 12;
		var subtitleLineHeight = defaultLineHeight;
		var subtitleLineHeightActual = Math.ceil(subtitleFontSize * subtitleLineHeight);
		var subtitleLineSpacing = subtitleLineHeightActual - subtitleFontSize;
		var sourceFontSize = 10;
		var sourceLineHeight = defaultLineHeight;
		var sourceLineHeightActual = sourceFontSize * sourceLineHeight;
		var halfLineStrokeWidth = Math.ceil(model.lineStrokeWidth / 2);

			//create title, subtitle, key, source, footnotes, logo, the chart itself
			var titleTextWrapper = textArea().width(model.contentWidth).lineHeight(titleLineHeightActual),
			subtitleTextWrapper = textArea().width(model.contentWidth).lineHeight(subtitleLineHeightActual),
			footerTextWrapper = textArea().width(model.contentWidth - model.logoSize).lineHeight(footerLineHeight),

			chartKey = lineKey({lineThickness: model.lineStrokeWidth})
				.style(function (d) {
					return d.value;
				})
				.label(function (d) {
					if (model.labelLookup !== null && model.labelLookup[d.key]) {
						return model.labelLookup[d.key];
					}
					return d.key;
				}),

			elementPositions = [],
			totalHeight = 0;

		//position stuff
		//start from the top...
		var title = svg.append('g').attr('class','chart-title').datum(model.title).call(titleTextWrapper);
		if (!model.titlePosition) {
			if (model.title) {
				model.titlePosition = {top: totalHeight + titleFontSize, left: 0};
				//if the title is multi line it's positon should only be the offset by the height of the first line...
				totalHeight += (getHeight(title) + model.blockPadding - titleLineSpacing);
			} else {
				model.titlePosition = {top: totalHeight, left: 0};
			}
		}

		title.attr('transform', model.translate(model.titlePosition));

		var subtitle = svg.append('g').attr('class','chart-subtitle').datum(model.subtitle).call(subtitleTextWrapper);

		if (!model.subtitlePosition) {
			if (model.subtitle) {
				model.subtitlePosition = {top: totalHeight + subtitleFontSize, left: 0};
				totalHeight += (getHeight(subtitle) + model.blockPadding);
			} else {
				model.subtitlePosition = {top: totalHeight, left: 0};
			}
		}

		subtitle.attr('transform', model.translate(model.subtitlePosition));

		if (model.key) {
			var entries = model.y.series.map(function (d) {
				return {key: d.label, value: d.className};
			});

			var key = svg.append('g').attr('class', 'chart-key').datum(entries).call(chartKey);

			if (!model.keyPosition) {
				model.keyPosition = {top: totalHeight, left: halfLineStrokeWidth};
				totalHeight += (getHeight(key) + model.blockPadding);
			}
			key.attr('transform', model.translate(model.keyPosition));
		}

		var chartSVG = svg.append('g').attr('class', 'chart');

		if (!model.chartPosition) {
			model.chartPosition = {
				top: totalHeight + halfLineStrokeWidth,
				left: (model.numberAxisOrient === 'left' ? 0 : halfLineStrokeWidth)
			};
		}

		chartSVG.attr('transform', model.translate(model.chartPosition));

		var footnotes = svg.append('g').attr('class','chart-footnote').datum(model.footnote).call(footerTextWrapper);
		var source = svg.append('g').attr('class','chart-source').datum(model.sourcePrefix + model.source).call(footerTextWrapper);
		var sourceHeight = getHeight(source);

		if (model.hideSource) {
			sourceHeight = 0;
			source.remove();
		}

		var footnotesHeight = getHeight(footnotes);
		var footerHeight = Math.max(footnotesHeight + sourceHeight + (model.blockPadding * 2), model.logoSize);

		totalHeight += (footerHeight + model.blockPadding);

		if (!model.height) {
			model.height = totalHeight + model.chartHeight;
		} else {
			model.chartHeight = model.height - totalHeight;
			if (model.chartHeight < 0) {
				model.error({
					node:chartSVG,
					message:'calculated plot height is less than zero'
				});
			}
		}

		svg.attr('height', Math.ceil(model.height));

		//the position at the bottom of the 'chart'
		var currentPosition = model.chartPosition.top + model.chartHeight;
		footnotes.attr('transform', model.translate({ top: currentPosition + footerLineHeight + model.blockPadding }));
		source.attr('transform', model.translate({ top: currentPosition + footnotesHeight + sourceLineHeightActual + (model.blockPadding * 2)}));

		//the business of the actual chart
		//make provisional scales
		var valueScale = d3.scale.linear()
			.domain(model.valueDomain.reverse())
			.range([0, model.chartHeight ]);

		if (model.niceValue) {
			valueScale.nice();
		}

		var timeScale = d3.time.scale()
			.domain(model.timeDomain)
			.range([0, model.chartWidth]);

		//first pass, create the axis at the entire chartWidth/Height

		var vAxis = numberAxis()
//				.orient( model.numberAxisOrient )
				.tickFormat(model.numberAxisFormatter)
				.simple(model.simpleValue)
				.tickSize(model.chartWidth)	//make the ticks the width of the chart
				.scale(valueScale),

			timeAxis = dateAxis()
				.simple(model.simpleDate)
				.yOffset(model.chartHeight)	//position the axis at the bottom of the chart
				.scale(timeScale);

		if (model.numberAxisOrient !== 'right' && model.numberAxisOrient !== 'left') {
			vAxis.noLabels(true);
		} else {
			vAxis.orient(model.numberAxisOrient);
		}

		chartSVG.call(vAxis);
		chartSVG.call(timeAxis);

		//measure chart
		var widthDifference = getWidth(chartSVG) - model.chartWidth, //this difference is the ammount of space taken up by axis labels
			heightDifference = getHeight(chartSVG) - model.chartHeight,
			//so we can work out how big the plot should be (the labels will probably stay the same...
			plotWidth = model.chartWidth - widthDifference,
			plotHeight = model.chartHeight - heightDifference,
			newValueRange = [valueScale.range()[0], plotHeight],
			newTimeRange = [timeScale.range()[0], plotWidth];

		valueScale.range(newValueRange);
		timeScale.range(newTimeRange);
		timeAxis.yOffset(plotHeight);
		vAxis.tickSize(plotWidth).tickExtension(widthDifference);

		//replace provisional axes
		chartSVG.selectAll('*').remove();
		chartSVG.call(vAxis);
		chartSVG.call(timeAxis);
		if (model.numberAxisOrient !== 'right') {
			//figure out how much of the extra width is the vertical axis lables
			var vLabelWidth = 0;
			chartSVG.selectAll('.y.axis text').each(function(){
				vLabelWidth = Math.max(vLabelWidth, getWidth(d3.select(this)));
			});
			model.chartPosition.left += vLabelWidth + 4;//NOTE magic number 4
		}

		model.chartPosition.top += (getHeight(chartSVG.select('.y.axis')) - plotHeight);
		chartSVG.attr('transform', model.translate(model.chartPosition));

		var plot = chartSVG.append('g').attr('class', 'plot');

		var logo = svg.append('g').call(ftLogo, model.logoSize);
		var heightOfFontDescenders = 3;
		var baselineOfLastSourceLine = model.height - getHeight(logo) - heightOfFontDescenders - (sourceLineHeightActual - sourceFontSize);

		logo.attr('transform', model.translate({
			left: model.width - model.logoSize,
			top: baselineOfLastSourceLine
		}));

		function drawPlot(g, series) {
			//null values in the data are interpolated over
			//NaN values are represented by line breaks
			var normalisedData = model.data.map(function(d){
				return {
					x:d[model.x.series.key],
					y:d[series.key]
				};
			});

			normalisedData = normalisedData.filter(function(d){
				return (d.y !== null);
			});	//filter out null values, these are to be interpolated over

			var line = d3.svg.line()
				.interpolate(interpolator.gappedLine)
				.x( function(d){ return timeScale(d.x); } )
				.y( function(d){ return valueScale(d.y); } );

			g.append('path')
				.datum(normalisedData)
				.attr('class', 'line ' + series.className)
				.attr('stroke-width', model.lineStrokeWidth)
				.attr('d', function(d){
					console.log('datum ', d);
					return line(d);
				});
		}

		var i = model.y.series.length;

		while (i--) {
			drawPlot(plot, model.y.series[i]);
		}

	}

	return chart;
}

module.exports = lineChart;
