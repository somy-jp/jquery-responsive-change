/*!
 * jQuery.responsiveChange 1.0
 * https://github.com/somy-jp/jquery-responsive-change
 *
 * Copyright 2014 Keisuke Kasai https://github.com/somy-jp/
 * Released under the MIT license
 */
;(function ($, window, document, undefined)
{
	"use strict";

	var breakpointsByName;
	var breakpointUnit;
	var uidCount = 0;
	var $window;
	var staticOptions;
	var analizedQueries;

	// static method
	$.responsiveChange = function(options)
	{
		staticOptions = $.extend({}, $.responsiveChange.defaults, options);

		if ($window == null) $window = $(window);

		var _breakpoints = [];
		for (var name in staticOptions.breakpoints) {
			var width = staticOptions.breakpoints[name];
			if (width == 'none') width = Number.POSITIVE_INFINITY;

			_breakpoints.push({
				name: name,
				minWidth: 0,
				maxWidth: width
			});
		}
		_breakpoints = sort2D(_breakpoints, 'maxWidth');

		breakpointsByName = {};
		analizedQueries = {};

		for (var i = 0, prevPoint = null; i<_breakpoints.length; i++) {
			var point = _breakpoints[i];
			if (prevPoint) {
				point.minWidth = prevPoint.maxWidth+1;
			}
			breakpointsByName[point.name] = point;
			prevPoint = point;
		}

		breakpointUnit = staticOptions.unit;
	};

	// default static options
	$.responsiveChange.defaults = {
		breakpoints: { sp:480, pb:768, tb:1024, pc:'none' },
		unit: 'px'
	};



	var dataName = 'plugin_responsivechange';
	var defaults = {
		once: null,
		enter: null,
		resize: null,
		exit: null,
		delay: { once: 0, enter: 0, resize: 0, exit: 0 }
	};


    function ResponsiveChange(element, query, options) {
        this.element = element;
        this.query = query;
        this.options = $.extend({}, defaults, options);

		this.timeOutId = {};

        this.init();
    }

    ResponsiveChange.prototype = {

        init: function()
		{
			if (breakpointsByName == null) {
				$.responsiveChange();
			}

			this.active = false;
			this.uid = 'responsivechange_'+(uidCount++);

			var queryResult = this.analizeQuery();
			if (queryResult.mediaQuery == null) return;

			this.mediaQuery = queryResult.mediaQuery;
			this.mql = window.matchMedia(this.mediaQuery);

			this.breakpointName = null;
			this.breakpoint = { max: null, min: null };

			if (this.query != this.mediaQuery) {
				this.breakpointName = this.query;
				this.breakpoint = queryResult.breakpoint;
			}

			this.eventObj = {
				options: staticOptions,
				mediaQuery: this.mediaQuery,
				breakpoint: {
					max: this.breakpoint.max,
					min: this.breakpoint.min,
					name: this.breakpointName
				},
				isAfterOnce: false,
				isAfterEnter: false
			};

			this._onMatchMediaChangeBind = this.onMatchMediaChange.bind(this);
			this._onMatchMediaChangeBind();
			this.mql.addListener(this._onMatchMediaChangeBind);
        },

		destroy: function()
		{
			this.mql.removeListener(this._onMatchMediaChangeBind);

			if (this.timeOutId.once) clearTimeout(this.timeOutId.once);
			if (this.timeOutId.enter) clearTimeout(this.timeOutId.enter);
			if (this.timeOutId.resize) clearTimeout(this.timeOutId.resize);
			if (this.timeOutId.exit) clearTimeout(this.timeOutId.exit);
		},

        onMatchMediaChange: function()
		{
			var self = this;

			if (this.mql.matches) {
				this.active = true;

				if (this.timeOutId.exit) clearTimeout(this.timeOutId.exit);

				if (!this.options.delay.once) {
					this.triggerOnce();
				}
				else {
					this.timeOutId.once = setTimeout(function() {
						self.triggerOnce();
					}, this.options.delay.once);
				}

				if (!this.options.delay.enter) {
					this.triggerEnter();
				}
				else {
					this.timeOutId.enter = setTimeout(function() {
						self.triggerEnter();
					}, this.options.delay.enter);
				}

				if (!this.options.delay.resize) {
					this.triggerResize();
				}
				else {
					this.timeOutId.resize = setTimeout(function() {
						self.triggerResize();
					}, this.options.delay.resize);
				}
			}
			else if (this.active) {
				this.active = false;

				this.eventObj.isAfterOnce = false;
				this.eventObj.isAfterEnter = false;

				if (this.timeOutId.once) clearTimeout(this.timeOutId.once);
				if (this.timeOutId.enter) clearTimeout(this.timeOutId.enter);
				if (this.timeOutId.resize) clearTimeout(this.timeOutId.resize);

				if (this.options.resize) {
					$window.off('resize.'+this.uid);
				}

				if (!this.options.delay.exit) {
					this.triggerExit();
				}
				else {
					this.timeOutId.exit = setTimeout(function() {
						self.triggerExit();
					}, this.options.delay.exit);
				}
			}
        },

		triggerOnce: function()
		{
			if (!this.options.once) return;

			this.options.once.apply(this.element, [this.eventObj]);
			this.options.once = null;
			this.eventObj.isAfterOnce = true;
			this.eventObj.isAfterEnter = false;
		},

		triggerEnter: function()
		{
			if (!this.options.enter) return;

			this.options.enter.apply(this.element, [this.eventObj]);
			this.eventObj.isAfterOnce = false;
			this.eventObj.isAfterEnter = true;
		},

		triggerResize: function()
		{
			if (!this.options.resize) return;

			this.options.resize.apply(this.element, [this.eventObj]);
			this.eventObj.isAfterOnce = false;
			this.eventObj.isAfterEnter = false;

			var self = this;
			setTimeout(function(){
				$window.on('resize.'+self.uid, function(){
					self.options.resize.apply(self.element, [self.event]);
				});
			},1);
		},

		triggerExit: function()
		{
			if (!this.options.exit) return;

			this.options.exit.apply(this.element, [this.eventObj]);
		},

		analizeQuery: function()
		{
			if (analizedQueries[this.query] != null) {
				return analizedQueries[this.query];
			}

			var result = {
				mediaQuery: null,
				isBreakpointString: true,
				breakpoint: {
					min: null,
					max: null
				}
			};

			var queryNames = this.query.split('-');
			if (queryNames.length<1 || queryNames.length>2) {
				result.mediaQuery = this.query;
				result.isBreakpointString = false;
				return result;
			}
			else {
				var minWidth;
				var maxWidth;

				if (queryNames.length == 1) {
					var point = breakpointsByName[queryNames[0]];
					minWidth = point.minWidth || null;
					maxWidth = point.maxWidth || null;
				}
				else {
					var queryPoints = [];

					for (var i = 0; i<queryNames.length; i++)
					{
						var name = queryNames[i];
						if (breakpointsByName[name] == null) {
							result.mediaQuery = this.query;
							result.isBreakpointString = false;
							return result;
						}
						else {
							queryPoints[i] = breakpointsByName[name];
						}
					}

					minWidth = Math.min(queryPoints[0].minWidth, queryPoints[1].minWidth) || null;
					maxWidth = Math.max(queryPoints[0].maxWidth, queryPoints[1].maxWidth) || null;
				}

				if (minWidth == null && maxWidth == null) {
					result.isBreakpointString = false;
					return result;
				}

				result.breakpoint.min = minWidth;
				result.breakpoint.max = maxWidth;

				result.mediaQuery = 'only screen';
				if (minWidth != null && minWidth != 0) {
					result.mediaQuery += ' and (min-width: ' + minWidth + breakpointUnit + ')';
				}
				if (maxWidth != null && maxWidth != Number.POSITIVE_INFINITY) {
					result.mediaQuery += ' and (max-width: ' + maxWidth + breakpointUnit + ')';
				}

				analizedQueries[this.query] = result;

				return result;
			}
		}
    };


    $.fn.responsiveChange = function(query, options)
	{
		if (typeof options === 'object') {
			return this.each(function(){
				if (!$.data(this, dataName)) {
					$.data(this, dataName, []);
				}
				var instance = new ResponsiveChange(this, query, options);
				$.data(this, dataName).push(instance);
			});
		}
		else if (typeof options === 'string' && options === 'destroy') {
			return this.each(function () {
				var instances = $.data(this, dataName);
				for (var i = 0; i<instances.length; i++) {
					var instance = instances[i];
					if (instance.query == query) {
						instance.destroy();
						instance = null;
						instances.splice(i, 1);
					}
				}
				$.data(this, dataName, instances);
			});
        }
    };




	// sort
	var sort2D = function (array, key, order) {
		if (typeof key === "undefined") { key = 1; }
		if (typeof order === "undefined") { order = 1; }
		array.sort(function (a, b) {
			return ((a[key] > b[key]) ? 1 : -1) * order;
		});

		return array;
	};


	/*!
	 * Function.bind Polyfill
	 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	 */
	if (!Function.prototype.bind) {
		Function.prototype.bind = function(oThis) {
			if (typeof this !== 'function') {
				// closest thing possible to the ECMAScript 5
				// internal IsCallable function
				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}

			var aArgs   = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP    = function() {},
				fBound  = function() {
				return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
				aArgs.concat(Array.prototype.slice.call(arguments)));
			};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

})(jQuery, window, document);