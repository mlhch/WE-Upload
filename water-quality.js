(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				try {
					return config.json ? JSON.parse(cookie) : cookie;
				} catch (e) {
					return '';
				}
			}
		}

		return null;
	};

	config.json = true;

	$.removeCookie = function (key, options) {
		if ($.cookie(key, options) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

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
	
	this.clickDetails();
	this.initEventAddNew();
	this.initEventTypeahead();
}

WaterQuality.prototype = {
	query: function(query) {
		var m = query.match(/([^\/]+)\.(json|action)\??(.*)/);
		if (m) {
			return '../wp-admin/admin-ajax.php?action=cura_'
				+ m[1] + '.' + m[2] + (m[3] ? '&' + m[3] : '');
		}
		return query;
	},
	table: null,

	locationList: null,
	
	showObservationTable: function() {
		this.clearTable();
		visibleFields = this.getVisibleFields();
		
		var tr = jQuery(this.table).find('thead')[0].insertRow(0);
		for (var i = 0, field; field = visibleFields[i++];) {
			tr.insertAdjacentHTML('beforeEnd', '<th id="th-' + field[0] + '">' + field[2] + '</th>');
		}
		tr.insertAdjacentHTML('beforeEnd', '<th style="text-align:center; width:10px">Action</th>');
		
		var odd = 1, html = [];
		for (var id in this.data) {
			var row = this.data[id];
			
			html.push('<tr id="entry-' + row[0] + '" class="' + (odd++ % 2 ? 'odd' : 'even') + '">');
			for (var i = 0, field; field = visibleFields[i++];) {
				html.push('<td>' + (row[field[3]] !== null ? row[field[3]] : '') + '</td>');
			}
			html.push('<td style="padding: 0px; text-align: center">');
			html.push(
				[
				 '<button type="button" style="font-size:12px; margin:3px 10px"',
				 ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">',
				 '<span class="ui-button-text" style="padding:3px 1em">Details</span>',
				 '</button></td>'
			].join(''));
			html.push('</tr>');
		}
		
		if (odd == 1) {
			html.push('<tr>');
			for (var i = 0, field; field = visibleFields[i++];) {
				html.push('<td>&nbsp;</td>');
			}
			html.push('<td>&nbsp;</tr>');
		}
		jQuery(this.table).find('tbody')[0].insertAdjacentHTML('beforeEnd', html.join(''));
	},
	clearTable: function () {
		var thead = jQuery(this.table).find('thead')[0];
		while (thead.rows.length) {
			thead.deleteRow(0);
		}
		
		var tbody = jQuery(this.table).find('tbody')[0];
		while (tbody.rows.length) {
			tbody.deleteRow(0);
		}
	},
	getVisibleFields: function() {
		return this.visibleFields || [];
	},
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


	initEventAddNew: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if ($().datetimepicker) {
				$('input[name=datetime]', $(me.form))
					.datetimepicker({
						ampm: true,
						dateFormat: 'mm/dd/yy',
						timeFormat: 'hh:mm TT'
					})
					.datetimepicker('setDate', new Date());
			}
			
			$( me.btnAddNew ).click(function () {
				$( 'input', $(me.form) ).each( function(index, input) {
					if (input.name == 'id') {
						input.value = 0;
					} else if (me.fields[input.name]) {
						var i = me.fields[input.name][3];
						if (input.name == 'datetime') {
							$(input).timepicker('enable');
						}
						
						if (input.type == 'text') {
							input.value = '';
							input.readOnly = !me.canAdd;
						} else if (input.type == 'radio') {
							input.checked = false;
							input.disabled = me.canAdd ? false : 'disabled';
						}
					}
				})
				$('input[name=datetime]', $(me.form)).datepicker().datepicker('setDate', new Date);
				me.showDialog('Add Observation');
				$.validator && $(me.form).validate().resetForm();
			});
		});
	},

	
	displayMessage: function(messageText) {
		jQuery(document).ready(function($) {
			if ($('#message').length == 0) {
				$('<div id="message"></div>').appendTo('body');
			}

			$('#message').html(messageText).show().position({
				at : 'top center',
				of : window
			}).fadeOut(5000);
		});
	},
	
	

	initEventTypeahead: function(refresh) {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if (!$().typeahead) {
				return ;
			}
			var form = $(me.form);
			form.find( "input[name=watershed_name]" ).typeahead({
				source: function (query, callback) {
					if (me.typeaheadWatershedItems) {
						return me.typeaheadWatershedItems;
					}
					if (me.locationList) {
						var items = [];
						for (var i = 0, row; row = me.locationList[i++];) {
							items.push(row.watershed_name);
						}
						me.typeaheadWatershedItems = items;
						callback(items);
						return ;
					}
					$.getJSON(me.query('./locations.json'), function(json) {
						me.locationList = json.locations;
						
						var items = [];
						for (var i = 0, row; row = me.locationList[i++];) {
							items.push(row.watershed_name);
						}
						me.typeaheadWatershedItems = items;
						callback(items);
						return ;
					});
				},
				updater: function(value) {
					var els = [];
					els.push(form.find( "input[name=station_name]" ));
					els.push(form.find( "input[name=location_id]" ));
					els.push(form.find( "input[name=latitude]" ));
					els.push(form.find( "input[name=longitude]" ));
					for (var i = 0, el; el = els[i++];) {
						el.val('').attr('readOnly', false).removeClass( 'error' );
						form.validate().errorsFor(el[0]).hide();
					}
					return value;
				}
			});
			form.find( "input[name=station_name]" ).typeahead({
				source: function (query, callback) {
					var watershed = $( "input[name=watershed_name]", form ).val();
					if (watershed.length == 0) {
						return ;
					}
					
					me.typeaheadStationItems = me.typeaheadStationItems || {};
					me.typeaheadStationRows = me.typeaheadStationRows || {};
					if (me.typeaheadStationItems[watershed]) {
						return me.typeaheadStationItems[watershed];
					}
					$.getJSON(me.query("./typeaheads_station_name.json?watershed=" + watershed), function(json) {
						var rows = json.typeaheads, items = [];
						for (var i = 0, row; row = rows[i++];) {
							items.push(row.station_name);
						}
						me.typeaheadStationItems[watershed] = items;
						me.typeaheadStationRows[watershed] = rows;
						callback(items);
					});
				},
				updater: function(value) {
					var watershed = form.find( "input[name=watershed_name]" ).val();
					var station = value;
					if (watershed.length == 0 || station.length == 0) {
						return value;
					}
					
					form.find( "input[name=location_id]" ).val('');
					form.find( "input[name=latitude]" ).val('').attr('readOnly', false);
					form.find( "input[name=longitude]" ).val('').attr('readOnly', false);
					
					if (me.typeaheadStationRows[watershed]) {
						var el, validator = form.validate();
						for (var i = 0, row; row = me.typeaheadStationRows[watershed][i++];) {
							if (row.station_name == station) {
								el = form.find( "input[name=location_id]" ).val(row.location_id);
								
								el = form.find( "input[name=latitude]" ).val(row.latitude);
								el.attr('readOnly', row.latitude !== null && validator.check(el[0]));
								
								el = form.find( "input[name=longitude]" ).val(row.longitude);
								el.attr('readOnly', row.longitude !== null && validator.check(el[0]));
								
								validator.showErrors();
								break;
							}
						}
					}
					
					return value;
				}
			});
			form.find( "input[name=location_id]" ).typeahead({
				source: function (query, callback) {
					var watershed = form.find( "input[name=watershed_name]" ).val();
					if (watershed.length == 0) {
						return ;
					}
					
					me.typeaheadLocationItems = me.typeaheadLocationItems || {};
					me.typeaheadLocationRows = me.typeaheadLocationRows || {};
					if (me.typeaheadLocationItems[watershed]) {
						return me.typeaheadLocationItems[watershed];
					}
					$.getJSON(me.query("./typeaheads_location_id.json?watershed=" + watershed), function(json) {
						var rows = json.typeaheads, items = [];
						for (var i = 0, row; row = rows[i++];) {
							items.push(row.location_id);
						}
						me.typeaheadLocationItems[watershed] = items;
						me.typeaheadLocationRows[watershed] = rows;
						callback(items);
					});
				},
				updater: function(value) {
					var watershed = form.find( "input[name=watershed_name]" ).val();
					var location_id = value;
					if (watershed.length == 0 || location_id.length == 0) {
						return value;
					}
					
					form.find( "input[name=station_name]" ).val('');
					form.find( "input[name=latitude]" ).val('').attr('readOnly', false);
					form.find( "input[name=longitude]" ).val('').attr('readOnly', false);
					
					if (me.typeaheadLocationRows[watershed]) {
						var el, validator = form.validate();
						for (var i = 0, row; row = me.typeaheadLocationRows[watershed][i++];) {
							if (row.location_id == location_id) {
								el = form.find( "input[name=station_name]" ).val(row.station_name);
								
								el = form.find( "input[name=latitude]" ).val(row.latitude);
								el.attr('readOnly', row.latitude !== null && validator.check(el[0]));
								
								el = form.find( "input[name=longitude]" ).val(row.longitude);
								el.attr('readOnly', row.longitude !== null && validator.check(el[0]));
								
								validator.showErrors();
								break;
							}
						}
					}
					
					return value;
				}
			});
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