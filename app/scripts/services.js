'use strict';

angular.module('services', ['ngResource'])

	.factory('serviceCall', ['$resource', function($resource) {

	return $resource('services', {}, {
		query: {
			method: 'GET'
		}
	});
}])

	.factory('layerCall', ['$resource', function($resource) {

	return $resource('service/1', {}, {
		query: {
			method: 'GET'
		}
	});
}])

	.factory('dataCall', ['$resource', function($resource) {

	return $resource('.', {}, {
		query: {
			method: 'POST'
		}
	});
}])


	.factory('curaConfig', ['$resource', function($resource) {
	return $resource('/wp-admin/admin-ajax.php', {}, {
		get: {
			method: 'GET',
			params: {
				action: 'cura_config.json',
			}
		},
		locations: {
			method: 'GET',
			isArray: true,
			params: {
				action: 'cura_locations.json',
			}
		},
		typeaheads_station_name: {
			method: 'GET',
			isArray: true,
			params: {
				action: "cura_typeaheads_station_name.json"
			}
		},
		typeaheads_location_id: {
			method: 'GET',
			isArray: true,
			params: {
				action: "cura_typeaheads_location_id.json"
			}
		},
	});
}])


	.factory('CuraGeoJSON', ['$resource', function($resource) {
	return $resource('cura.geojson');
}])


	.factory('Observation', ['$resource', function($resource) {
	return $resource('/wp-admin/admin-ajax.php', {}, {
		query: {
			// Here we define 'POST' for 'query',
			// because it is convenient for the filterOptions
			method: 'POST',
			isArray: true,
			params: {
				action: 'cura_observations.json',
			}
		},
		save: {
			method: 'POST',
			params: {
				action: 'cura_save.action',
			}
		},
		delete: {
			method: 'POST',
			params: {
				action: 'cura_delete.action',
			}
		}
	});
}])


	.factory('Toast', [function() {
	return {
		show: function(message) {
			if (jQuery('#message').length == 0) {
				jQuery('<div id="message"></div>').appendTo('body');
			}

			jQuery('#message').html(message).show().position({
				at: 'top center',
				of: window
			}).fadeOut(5000);
		}
	}
}])