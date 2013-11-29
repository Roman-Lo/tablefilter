/**
 * tablefilter.js v1.0.0
 *
 * Copyright (c) 2013 Roman Lo and other contributors
 * Released under the MIT license
 * Date: 2013-11-04
 */
if (!jQuery) { throw new Error("Table Filter requires jQuery") }


+(function($) {

	var TableFilter = function (element, options) {
		this.$element = $(element)
		this.filterTrigger = "filter-change"
		this.options = this.getOptions(options)
		this.filterSelectedClassname = this.options.selectedClassname
		this.$filters = this.$element.find(this.options.filters)
		this.$tableRows = $(this.options.dataTableRows)
		this.initFilters()
		this.types = this.initFilterTypes()
		this.initTableRows()
		this.bindEvents()
	}

	TableFilter.DEFAULT = {
		defaultfiltby : undefined 
		, dataTableRows : ''
		, filters : '' //
		, on : 'click'
		, selectedClassname : 'selected'
		, beforeFilterChanged : function (callType, inst) {
			return this 
		}
		, afterFilterChanged : function (callType, inst) { 
			return this 
		}
		, beforeTableInitialized : function () {
			return this 
		}
		, afterTableInitialized : function () { 
			return this 
		}
	}
	
	TableFilter.prototype.get = function (command) {
		if (command === undefined || command == null) return {}
		if (command == "types") {
			return this.types
		} else if (command == "options") {
			return this.options
		} else if (command == "filters") {
			return this.$filters
		} else if (command == "rows") {
			return this.$tableRows
		}
	}

	TableFilter.prototype.filt = function (command) {
		if (command === undefined || command == null) return {}
		this.$filters.each(function () {
			var $this = $(this)
				, type = $this.data('filter-type')
			if (type == command) {
				$this.trigger('filter-change')
			}
		})
	}

	TableFilter.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefault(), this.$element.data(), options)
		return options
	}

	TableFilter.prototype.getDefault = function () {
		return TableFilter.DEFAULT
	}

	TableFilter.prototype.initFilterTypes = function () {
		var types = []
		this.$filters.each(function () {
			types.push({
				type : $(this).data('filter-type')
			})
		})
		return types
	}

	TableFilter.prototype.initFilters = function () {
		this.$filters.each(function () {
			var $this = $(this)
			$this.data('filter-type', $this.attr('filter-type')).removeAttr('filter-type')
		})
		if (this.options.defaultfiltby !== undefined) {
			this.flushFilterLayout(this.options.defaultfiltby)
		}
	}

	TableFilter.prototype.initTableRows = function () {
		var types = this.types
			, that = this
		this.options.beforeTableInitialized.call(this);
		this.$tableRows.each(function () {
			var $tr = $(this)
			types.forEach(function (item) {
				$tr.data(item.type, $tr.attr('filter-' + item.type) == 'true').removeAttr('filter-' + item.type)
			})
			if (that.options.defaultfiltby !== undefined && !$tr.data(that.options.defaultfiltby)) {
				$tr.hide()
			}
		})
		this.options.afterTableInitialized.call(this);
	}

	TableFilter.prototype.bindEvents = function () {
		var that = this
		this.$filters.on(this.options.on, function (e) {
			e.preventDefault()
			$(this).trigger('filter-change')
		}).on('filter-change', function (e) {
			e.preventDefault()
			that.filterChanged.call(this, 'inner-call', that)
			that.flushFilterLayout($(this).data('filter-type'))
		})
	}


	TableFilter.prototype.filterChanged = function (callType, inst) {
		if (callType === undefined || callType != "inner-call") return
		var filterType = $(this).data('filter-type')
		inst.options.beforeFilterChanged.call(this, callType, inst)
		inst.$tableRows.each(function () {
			var $row = $(this)
			if ($row.data(filterType)) {
				$row.show()
			} else {
				$row.hide()
			}
		})
		inst.options.afterFilterChanged.call(this, callType, inst)
	}

	TableFilter.prototype.flushFilterLayout = function (filterType) {
		var classname = this.filterSelectedClassname
		this.$filters.removeClass(classname).each(function () {		
			var $item = $(this)	
			if ($item.data('filter-type') == filterType) {
				$item.addClass(classname)
				return
			}
		})
	}

	$.fn.tablefilter = function (option) {
		var args = []
		if (typeof option == 'string' && (args = option.split(" ")).length == 2) {
			//advance command execution
			//command format "action param"
			//eg.	by executing 
			//		"$('[tablefilter]').tablefilter('get types')",
			//		the current filter types in the table filter instance will be returned
			var $this = $(this)
			var data  = $this.data('widget.tablefilter')
			if (data) return data[args[0]](args[1])
		} else {
			//construct table filter instance or execute non-data-return function
			this.each(function () {
				var $this = $(this)
				var data  = $this.data('widget.tablefilter')
				var options = typeof option == 'object' && option

				if (!data) $this.data('widget.tablefilter', (data = new TableFilter(this, options)))
				if (typeof option == 'string') data[option]()
			})
		}
		return 
	}

	$.fn.tablefilter.Constructor = TableFilter

	// TableFilter NO CONFLICT
	// =================

	$.fn.tablefilter.noConflict = function () {
		$.fn.tablefilter = old
		return this
	}

})(window.jQuery)
