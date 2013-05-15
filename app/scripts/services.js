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

	.factory('curaConfig', ['$resource', function($resource) {

	return $resource('/wp-admin/admin-ajax.php', {}, {
		query: {
			method: 'GET',
			params: {
				action: 'cura_config.json'
			}
		}
	});
}])

	.factory('Feature', ['$http', function($http) {

	return {
		save: function(urlencodedData) {
			$http({
				url: '/wp-admin/admin-ajax.php?action=cura_save.action',
				method: 'POST',
				data: urlencodedData,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).
			success(function(data) {
				//$scope.success = true;
			}).
			error(function(response) {
				//data = angular.fromJson(response)
				//$scope.success = false;
				//$scope.errors = data.errors;
			});
		},
		remove: function(featureId) {
			$http({
				url: '/wp-admin/admin-ajax.php?action=cura_delete.action&id=' + featureId,
				method: 'GET',
			}).
			success(function(data) {
			}).
			error(function(response) {
			});
		},
	};
}])