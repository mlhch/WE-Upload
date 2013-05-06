'use strict';

angular.module('directives', [])

	.directive('map', ['layerStyle', function(layerStyle) {
	return {
		restrict: 'E',
		template: '<div id="map"></div>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			console.log('initializing map');
			$scope.map = new L.map('map', {
				maxZoom: 14,
				zoomControl: true
			});
			var layersControl = L.control.layers({}, {}, {
				collapsed: true
			}).addTo($scope.map);

			console.log('adding basemap layer.');
			$scope.map.addLayer(new L.TileLayer(iAttrs.basemap));

			$scope.$watch('serviceList', function(value) {
				if (value instanceof Array && value.length != 0) {
					var bbox = value[0].bbox, //
						bl = [bbox.bottomleft.latitude, bbox.bottomleft.longitude], //
						ur = [bbox.upperright.latitude, bbox.upperright.longitude];
					$scope.map.fitBounds([bl, ur]);
				}
			});

			var mapLayers = {};
			$scope.$watch('stationListByLayer', function(value) {
				if (value != null) {
					for (var key in value) {
						if (mapLayers[key]) {
							continue;
						}
						var layerInfo = $scope.layerInfoList[key];
						var mapLayer = mapLayers[key] = new L.MarkerClusterGroup({
							iconCreateFunction: (function(layerInfo) {
								return function(cluster) {
									return layerStyle.icon(layerInfo, 'group');
								}
							})(layerInfo)
						}).addTo($scope.map);
						layersControl.addOverlay(mapLayer, layerInfo.name);

						var stations = value[key];
						for (var i = 0, station; station = stations[i]; i++) {
							var marker = new L.Marker([station.lat, station.lon], {
								icon: layerStyle.icon(layerInfo, 'single')
							})
							marker.bindPopup('<strong>' + station.name + '(' + station.id + ')</strong>' + '<br />[ ' + station.lat + ', ' + station.lon + ' ]' + '<br />' + station.group);
							mapLayer.addLayer(marker);
						}
					}
				}
			}, true);
		}
	};
}])

	.directive('list', [function() {
	return {
		restrict: 'E',
		template: '<table id="data-entry-list" class="tablesorter" style="border-spacing: 1px;"></table>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			new WaterQuality(wqOptions);
		}
	}
}])