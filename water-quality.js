function WaterQuality(config) {
	config = typeof config == 'object' ? config : {}; 
	
	var selectors = config.selectors || {};
	for (var key in selectors) {
		this[key] = selectors[key];
	}
	delete config.selectors;
	
	for (var key in config) {
		this[key] = config[key];
	}
	
	if (!this.table) {
		alert('config.table not specified')
		return
	}
	var theads = jQuery(this.table).find('thead');
	if (theads.length) {
		this.thead = theads[0];
	} else {
		this.thead = document.createElement('thead');
		jQuery(this.table)[0].insertBefore(this.thead, this.table.firstChild);
	}
	
	var tbodies = jQuery(this.table).find('tbody');
	if (tbodies.length) {
		this.tbody = tbodies[0];
	} else {
		this.tbody = document.createElement('tbody');
		jQuery(this.table)[0].appendChild(this.tbody);
	}
}

WaterQuality.prototype = {
	enableTableSorter: function() {
		var me = this;
		
		var headers = {};
		// the Action column don't need sortable
		var cols = me.getVisibleFields().length;
		headers[cols] = { sorter: false };
		
		jQuery(function ($) {
			if ($.tablesorter) {
				$( me.table ).tablesorter({
					headers: headers,
					sortList: me.sortList || [],
					//widthFixed: true,
					widgets: ['zebra'],
				}).bind('sortEnd', function() {
					$.cookie('sortList', this.config.sortList);
					$(this).trigger("applyWidgets");
				});
			}
		});
		jQuery(document).ready(function ($) {
			var pagesize = $.cookie('pagesize');
			pagesize && $('.pagesize', $(me.pager)).val(pagesize);
			
			if ($.tablesorterPager) {
				$( me.table ).tablesorterPager({
					container: $(me.pager),
					size: pagesize || $('.pagesize', $(me.pager)).val(),// .pagesize is loaded after the table render
					positionFixed: false,
				}).bind('applyWidgets', function() {
					var config = this.config, pager = config.container;
					
					if (config.totalPages <= 1 && $(me.filterLocations).val()) {
						$(me.pager).hide();
						return;
					} else {
						$(me.pager).show();
					}
					$.cookie('pagesize', config.size);
					if (config.page < 1) {
						var img = $(config.cssFirst,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
						
						var img = $(config.cssPrev,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
					} else {
						var img = $(config.cssFirst,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
						
						var img = $(config.cssPrev,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
					}
					if (config.page >= config.totalPages - 1) {
						var img = $(config.cssLast,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
						
						var img = $(config.cssNext,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
					} else {
						var img = $(config.cssLast,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
						
						var img = $(config.cssNext,pager);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
					}
				});
			}
		});
	},

	clearTypeaheads: function() {
		var me = this;
		me.typeaheadWatershedItems = null;

		me.typeaheadStationItems = null;
		me.typeaheadStationRows = null;
		
		me.typeaheadLocationItems = null;
		me.typeaheadLocationRows = null;
	},

}