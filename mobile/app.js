jQuery.extend(jQuery.mobile.datebox.prototype.options.lang.default, {
	timeFormat: 12,
	dateFormat: "%m/%d/%Y",
	timeOutput: "%l:%M %p",
});

(function($) {
	var base_url = '../../water-quality';
	var currentWatershed = null;
	var currentObservation = null;
	var locationList = null;
	var typeaheadStationItems = {};
	var typeaheadStationRows = {};
	var typeaheadLocationItems = {};
	var typeaheadLocationRows = {};
	//var observationFields = observationFields || null;
	var observationItems = {};
	
	function getQuery(url) {
		var m = url.match(/([^\/]+)\.(json|action)\??(.*)/);
		if (m) {
			return '../../wp-admin/admin-ajax.php?action=cura_'
				+ m[1] + '.' + m[2] + (m[3] ? '&' + m[3] : '');
		}
		return url;
	}
	
	function getCache(key, defaultValue) {
		try {
			return localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;
		} catch (e) {
			return defaultValue;
		}
	}
	function setCache(key, value) {
		localStorage[key] = JSON.stringify(value);
	}
	function clearCache(key) {
		localStorage.removeItem(key);
	}
	
	/*
	 * Home page
	 */
	$('#home').live('pageinit', function() {
		$('#list-locations').click(function(e) {
			var json = unescape($(e.target).attr('data'));
			if (json != 'undefined') { // NOT the divider
				currentWatershed = JSON.parse(json);
				setCache('currentWatershed', currentWatershed);
			}
		})
		$('#reload-locations').click(function(e) {
			clearCache('locationList');
			for (var i = 0, row; row = locationList[i++];) {
				var id = 'observationItems_' + row.id;
				if (getCache(id)) {
					clearCache(id);
					observationItems[row.id] = null;
				}
			}
			locationList = null;
			loadHomePage();
		})
		
		locationList = getCache('locationList', null);
	});
	function loadHomePage() {
		$.mobile.showPageLoadingMsg();
		var callback = function() {
			$.mobile.hidePageLoadingMsg();
		}
		
		currentWatershed = null;
		currentObservation = null;
		
		var list = $('#list-locations');
		list.find('li[role!="heading"]').remove();
	
		if (!locationList) {
			$.getJSON(getQuery('/config.json'), function(data) {
				locationList = data.locations;
				setCache('locationList', locationList);
				renderLocationList(callback);
				observationFields = data.fields;
				setCache('observationFields', observationFields);
			});
		} else {
			renderLocationList(callback);
		}
	}
	$('#home').live('pageshow', loadHomePage);
	function renderLocationList(callback) {
		var list = $('#list-locations');
		list.find('li[role!="heading"]').remove();
		
		for ( var i = 0, row; row = locationList[i++];) {
			list.append([ '<li data-theme="c">',
					'<a href="#observations" data-transition="slide"',
					' data="', escape(JSON.stringify(row)), '">',
					row.watershed_name,
					'<span class="ui-li-count">', row.count, '</span>',
					'</a></li>' ].join(''));
		}
		
		list.listview("refresh");
		
		$.isFunction(callback) && callback();
	}
	
	/*
	 * Observation Page
	 */
	$('#observations').live('pageinit', function() {
		$('#list-observations').click(function(e) {
			var id = $(e.target).attr('data');
			currentObservation = observationItems[currentWatershed.id][id];
			setCache('currentObservation', currentObservation);
		})
		
		currentWatershed = currentWatershed || getCache('currentWatershed');
		observationFields = observationFields || getCache('observationFields');
		
		var id = currentWatershed.id || 0;
		if (id && !observationItems[id]) {
			observationItems[id] = getCache('observationItems_' + id);
		}
	});
	$('#observations').live('pagebeforeshow', function(e, ui) {
		var list = $('#list-observations');
		list.find('li[role!="heading"]').remove();
		
		currentObservation = null;
	});
	$('#observations').live('pageshow', function(e, ui) {
		$.mobile.showPageLoadingMsg();
		var callback = function() {
			$.mobile.hidePageLoadingMsg();
		}
		
		$(this).find('h3').html(currentWatershed.watershed_name);
		
		var id = currentWatershed.id;
		if (observationItems[id] && observationFields) {
			renderObservationList(observationItems[id], observationFields, callback);
		} else {
			var url = getQuery('/observations.json');
			$.ajax({
				url: url,
				type: 'POST',
				dataType: 'json',
				contentType: 'json',
				data: JSON.stringify({
					location: currentWatershed
				}),
				success: function(data) {
					observationItems[id] = data;
					setCache('observationItems_' + id, observationItems[id]);
					renderObservationList(observationItems[id], observationFields, callback);
				}
			});
		}
	})
	function renderObservationList(rows, fields, callback) {
		var list = $('#list-observations');
		list.find('li[role!="heading"]').remove();
		
		for ( var i in rows ) {
			var row = rows[i];
			list.append([ '<li data-theme="c">',
					'<a href="#details" data-transition="slide"',
					' data="', i, '">',
					row.location_id, ' - ', row.station_name, '</a>',
					'<span class="date">', row.datetime, '</span>',
					'</li>' ].join(''));
		}
		
		list.listview("refresh");
		
		$.isFunction(callback) && callback();
	}
	
	/*
	 * Details Page
	 */
	$('#details').live('pageinit', function(e, ui) {
		currentObservation = currentObservation || getCache('currentObservation');
		observationFields = observationFields || getCache('observationFields');
	});
	$('#details').live('pageshow', function(e, ui) {
		if (observationFields && currentObservation) {
			var obj = currentObservation;
			
			$(this).find('h3').html(obj.location_id + ' - ' + obj.station_name);
			
			var container = $(this).find('div[data-role="content"]');
			var html = ['<div class="ui-grid-a">'];
			for (var i in observationFields) {
				html.push(
						['<div class="ui-block-a field">', observationFields[i][2], '</div>',
						 '<div class="ui-block-b value">', obj[observationFields[i][0]],
						 '</div>'].join(''));
			}
			html.push('</div>');
			//html.push('<a href="#editob" data-role="button">Edit</button>')
			container.html(html.join(''));
			
			container.find('a').button();
		}
	});
	
	/*
	 * New Observation Form
	 */
	$('#newob').live('pageinit', function(e, ui) {
		var me = this, form = $(this).find('form');
		
		$(this).find("input[name=watershed_name]").typeahead({
			source: function (query, callback) {
				if (locationList) {
					var items = [];
					for (var i = 0, row; row = locationList[i++];) {
						items.push(row['watershed_name']);
					}
					
					callback(items);
					return;
				}
				$.getJSON(getQuery("/locations.json"), function(json) {
					locationList = json;
					
					var items = [];
					for (var i = 0, row; row = locationList[i++];) {
						items.push(row['watershed_name']);
					}
					
					callback(items);
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
		$( "input[name=station_name]", form ).typeahead({
			source: function (query, callback) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				if (watershed.length == 0) {
					return ;
				}
				
				if (typeaheadStationItems[watershed]) {
					return typeaheadStationItems[watershed];
				}
				$.getJSON(getQuery("/typeaheads_station_name.json?watershed=" + watershed), function(json) {
					var items = [], rows = {};
					for (var i = 0, row; row = json[i++];) {
						if (!rows[row.station_name]) {
							rows[row.station_name] = [];
							items.push(row.station_name);
						}
						rows[row.station_name].push(row);
					}

					typeaheadStationItems[watershed] = items;
					typeaheadStationRows[watershed] = rows;
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
				
				if (typeaheadStationRows[watershed][station].length == 1) {
					var el, validator = form.validate();
					var row = typeaheadStationRows[watershed][station][0];
					
					el = form.find( "input[name=location_id]" ).val(row.location_id);
					
					el = form.find( "input[name=latitude]" ).val(row.latitude);
					row.latitude !== null && validator.check(el[0])
					
					el = form.find( "input[name=longitude]" ).val(row.longitude);
					row.longitude !== null && validator.check(el[0])
					
					validator.showErrors();
				}
				
				return value;
			}
		});
		$( "input[name=location_id]", me.form ).typeahead({
			source: function (query, callback) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				if (watershed.length == 0) {
					return ;
				}
				
				if (typeaheadLocationItems[watershed]) {
					return typeaheadLocationItems[watershed];
				}
				$.getJSON(getQuery("/typeaheads_location_id.json?watershed=" + watershed), function(json) {
					var rows = json, items = [];
					for (var i = 0, row; row = rows[i++];) {
						items.push(row.location_id);
					}
					typeaheadLocationItems[watershed] = items;
					typeaheadLocationRows[watershed] = rows;
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
				
				if (typeaheadLocationRows[watershed]) {
					var el, validator = form.validate();
					for (var i = 0, row; row = typeaheadLocationRows[watershed][i++];) {
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
		
		$(this).find('#save').click(function() {
			if (!form.validate().form()) {
				var msg = 'One or more observations are outside of the expected data range, do you wish to save the data?';
				if (!confirm(msg)) {
					return false;
				}
			}
			var params = {}, page = $('#newob');
			
			params['id'] = page.find('input[name="id"]').val();
			for( var i in observationFields) {
				var row = observationFields[i];
				var name = row[0];
				if (name == 'datetime') {
					params[name] = $('#date').val() + ' ' + $('#time').val();
				} else if (name == 'lab_sample' || name == 'coliform') {
					var value = page.find('select[name="' + name + '"]').val();
					params[name] = value;
				} else { 
					var value = page.find('[name="' + name + '"]').val();
					params[name] = value;
				}
			}
			
			var button = this;
			button.disabled = true;
			$.ajax({
				url: getQuery('/save.action'),
				type: "POST",
				dataType: "json",
				contentType: "json",
				data: JSON.stringify(params),
				success: function(data, status) {
					button.disabled = false;
					if (status == 'success') {
						var result = data;
						if (result.error) {
							if (typeof result.error == 'string') {
								alert(result.error);
							}
							if (typeof result.error == 'object') {
								var error = [];
								for (var i in result.error) {
									var v = form.find('[name="' + i + '"]').val();
									error.push(i + ' (' + v + ') : ' + result.error[i]);
								}
								alert('Server validation errors:\n\n' + error.join('\n\n'))
							}
							return;
						}
						if (result.affectedRows) {
							if (result.insertId) {
								alert('Entry ' + result.insertId + ' added');
							} else {
								alert('Entry ' + result.id + ' updated');
							}
							
							clearCache('locationList');
							if (locationList) {
								for (var i = 0, row; row = locationList[i++];) {
									var id = 'observationItems_' + row.id;
									if (getCache(id)) {
										clearCache(id);
										observationItems[row.id] = null;
									}
								}
								locationList = null;
							}
							
							currentObservation = result.data;
							setCache('currentObservation', currentObservation);


							typeaheadStationItems = {};
							typeaheadLocationItems = {};
							
							history.back();
						} else {
							alert('No changes updated');
						}
					} else {
						alert('Sorry, the server encountered an error');
					}
				}
			});
			
			return false;
		});
		
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
		
		$('#newob form').validate(cura_validation_options);
	});
	$('#newob').live('pagebeforeshow', function(e, ui) {
		if (location.hash == '#newob') {
			$(this).find('form')[0].reset();
			$(this).find('input[name="id"]').val('');
			var dt = new Date;
			var inputDate = $(this).find('input[name="date"]');
			var inputTime = $(this).find('input[name="time"]');
			var dateFormat = $.mobile.datebox.prototype.options.lang.default.dateFormat;
			var timeFormat = $.mobile.datebox.prototype.options.lang.default.timeOutput;
			inputDate.val(inputTime.data('datebox')._formatter(dateFormat, dt));
			inputTime.val(inputTime.data('datebox')._formatter(timeFormat, dt));
		}
	});
	$('#newob').live('pageshow', function(e, ui) {
		if (!$(this).find('input[name="id"]').val()) {
			if (currentWatershed) {
				$('input[name="watershed_name"]').val(currentWatershed.watershed_name);
			}
			if (currentObservation) {
				var location_id_index = observationFields['location_id'][3];
				var station_name_index = observationFields['station_name'][3];
				var watershed_index = observationFields['watershed_name'][3];
				$('input[name="location_id"]').val(currentObservation[location_id_index]);
				$('input[name="station_name"]').val(currentObservation[station_name_index]);
				$('input[name="watershed_name"]').val(currentObservation[watershed_index]);
			}
		}
	});
	$('#newob').live('pagebeforehide', function(e, ui) {
		$.validator && $(this).find('form').validate().resetForm();
	});
	
	$(document).bind( "pagebeforechange", function( e, data ) {
		if ( typeof data.toPage === "string" ) {
			var u = $.mobile.path.parseUrl( data.toPage );
			if ( u.hash == '#editob' ) {
				var page = $('#newob');
				if ( currentObservation && observationFields ) {
					page.find('input[name="id"]').val(currentObservation[0]);
					for( var i in observationFields) {
						var row = observationFields[i];
						if (row[0] == 'datetime') {
							var dt = currentObservation[row[3]];
							page.find('input[name="date"]').val(dt.substr(0, 10))
							page.find('input[name="time"]').val(dt.substr(11))
						} else {
							page.find('input[name="' + row[0] + '"]').val(currentObservation[row[3]]);
						}
					}
				}
				
				data.options.dataUrl = u.href;
				$.mobile.changePage( $('#newob'), data.options );
				
				e.preventDefault();
			}
		}
	});
})(jQuery);