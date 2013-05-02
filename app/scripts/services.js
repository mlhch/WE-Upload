'use strict';

angular.module('services', ['ngResource'])

.factory('layerService', ['$resource',
function ($resource) {

	return $resource('api/:layer.json', {}, {
		query : {
			method : 'POST',
			params : {
				layer : '@layer'
			}
		}
	});
}]);







