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

			$scope.$watch('curaGeoJSON', function(value) {
				if ($scope.curaGeoJSON.type == 'FeatureCollection') {
					console.log('adding curaGeoJSON layer');
					var layer = L.geoJson($scope.curaGeoJSON, $scope.geoJsonLayerOpts);
					$scope.map.addLayer(layer).fitBounds(layer.getBounds());
				}
			}, true);

			/*
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
			}, true);*/
		}
	};
}])

	.directive('list', ['$cookieStore', function($cookieStore) {
	return {
		restrict: 'E',
		template: '<table id="data-entry-list" class="tablesorter" style="border-spacing: 1px;"></table>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			var wq = new WaterQuality(wqOptions);

			$scope.$watch('observations', function(value) {
				if (value instanceof Array && !value.length) {
					wq.clearTable();
					alert('No data entries available');
				} else if (value) {
					wq.data = value;
					wq.showObservationTable();
					jQuery(wq.table).trigger('update');
					setTimeout(function() {
						jQuery(wq.table).trigger("sorton", [jQuery.cookie('sortList') || []])
					}, 1);
				}
			}, true);

			$scope.$watch('fields', function(value) {
				if (!value) {
					return;
				}

				var visibleFields = [];
				for (var key in value) {
					value[key][4] && visibleFields.push(value[key]); // 4 means Visible
				}

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

				wq.fields = value;
				wq.visibleFields = visibleFields;
				wq.sortList = sortList;
				wq.showObservationTable();
				wq.enableTableSorter();

				var headers = {};
				headers[visibleFields.length] = {
					sorter: false
				};
				jQuery(wq.table)[0].config.headers = headers;
				jQuery(wq.table).trigger('update');
				setTimeout(function() {
					jQuery(wq.table).trigger('sorton', [sortList]);
				}, 1);

				$cookieStore.put('fields', value);
			}, true);
		}
	}
}])