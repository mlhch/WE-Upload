'use strict';

curaApp.controller('MainCtrl', ['$scope', 'CuraGeoJSON', 'fields', 'locations', 'observations', '$cookieStore', '$cookies',

function($scope, CuraGeoJSON, fields, locations, observations, $cookieStore, $cookies) {
	//$scope.wpOptions = wpOptions;

	/**
	 * Fields operations
	 */

	// Load fields from cookie or server
	($scope.fields = $cookieStore.get('fields')) || fields.query(function(json) {
		$scope.fields = json.fields;
	});

	// click <li> to toggle field status
	$scope.toggleFieldStatus = function(field) {
		field[4] = !field[4];
	}

	// drag/drop to update fields order
	jQuery('#fields-selector').sortable({
		start: function(e, ui) {
			ui.item.data('start', ui.item.index());
		},
		stop: function(e, ui) {
			var start = ui.item.data('start'),
				end = ui.item.index();

			$scope.fields.splice(end, 0, $scope.fields.splice(start, 1)[0]);
			$scope.$apply();
		}
	});

	/**
	 * GeoJSON layer
	 */
	$scope.curaGeoJSON = CuraGeoJSON.query();
	$scope.geoJsonLayerOpts = {
		pointToLayer: function(featureData, latlng) {
			var marker = new L.marker(latlng, {
				icon: new L.divIcon({
					iconSize: false, // use css
					className: 'maki-icon water'
				})
			});
			return marker;
		},
		onEachFeature: function(feature, layer) {
			var p = feature.properties;
			var c = feature.geometry.coordinates;
			layer.bindPopup(['<strong>' + p.station_name + '(' + p.location_id + ')</strong>',
				'<br />[ ' + c[0] + ', ' + c[1] + ' ]',
				'<br />' + p.watershed_name].join(''));
			layer.on('click', $scope.showInfo);
		},
	}

	$scope.showInfo = function() {

	}

	/**
	 * watershed dropdown select
	 */
	locations.query(function(json) {
		$scope.locations = [{
			id: "",
			watershed_name: " - Select community group - "
		}, {
			id: 0,
			watershed_name: "View All"
		}].concat(json.locations);

		var location = $cookieStore.get('location');
		$scope.location = {
			selected: isNaN(location) ? "" : location
		};
		$scope.filterByLocation($scope.location.selected);
	});

	$scope.filterByLocation = function(watershed_id) {
		$cookieStore.put('location', watershed_id);

		if (watershed_id === "") {
			$scope.observations = {};
			return;
		}
		observations.query({
			watershed: watershed_id // 0 => all
		}, function(json) {
			$scope.observations = json.observations;
		});
	};

	/* me.loadLocations(null, function() {
		if (!/mobile | tablet | android / i.test(navigator.userAgent)) {
	jQuery('.tooltip_description span').hide();
}
if (!jQuery.cookie('mobile-redirect')) {
	if (/mobile|tablet|android/i.test(navigator.userAgent)) {
		jQuery(".tooltip_description").dialog({
			width: 400,
			modal: true
		});
	}
} else {
	jQuery("#remember-choice").attr('checked', 'checked');
}
});

/*
	 * ServiceCall, LayerCall, DataCall style
	 *
	$scope.serviceList = [];
	$scope.layerInfoList = [];
	$scope.stationListByLayer = null;

	serviceCall.query(function (json) {
		$scope.serviceList = json.servicelist;

		layerCall.query(function (json) {
			$scope.layerInfoList = json.layerlist;

			for (var i = 0, layerInfo; layerInfo = $scope.layerInfoList[i]; i++) {
				dataCall.query({
					request : "getdata",
					serviceid : 1,
					layerid : layerInfo.id,
					time : layerInfo.time,
					bbox : layerInfo.bbox,
				}, (function (i) {
					return function (json) {
						$scope.stationListByLayer = $scope.stationListByLayer || {};
						$scope.stationListByLayer[i] = json.data;
					}
				})(i));
			}
		});
	});*/
}]);