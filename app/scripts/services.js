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

	.factory('layerStyle', [function() {
	var icons = {
		'do_mgl': 'coffee',
		'do_%': 'bell-alt',
		'cond': 'fire',
		'salinity': 'beaker',
		'temp': 'asterisk',
		'ph': 'bullhorn',
		'secchi_a': 'tint',
		'secchi_b': 'umbrella',
		'secchi_d': 'bolt',
		'lab_id': 'food',
		'nitrate': 'glass',
		'phosphate': 'cloud',
		'coliform': 'leaf',
	}

	return {
		icon: function(layer, type) {
			var icon = new L.AwesomeMarkers.icon({
				icon: icons[layer.name] || 'question-sign',
				color: type == 'single' ? 'red' : 'darkred',
				iconColor: type == 'single' ? 'white' : 'black',
			});

			return icon;
		}
	}
}])