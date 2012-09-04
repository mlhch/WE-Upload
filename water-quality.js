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
	for (var key in config) {
		this[key] = config[key];
	}
	
	if (!this.table) {
		alert('config.table not specified')
		return
	}
	var theads = this.table.getElementsByTagName('thead');
	if (theads.length) {
		this.thead = theads[0];
	} else {
		this.thead = document.createElement('thead');
		this.table.insertBefore(this.thead, this.table.firstChild);
	}
	
	var tbodies = this.table.getElementsByTagName('tbody');
	if (tbodies.length) {
		this.tbody = tbodies[0];
	} else {
		this.tbody = document.createElement('tbody');
		this.table.appendChild(this.tbody);
	}

	this.clickFilterLocation(); // use cookie set watershed first
	this.initColumnSettings();
	
	this.clickDetails();
	this.initEventAddNew();
	this.validateForm();
	this.clickColumnConfig();
	this.initEventTypeahead();
	this.initEventExport();
	
	this.loadData();
}
WaterQuality.prototype = {
	table: null,
	loadData: function() {
		var me = this;
		
		me.loadLocations(null, function() {
			jQuery(function ($) {
				var watershed_name = $(me.filterLocations).val();
				
				$.get("./observations.json", {watershed: watershed_name}, function(jsonData) {
					var data = eval('(' + jsonData + ')');
					
					me.setFields( data.fields );
					me.data = data.observations;
					
					me.renderFieldsSettings();
					
					if ( me.data instanceof Array && !me.data.length ) {
						me.clearTable();
						alert('No data entries available');
					} else {
						me.showOriginalTable();
						me.enableTableSorter();
					}
				});
			});
		});
	},
	loadLocations: function(watershed, callback) {
		var me = this;
		
		jQuery( function ($) {
			if (!watershed && $.cookie) {
				watershed = $.cookie('watershed');
			}
			
			$.get('./locations.json', null, function(jsonData) {
				var data = eval('(' + jsonData + ')');
				
				$(me.filterLocations).empty();
				for (var i = 0, row; row = data[i++];) {
					$(me.filterLocations).append('<option value="'
						+ row.watershed_name + '">'
						+ row.watershed_name + ' / ' + row.count + '</option>');
				}
				
				$(me.filterLocations).val(watershed);
				
				$.isFunction(callback) && callback();
			});
		});
	},
	clickFilterLocation: function() {
		var me = this;
		
		jQuery(function ($) {
			$(me.filterLocations).change(function() {
				var watershed = $(me.filterLocations).val();
				$.cookie('watershed', watershed);
				me.loadData();
			});
			
		});
	},
	setFields: function( serverFields ) {
		var fields = {};
		
		var cookieFields = jQuery.cookie('fields');
		if (cookieFields instanceof Array && cookieFields.length) {
			for (var i = 0, field; field = cookieFields[i++];) {
				if (serverFields[field]) {
					fields[field] = serverFields[field];
					fields[field][4] = 1;
					delete serverFields[field];
				}
			}
			for (var i in serverFields) {
				fields[i] = serverFields[i];
				fields[i][4] = 0;
			}
		} else {
			fields = serverFields;
		}
		
		this.fields = fields;
	},
	renderFieldsSettings: function() {
		var html = [], ul = this.selector, fields = this.fields;
		for (var i in fields) {
			var field = fields[i];
			html.push(
				['<li>', field[2],
				 '<input type="checkbox" id="ckb-', field[0], '" value="', field[0], '"',
				 (field[4] ? ' checked="checked"' : ''), ' />',
				 '</li>'].join(''));
		}
		ul.innerHTML = html.join('');
	},
	showOriginalTable: function() {
		this.clearTable();
		visibleFields = this.getVisibleFields();
		
		var tr = this.thead.insertRow(0);
		for (var i = 0, field; field = visibleFields[i++];) {
			tr.insertAdjacentHTML('beforeEnd', '<th id="th-' + field[0] + '">' + field[2] + '</th>');
		}
		tr.insertAdjacentHTML('beforeEnd', '<th class="right">Action</th>');
		
		var odd = 1;
		for (var id in this.data) {
			var row = this.data[id];
			
			var html = [];
			html.push('<tr id="entry-' + row[0] + '" class="' + (odd++ % 2 ? 'odd' : 'even') + '">');
			for (var i = 0, field; field = visibleFields[i++];) {
				html.push('<td>' + row[field[3]] + '</td>');
			}
			html.push('<td class="right" style="padding: 0px">');
			html.push(
				[
				 '<button type="button" style="font-size:12px; margin:0px"',
				 ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">',
				 '<span class="ui-button-text" style="padding:1px 1em">Details</span>',
				 '</button></td>'
			].join(''));
			html.push('</tr>');
			this.tbody.insertAdjacentHTML('beforeEnd', html.join(''));
		}
	},
	clearTable: function () {
		while (this.thead.rows.length) {
			this.thead.deleteRow(0);
		}
		while (this.tbody.rows.length) {
			this.tbody.deleteRow(0);
		}
	},
	getVisibleFields: function() {
		var ckbs = this.selector.getElementsByTagName('input');
		
		var fields = [];
		for (var i = 0, ckb; ckb = ckbs[i++];) {
			var field = this.fields && this.fields[ckb.value];
			if (ckb.checked && field) { // 4 means Visible
				fields.push(field);
			}
		}
		
		return fields;
	},
	enableTableSorter: function() {
		var me = this;
		
		var headers = {};
		// the Action column
		headers[me.getVisibleFields().length] = { sorter: false };
		
		jQuery(function ($) {
			var sortList = $.cookie('sortList') || [];
			if (sortList instanceof Array) {
				var len = $( 'input:checked', me.selector ).length;
				for (var i = 0; i < sortList.length; i++) {
					if (sortList[i][0] >= len) {
						sortList.splice(i);
					}
				}
			} else {
				sortList = [];
			}
			
			if ($.tablesorter) {
				$( me.table ).tablesorter({
					headers: headers,
					sortList: sortList || [],
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
			pagesize && $('.pagesize', me.pager).val(pagesize);
			
			if ($.tablesorterPager) {
				$( me.table ).tablesorterPager({
					container: $(me.pager),
					size: pagesize || $('.pagesize', me.pager).val(),// .pagesize is loaded after the table render
					positionFixed: false,
				}).bind('applyWidgets', function() {
					$.cookie('pagesize', this.config.size);
					
					var c = this.config, pager = c.container;
					if (c.page < 1) {
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
					if (c.page >= c.totalPages - 1) {
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
	initColumnSettings: function() {
		var me = this;
		
		jQuery( function($) {
			$( me.selector )
			.css( 'cursor', 'pointer' )
			.click( function(e) {
				var ckb = e.target || e.srcElement;
				if (ckb.tagName != 'INPUT') {
					return;
				} else {
					me.fields[ckb.value][4] = ckb.checked;
					
					var index = 0, fields = [];
					$( 'input', me.selector ).each(function(i, c) {
						if (!ckb.checked && c === ckb) {
							index++;
						}
						if (c.checked) {
							fields.push(c.value);
						}
					});
					if (!ckb.checked) {
						var sortList = $.cookie('sortList');
						delete sortList[index];
						$.cookie('sortList', sortList);
					}
					if (fields.length) {
						$.cookie('fields', fields);
					}
					
					me.showOriginalTable();
					me.enableTableSorter();
				}
			});
		});
		
		jQuery(document).ready(function ($) {
			if ($( me.selector ).sortable) {
				$( me.selector )
				.css('cursor', 'pointer')
				.sortable({
					stop: function(e) {
						var sortList = $.cookie('sortList');
						var thList = [];
						for (var i = 0; i < sortList.length; i++) {
							var index = sortList[i][0];
							var th = me.thead.rows[0].cells[index];
							thList.push([th.id, sortList[i][1]]);
						}
						
						me.showOriginalTable();
						
						sortList = [];
						for (var i = 0; i < thList.length; i++) {
							var th = thList[i];
							sortList.push([document.getElementById(th[0]).cellIndex, th[1]]);
						}
						$.cookie('sortList', sortList);
						
						me.enableTableSorter();
						
						var fields = [];
						$( 'input', me.selector ).each(function(i, ckb) {
							if (ckb.checked) {
								fields.push(ckb.value);
							}
						});
						if (fields.length) {
							jQuery.cookie('fields', fields);
						}
					}
				})
			}
		});
	},
	clickDetails: function() {
		var me = this;
		
		jQuery(function($) {
			$(me.table).click(function(e) {
				var el = e.srcElement || e.target;
				if (el.parentNode.tagName == 'BUTTON') {
					var tr = el.parentNode.parentNode.parentNode;
					var id = tr.id.substr(6);
					var row = me.data[id];
					$('.field', me.form).each(function(index, input) {
						if (input.type == 'text' || input.type == 'hidden') {
							input.value = row[index] || '';
						}
					})
					me.showDialog();
				}
			});
		});
	},
	showDialog: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			var id = parseInt( $('input[name=id]').val() );
			
			$( me.dialog ).dialog({
				width: 500,
				height: 400,
				zIndex: 99999,
				buttons: [{
					text: "Delete",
					style: "padding: 0 2em; font-size: 12px;" + (id ? '': 'display:none'),
					click: function() {
						me.delEntry();
					}
				}, {
					text: "Save",
					style: "padding: 0 2em; font-size: 12px",
					click: function() {
						me.saveEntry();
					}
				}, {
					text: "Cancel",
					style: "padding: 0 2em; font-size: 12px",
					click: function() {
						$( me.dialog ).dialog( 'close' );
					}
				}]
			});
		});
	},
	initEventAddNew: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if ($().datetimepicker) {
				$('input[name=datetime]', me.form)
					.datetimepicker({
						ampm: true,
						dateFormat: 'mm/dd/yy',
						timeFormat: 'h:mm TT'
					})
					.datetimepicker('setDate', new Date());
			}
			
			$( me.btnAddNew ).click(function () {
				$( '.field', me.form ).each( function(index, input) {
					if (input.name == 'id') {
						input.value = 0;
					} else {
						input.value = '';
					}
				})
				$('input[name=datetime]', me.form).datepicker().datepicker('setDate', new Date);
				me.showDialog();
			});
		});
	},
	saveEntry: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if ($(me.form).validate().form()) {
				
				$.post($(me.form).attr('action'), $(me.form).serialize(), function(data, status) {
					if (status == 'success') {
						var result = eval('(' + data + ')');
						if (result.affectedRows) {
							$(me.dialog).dialog( 'close' );
							
							if (result.insertId) {
								alert('Entry ' + result.insertId + ' added');
							} else {
								alert('Entry ' + result.id + ' updated');
							}
							
							me.loadLocations(function() {
								me.loadData();
							});
							me.initEventTypeahead(1);
						} else {
							alert('No changes updated');
						}
					} else {
						alert('Sorry, the server encountered an error');
					}
				});
			}
		});
	},
	
	delEntry: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			var id = parseInt( $('input[name=id]').val() );
			
			$.post( $(me.form).attr('action'), {
				id: id,
				action: 'delete_data_entry'
			}, function (data, status) {
				if (status == 'success') {
					var result = eval('(' + data + ')');
					if (result.affectedRows) {
						$( me.dialog ).dialog( 'close' );
						alert('Entry ' + result.id + ' deleted');
						
						delete me.data[id];
						$( "#entry-" + id).remove();
						$( me.table ).trigger( "update" );
						
						me.loadLocations();
						me.initEventTypeahead(1);
					} else {
						alert('Data Entry ' + id + ' does not exist');
					}
				} else {
					alert('Sorry, the server encountered an error');
				}
			});
		});
	},
	validateForm: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if (!$.validator) {
				return;
			}
			
			$.validator.addMethod("secchi_b", function(value, element, param) {
				return param;
			}, "a value that should not exceed +/- 2 meters from reading A");
			
			$(me.form).validate({
				rules: {
					location_id: {
						required: true,
						pattern: /^[a-z][a-z0-9]*$/i,
					},
					station_name: {
						required: true,
					},
					watershed_name: {
						required: true,
					},
					datetime: {
						pattern: /^\d{2}\/\d{2}\/\d{4} \d{1,2}:\d{2} [AP]M$/,
					},
					gps: {
						pattern: /^(-?(\d|[1-8]\d)(\.\d+)?)[, ](-?(\d|[1-9]\d|1[1-7]\d)(\.\d+)?)$/
					},
					do_mlg: {
						pattern: /^((\d|1[0-4])(\.\d+)?|15)$/
					},
					"do_%": {
						pattern: /^((\d|[1-9]\d|10\d)(\.\d+)?|110)$/
					},
					cond: {
						pattern: /^((\d|[1-9]\d{1,2}|1[0-4]\d{2})(\.\d+)?|1500)$/
					},
					salinity: {
						pattern: /^0\.\d+$/
					},
					temp: {
						pattern: /^((\d|[12][0-9])(\.\d+)?|30)$/
					},
					ph: {
						pattern: /^([4-7](\.\d+)?|8)$/
					},
					secchi_a: {
						pattern: /^(([0-9]|1[0-9])(\.\d+)?|20)$/,
						secchi_b: function(el) {
							var b = parseFloat($('input[name=secchi_b]', me.form).val());
							var a = parseFloat(el.value);
							if (b && a) {
								$('input[name=secchi_d]').val(a / 2 + b / 2);
							}
							return true;
						}
					},
					secchi_b: {
						secchi_b: function(el) {
							var a = parseFloat($('input[name=secchi_a]', me.form).val());
							var b = parseFloat(el.value);
							
							if (a && b) {
								$('input[name=secchi_d]').val(a / 2 + b / 2);
							}
							
							return (!a && el.value == '') || (Math.abs(a - b) <= 2);
						}
					},
					secchi_d: {
						secchi_b: function(el) {
							var a = parseFloat($('input[name=secchi_a]', me.form).val());
							var b = parseFloat($('input[name=secchi_b]', me.form).val());
							var d = parseFloat($('input[name=secchi_d]', me.form).val());
							
							return (!a && !b) || a + b == d + d;
						}
					},
					lab_id: {
						pattern: /^[YN]$/
					},
					nitrate: {
						pattern: /^(([0-9]|[1-3][0-9])(\.\d+)?|40)$/
					},
					phosphate: {
						pattern: /^([0-3](\.\d+)?|4)$/
					},
					coliform: {
						pattern: /^(Present|Absent)$/
					}
				},
				messages: {
					gps: 'LatLong decimal degrees',
					do_ml: "Typical observed values range from 0-15 mg/l. Values below 7 are not optimal but should be accepted. D.O. is  obviously dependent on temperature (expect lower values with increased temperatures). ",
					"do_%": "A value between 0 and 110 calculated based on amount of oxygen in the water at the given temperature",
					cond: "A value between 0 and 1500",
					salinity: "A value under 1 in fresh water",
					temp: "A value between 0 and 30",
					ph: "A value between 4 and 8",
					secchi_a: "A value between 0 and 20 meters",
					secchi_d: "A value which equals the average of reding a and b",
					lab_id: "Y or N",
					nitrate: "A value between 0 and 40",
					phosphate: "A value between 0 and 4",
					coliform: "Present or Absent",
				}
			});
		});
	},
	clickColumnConfig: function() {
		var me = this;
		
		jQuery( function ($) {
			$('#fields-config').click(function() {
				$(me.selector).slideToggle();
			});
		});
	},
	initEventTypeahead: function(refresh) {
		var me = this;
		if (refresh) {
			me.refresh = refresh;
			return;
		}
		
		jQuery(document).ready(function ($) {
			if (!$().typeahead) {
				return ;
			}
			$( "input[name=watershed_name]", me.form ).typeahead({
				source: function (query, callback) {
					var that = this;
					if (that.items && !me.refresh) {
						return that.items;
					}
					$.get("./typeaheads.json", null, function(jsonData) {
						var data = eval('(' + jsonData + ')');
						var items = [];
						for (var i = 0, item; item = data[i++];) {
							items.push(item[2] + ' (' + item[0] + ', ' + item[1] + ')');
						}
						that.items = items;
						callback(items);
					});
				},
				updater: function(value) {
					var m = value.match(/^(.*) \((.*), (.*)\)$/);
					
					$(me.form).find("input[name=location_id]").val(m[2]);
					$(me.form).find("input[name=station_name]").val(m[3]);
					this.items = null;
					
					return m[1];
				}
			});
		});
	},
	initEventExport: function() {
		var me = this;
		
		jQuery(function($) {
			$('#export_as_csv').click(function() {
				var watershed_name = $(me.filterLocations).val();
				location.href = "./observations.json?export&" + $.param({watershed: watershed_name});
			});
		})
	}
}