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
	this.initEventMobileSite();
	
	var me = this;
	me.loadLocations(null, function() {
		me.loadData(function() {
			if (!/mobile/i.test(navigator.userAgent)) {
				jQuery('.tooltip_description span').hide();
			}
			if (!jQuery.cookie('mobile-redirect')) {
				if (/mobile/i.test(navigator.userAgent)) {
					jQuery( ".tooltip_description" ).dialog({
						modal: true
					});
				}
			} else {
				jQuery("#remember-choice").attr('checked', 'checked');
			}
		});
	});
}

WaterQuality.prototype = {
	table: null,
	loadData: function(callback) {
		var me = this;
		
		jQuery(function ($) {
			var watershed_id = $(me.filterLocations).val();
			
			$.get("./observations.json", {
				watershed: watershed_id,
			}, function (jsonData) {
				var result = JSON.parse( jsonData );
				
				me.setFields( result.fields );
				me.data = result.observations;
				
				me.renderFieldsSettings();
				
				if ( me.data instanceof Array && !me.data.length ) {
					me.clearTable();
					alert('No data entries available');
				} else {
					me.showOriginalTable();
					me.enableTableSorter();
				}
				
				$.isFunction(callback) && callback();
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
				var data = JSON.parse( jsonData ).locations;
				
				$(me.filterLocations).empty();
				for (var i = 0, row; row = data[i++];) {
					$(me.filterLocations).append('<option value="'
						+ row.id + '"'
						+ (row.id == watershed || row.watershed_name == watershed
								? ' selected="selected"' : '')
						+ '>'
						+ row.watershed_name + ' / ' + row.count + '</option>');
				}
				
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
		tr.insertAdjacentHTML('beforeEnd', '<th style="text-align:center; width:10px">Action</th>');
		
		var odd = 1;
		for (var id in this.data) {
			var row = this.data[id];
			
			var html = [];
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
					var config = this.config, pager = config.container;
					
					if (config.totalPages <= 1) {
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
			$('input[name=lab_id]').attr('disabled', true);
			$('input[name=lab_sample]').click(function() {
				if (this.value == 'Y') {
					$('input[name=lab_id]').attr('disabled', false);
				} else {
					$('input[name=lab_id]').attr('disabled', true);
					$('input[name=lab_id]').attr('value', '');
				}
			})
			
			$(me.table).click(function(e) {
				var el = e.srcElement || e.target;
				if (el.parentNode.tagName == 'BUTTON') {
					var tr = el.parentNode.parentNode.parentNode;
					$('td', tr).css('background-color', 'lightblue');
					var id = tr.id.substr(6);
					var row = me.data[id];
					$('input', me.form).each(function(index, input) {
						if (input.name == 'id') {
							input.value = row[0];
						} else if (me.fields[input.name]) {
							var i = me.fields[input.name][3];
							if (input.name == 'lab_id') {
								input.disabled = row[me.fields['lab_sample'][3]] != 'Y';
							} else if (input.name == 'datetime') {
								$(input).timepicker(me.canEdit ? 'enable' : 'disable');
							}
							
							if (input.type == 'text') {
								input.value = row[i] !== null ? row[i] : '';
								input.readOnly = !me.canEdit;
							} else if (input.type == 'radio') {
								input.checked = row[i] == input.value;
								input.disabled = me.canEdit ? false : 'disabled';
							}
						}
					})
					$('input.error', me.form).each(function(index, label) {
						$(label).removeClass('error');
					})
					$('label.error', me.form).each(function(index, label) {
						$(label).html('').removeClass('error');
					})
					me.showDialog('Edit Observation');
				}
			});
		});
	},
	showDialog: function(title) {
		var me = this;
		
		jQuery(document).ready(function ($) {
			var id = parseInt( $('input[name=id]').val() );
			var buttons = [];
			
			if (me.canDelete) {
				buttons.push({
					text: "Delete",
					style: "padding: 0 2em; font-size: 12px;" + (id ? '': 'display:none'),
					click: function() {
						me.delEntry();
					}
				});
			}
			if (me.canEdit || (me.canAdd && id == 0)) {
				buttons.push({
					text: "Save",
					style: "padding: 0 2em; font-size: 12px",
					click: function() {
						me.saveEntry();
					}
				});
			}
			buttons.push({
				text: "Close",
				style: "padding: 0 2em; font-size: 12px",
				click: function() {
					$( me.dialog ).dialog( 'close' );
				}
			});
			
			$( me.dialog ).dialog({
				title: title || '',
				width: 600,
				height: 450,
				zIndex: 99999,
				buttons: buttons,
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
						timeFormat: 'hh:mm TT'
					})
					.datetimepicker('setDate', new Date());
			}
			
			$( me.btnAddNew ).click(function () {
				$( 'input', me.form ).each( function(index, input) {
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
				$('input[name=datetime]', me.form).datepicker().datepicker('setDate', new Date);
				me.showDialog('Add Observation');
			});
		});
	},
	saveEntry: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if ($(me.form).validate().form()) {
				
				$.post('save.action', $(me.form).serialize(), function(data, status) {
					if (status == 'success') {
						var result = JSON.parse( data );
						if (result.error) {
							var error = [];
							for (var i in result.error) {
								var v = $(me.form).find('[name="' + i + '"]').val();
								error.push(i + ' (' + v + ') : ' + result.error[i]);
							}
							alert('Server validation errors:\n\n' + error.join('\n\n'))
							return;
						}
						if (result.affectedRows) {
							$(me.dialog).dialog( 'close' );
							
							if (result.insertId) {
								alert('Entry ' + result.insertId + ' added');
							} else {
								alert('Entry ' + result.id + ' updated');
							}
							
							var watershed = result.data[me.fields.watershed_name[3]];
							me.loadLocations(watershed, function() {
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
			
			$.post( 'delete.action', {id: id}, function (data, status) {
				if (status == 'success') {
					var result = JSON.parse( data );
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
				var value_a = $('input[name=secchi_a]').val();
				var value_b = value;
				var a = parseFloat(value_a);
				var b = parseFloat(value_b);
				
				if (a && b) {
					$('input[name=secchi_d]').val(a / 2 + b / 2);
				}
				
				return ('' === value_a && '' === value_b) || (Math.abs(a - b) <= 2);
			}, cura_validation_options.messages.secchi_b);
			
			$.validator.addMethod("secchi_d", function(value, element, param) {
				var value_a = $('input[name=secchi_a]').val();
				var value_b = $('input[name=secchi_b]').val();
				var value_d = $('input[name=secchi_d]').val();
				var a = parseFloat(value_a);
				var b = parseFloat(value_b);
				var d = parseFloat(value_d);
				
				return ('' === value_a && '' === value_b) || a + b == d + d;
			}, cura_validation_options.messages.secchi_d);
			
			$(me.form).validate(cura_validation_options);
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
						var data = JSON.parse( jsonData ).typeaheads;
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
	},
	initEventMobileSite: function() {
		var me = this;
		
		jQuery(function($) {
			$('#mobile-site').click(function() {
				if (!me.tipDialog) {
					me.tipDialog = $( ".tooltip_description" ).dialog({
						width: 400,
						modal: true
					});
				} else {
					if ($(".tooltip_description").dialog('isOpen')) {
						$( ".tooltip_description" ).dialog('close');
					} else {
						$( ".tooltip_description" ).dialog('open');
					}
				}
			});
			$("#gotoMobile").click(function() {
				if ($('#remember-choice').is(':checked')) {
					$.cookie('mobile-redirect', 'YES');
				} else {
					$.removeCookie('mobile-redirect');
				}
				location.href = "../m/water-quality/";
			});
			$("#notgoMobile").click(function() {
				if ($('#remember-choice').is(':checked')) {
					$.cookie('mobile-redirect', 'NO');
				} else {
					$.removeCookie('mobile-redirect');
				}
				$( ".tooltip_description" ).dialog('close');
			});
		});
	}
}