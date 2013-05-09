'use strict';

angular.module('services', ['ngResource'])

	.factory('CuraGeoJSON', ['$resource', function($resource) {

	return $resource('cura.geojson', {}, {
		query: {
			method: 'GET'
		}
	});
}])

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

	.factory('locations', ['$resource', function($resource) {

	return $resource('/wp-admin/admin-ajax.php?action=cura_locations.json', {}, {
		query: {
			method: 'GET'
		}
	});
}])

	.factory('observations', ['$resource', function($resource) {

	return $resource('/wp-admin/admin-ajax.php', {}, {
		query: {
			method: 'GET',
			params: {
				action: 'cura_observations.json',
				watershed: '@watershed'
			}
		}
	});
}])

	.factory('fields', ['$resource', function($resource) {

	return $resource('/wp-admin/admin-ajax.php', {}, {
		query: {
			method: 'GET',
			params: {
				action: 'cura_fields.json'
			}
		}
	});
}])