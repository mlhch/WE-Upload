'use strict';

curaApp.controller('MainCtrl', ['$scope', 'CuraGeoJSON', 'fields', 'locations', 'observations', '$cookieStore',

function($scope, CuraGeoJSON, Fields, locations, observations, $cookieStore) {
	//$scope.wpOptions = wpOptions;

	/**
	 * Fields operations
	 */

	// Load fields from cookie or server
	var fields = $cookieStore.get('fields');
	if (fields instanceof Array && fields.length) {
		$scope.fields = fields;
	} else {
		Fields.query(function(json) {
			$scope.fields = json.fields;
		})
	};

	$scope.$watch('fields', function(value) {
		if (!value) {
			return;
		}
		$cookieStore.put('fields', value);

		var visibleFields = [];
		for (var key in value) {
			value[key][4] && visibleFields.push(value[key]); // 4 means Visible
		}
		$scope.visibleFields = visibleFields;

		var sortList = $cookieStore.get('sortList') || [];
		if (sortList instanceof Array) {
			for (var i = 0; i < sortList.length; i++) {
				if (!(sortList[i] instanceof Array) || sortList[i][0] >= visibleFields.length) {
					sortList.splice(i);
				}
			}
		} else {
			sortList = [];
		}
		$scope.sortList = sortList;
	}, true);

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
	$scope.curaGeoFeatureCollection = CuraGeoJSON.query();
	$scope.geoJsonLayerOpts = {
		pointToLayer: function(featureData, latlng) {
			var marker = new L.marker(latlng, {
				icon: new L.divIcon({
					iconSize: false, // use css
					className: 'maki-icon water',
					iconAnchor: [12, 4]
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
			layer.on('click', $scope.showFeatureProperties);
		},
	}

	$scope.showFeatureProperties = function() {
		var p = this.feature.properties;
		var a = [this.feature.id];

		for (var i = 0, field; field = $scope.visibleFields[i++];) {
			var pos = field[3];
			var name = field[0];
			if (name == 'latitude') {
				a[pos] = this.feature.geometry.coordinates[1];
			} else if (name == 'longitude') {
				a[pos] = this.feature.geometry.coordinates[0];
			} else {
				a[pos] = p[name];
			}
		}

		$scope.observations = {};
		$scope.observations[this.feature.id] = a;
		$scope.$apply();
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