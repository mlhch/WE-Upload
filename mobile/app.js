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
	//var observationFields = observationFields || null;
	var observationItems = {};
	
	function getCache(key, defaultValue) {
		return localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;
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
		currentWatershed = null;
		currentObservation = null;
		
		var list = $('#list-locations');
		list.find('li[role!="heading"]').remove();
	
		if (!locationList) {
			$.getJSON(base_url + '/locations.json', function(data) {
				locationList = data.locations;
				setCache('locationList', locationList);
				renderLocationList();
			});
		} else {
			renderLocationList();
		}
	}
	$('#home').live('pageshow', loadHomePage);
	function renderLocationList() {
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
		$(this).find('h3').html(currentWatershed.watershed_name);
		
		var id = currentWatershed.id;
		if (observationItems[id] && observationFields) {
			renderObservationList(observationItems[id], observationFields);
		} else {
			var url = base_url + '/observations.json?watershed=' + id;
			$.getJSON(url, function(data) {
				observationFields = data.fields;
				observationItems[id] = data.observations;
				setCache('observationFields', observationFields);
				setCache('observationItems_' + id, observationItems[id]);
				renderObservationList(observationItems[id], observationFields);
			});
		}
	})
	function renderObservationList(rows, fields) {
		var location_id_index = fields['location_id'][3];
		var station_name_index = fields['station_name'][3];
		var datetime_index = fields['datetime'][3];
		
		var list = $('#list-observations');
		list.find('li[role!="heading"]').remove();
		
		for ( var i in rows ) {
			var row = rows[i];
			list.append([ '<li data-theme="c">',
					'<a href="#details" data-transition="slide"',
					' data="', row[0], '">',
					row[location_id_index], ' - ', row[station_name_index], '</a>',
					'<span class="date">', row[datetime_index], '</span>',
					'</li>' ].join(''));
		}
		
		list.listview("refresh");
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
			var location_id_index = observationFields['location_id'][3];
			var station_name_index = observationFields['station_name'][3];
			var obj = currentObservation;
			
			$(this).find('h3').html(obj[location_id_index] + ' - ' + obj[station_name_index]);
			
			var container = $(this).find('div[data-role="content"]');
			var html = ['<div class="ui-grid-a">'];
			for (var key in observationFields) {
				html.push(
						['<div class="ui-block-a field">', observationFields[key][2], '</div>',
						 '<div class="ui-block-b value">', obj[observationFields[key][3]],
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
				$.getJSON(base_url + "/locations.json", function(json) {
					locationList = json.locations;
					
					var items = [];
					for (var i = 0, row; row = locationList[i++];) {
						items.push(row['watershed_name']);
					}
					
					callback(items);
				});
			}
		});
		$( "input[name=station_name]", form ).typeahead({
			source: function (query, callback) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				if (watershed.length == 0) {
					return ;
				}
				
				me.typeaheadStationItems = me.typeaheadStationItems || {}
				if (me.typeaheadStationItems[watershed]) {
					return me.typeaheadStationItems[watershed];
				}
				$.getJSON(base_url + "/typeaheads_station_name.json"
						+ "?watershed=" + watershed, function(json) {
					var rows = json.typeaheads, items = [];
					for (var i = 0, row; row = rows[i++];) {
						items.push(row.station_name);
					}
					me.typeaheadStationItems[watershed] = items;
					callback(items);
				});
			},
			updater: function(value) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				var station = value;
				if (watershed.length == 0 || station.length == 0) {
					return value;
				}
				
				$.getJSON(base_url + "/typeaheads_location_id.json?watershed="
						+ watershed + '&station=' + station, function(json) {
					var rows = json.typeaheads;
					if (rows.length == 1) {
						form.find( "input[name=location_id]" ).val(rows[0].location_id);
					} else {
						form.find( "input[name=location_id]" ).val('');
					}
				});
				
				return value;
			}
		});
		$( "input[name=location_id]", me.form ).typeahead({
			source: function (query, callback) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				if (watershed.length == 0) {
					return ;
				}
				
				me.typeaheadLocationItems = me.typeaheadLocationItems || {};
				if (me.typeaheadLocationItems[watershed]) {
					return me.typeaheadLocationItems[watershed];
				}
				$.getJSON(base_url + "/typeaheads_location_id.json"
						+ "?watershed=" + watershed, function(json) {
					var rows = json.typeaheads, items = [];
					for (var i = 0, row; row = rows[i++];) {
						items.push(row.location_id);
					}
					me.typeaheadLocationItems[watershed] = items;
					callback(items);
				});
			},
			updater: function(value) {
				var watershed = form.find( "input[name=watershed_name]" ).val();
				var location_id = value;
				if (watershed.length == 0 || location_id.length == 0) {
					return value;
				}
				
				$.getJSON(base_url + "/typeaheads_station_name.json?watershed="
						+ watershed + '&location_id=' + location_id, function(json) {
					var rows = json.typeaheads;
					if (rows.length == 1) {
						form.find( "input[name=station_name]" ).val(rows[0].station_name);
					} else {
						form.find( "input[name=station_name]" ).val('');
					}
				});
				
				return value;
			}
		});
		
		$(this).find('#save').click(function() {
			if (!form.validate().form()) {
				return false;
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
					var value = page.find('input[name="' + name + '"]').val();
					params[name] = value;
				}
			}
			
			$.post(base_url + '/save.action', params, function(data, status) {
				if (status == 'success') {
					var result = JSON.parse(data);
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
						
						history.back();
					} else {
						alert('No changes updated');
					}
				} else {
					alert('Sorry, the server encountered an error');
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