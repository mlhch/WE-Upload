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
		typeaheads_watershed_name: {
			method: 'GET',
			isArray: true,
			params: {
				action: "cura_typeaheads_watershed_name.json"
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
	return $resource('/wp-admin/admin-ajax.php', {}, {
		query: {
			method: 'GET',
			params: {
				action: 'cura_features.json',
			}
		},
		get: {
			method: 'POST',
			params: {
				action: 'cura_feature.json',
			}
		},
	});
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


	.factory('Photo', ['$resource', '$cookieStore', function($resource, $cookieStore) {
	return $resource('/wp-admin/admin-ajax.php', {
		guest: $cookieStore.get('guest'),
	}, {
		query: {
			method: 'GET',
			isArray: true,
			params: {
				action: 'cura_photo.action',
			}
		},
		remove: {
			method: 'POST',
			params: {
				action: 'cura_photo.action',
				_method: 'DELETE',
				id: '@id',
				file: '@name',
			}
		},
	});
}])


	.factory('Toast', [function() {
	return {
		show: function(message) {
			if (jQuery('#message').length == 0) {
				jQuery('<div id="message" style="z-index:1000000"></div>').appendTo('body');
			}

			jQuery('#message').html(message).show().position({
				at: 'top center',
				of: window
			}).delay(5000).fadeOut(3000);
		}
	}
}])