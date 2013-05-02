'use strict';

angular.module('services', ['ngResource'])

.factory('layerCall', ['$resource',
function ($resource) {

	return $resource('service/1', {}, {
		query : {
			method : 'GET'
		}
	});
}])

.factory('dataCall', ['$resource',
function ($resource) {

	return $resource('.', {}, {
		query : {
			method : 'POST'
		}
	});
}]);