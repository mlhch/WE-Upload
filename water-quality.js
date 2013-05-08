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
	this.validateForm();
	this.clickColumnConfig();
	this.initEventTypeahead();
	this.initEventExport();
	this.initEventMobileSite();
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
				var el = e.srcElement || e.target, tr;
				// for IE10, el is the BUTTON
				if (el.tagName == 'BUTTON') {
					tr = el.parentNode.parentNode;
				// for chrome etc., el is the SPAN
				} else if (el.parentNode.tagName == 'BUTTON') {
					tr = el.parentNode.parentNode.parentNode;
				}
				if (tr) {
					$('td', tr).css('background-color', 'lightblue');
					var id = tr.id.substr(6);
					var row = me.data[id];
					$('input', $(me.form)).each(function(index, input) {
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
					
					me.showDialog('Edit Observation');
					
					var validator = $(me.form).validate();
					validator.prepareForm();
					validator.hideErrors();
					validator.elements().removeClass( validator.settings.errorClass );
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
				width: 650,
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
	saveEntry: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			if ($(me.form).validate().form()) {
				
				$.post(me.query('save.action'), $(me.form).serialize(), function(data, status) {
					if (status == 'success') {
						var result = JSON.parse( data );
						if (result.error) {
							var error = [];
							for (var i in result.error) {
								var v = $(me.form).find('[name="' + i + '"]').val();
								error.push(i + ' (' + v + ') : ' + result.error[i]);
							}
							me.displayMessage('Server validation errors:\n\n' + error.join('\n\n'))
							return;
						}
						
						if (result.affectedRows) {
							$(me.dialog).dialog( 'close' );
							
							if (result.insertId) {
								me.displayMessage('Entry ' + result.insertId + ' added');
							} else {
								me.displayMessage('Entry ' + result.id + ' updated');
							}
							
							me.clearTypeaheads();
							
							var watershed = result.data[me.fields.watershed_name[3]];
							me.loadLocations(watershed, function() {
								me.loadData();
							});
						} else {
							me.displayMessage('No changes updated')
							$(me.dialog).dialog( 'close' );
						}
					} else {
						me.displayMessage('Sorry, the server encountered an error');
					}
				});
			}
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
	
	delEntry: function() {
		var me = this;
		
		jQuery(document).ready(function ($) {
			var id = parseInt( $('input[name=id]').val() );
			
			$.post( me.query('delete.action'), {id: id}, function (data, status) {
				if (status == 'success') {
					var result = JSON.parse( data );
					if (result.affectedRows) {
						$( me.dialog ).dialog( 'close' );
						me.displayMessage('Entry ' + result.id + ' deleted');
						
						var watershed = me.data[id][me.fields.watershed_name[3]]
						delete me.data[id];
						$( "#entry-" + id).remove();
						$( me.table ).trigger( "update" );
						
						me.clearTypeaheads();
						me.loadLocations(watershed);
					} else {
						me.displayMessage('Data Entry ' + id + ' does not exist');
					}
				} else {
					me.displayMessage('Sorry, the server encountered an error');
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
				
				return ('' === value_a && '' === value_b) || (Math.abs(a - b) <= 4);
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
	initEventExport: function() {
		var me = this;
		
		jQuery(function($) {
			$('#export_as_csv').click(function() {
				var watershed_name = $(me.filterLocations).val();
				location.href = me.query("./observations.json?export&" + $.param({watershed: watershed_name}));
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