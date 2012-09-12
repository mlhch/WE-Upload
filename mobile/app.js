(function($) {
	var base_url = '../../water-quality';
	var currentWatershed = null;
	var currentObservation = null;
	var locationList = null;
	var observationFields = null;
	var observationItems = {};
	
	function getCache(key, defaultValue) {
		return localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;
	}
	function setCache(key, value) {
		localStorage[key] = JSON.stringify(value);
	}
	function clearCache(key) {
		localStorage[key] = '';
	}
	
	/*
	 * Home page
	 */
	$('#home').live('pageinit', function() {
		$('#list-locations').click(function(e) {
			var json = unescape($(e.target).attr('data'));
			currentWatershed = JSON.parse(json);
			setCache('currentWatershed', currentWatershed);
		})
		$('#reload-locations').click(function(e) {
			clearCache('locationList');
			locationList = null;
			loadHomePage();
		})
		
		locationList = getCache('locationList', null);
	});
	function loadHomePage() {
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
		
		var list = $('#list-observations');
		list.find('li[role!="heading"]').remove();
		
		for ( var i in rows ) {
			var row = rows[i];
			list.append([ '<li data-theme="c">',
					'<a href="#details" data-transition="slide"',
					' data="', row[0], '">',
					row[location_id_index], ' - ', row[station_name_index],
					'</a></li>' ].join(''));
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
						['<div class="ui-block-a">', observationFields[key][2], '</div>',
						 '<div class="ui-block-b">', obj[observationFields[key][3]], '</div>'].join(''));
			}
			html.push('</div>');
			container.html(html.join(''));
		}
	});
	
})(jQuery);