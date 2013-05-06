'use strict';

curaApp.controller('MainCtrl', ['$scope', 'CuraGeoJSON',

function($scope, CuraGeoJSON) {
	$scope.curaGeoJSON = CuraGeoJSON.query();

	$scope.geoJsonLayerOpts = {
		pointToLayer: function(featureData, latlng) {
			var marker = new L.marker(latlng, {
				icon: new L.divIcon({
					iconSize: false, // use css
					className: 'maki-icon water'
				})
			});
			var p = featureData.properties;
			marker.bindPopup(['<strong>' + p.station_name + '(' + p.location_id + ')</strong>',
				'<br />[ ' + latlng.lat + ', ' + latlng.lng + ' ]',
				'<br />' + p.watershed_name].join(''));
			return marker;
		}
	}
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