'use strict';

angular.module('directives', [])
.directive('map', ['layerCall', 'dataCall', function(layerCall, dataCall){

	return {
		restrict : 'E',
		template : '<div id="map"></div>',
		replace : true,
		transclude : true,
		link : function ($scope, iElm, iAttrs, controller) {
			console.log('initializing map');
			$scope.map = new L.map ('map', {
				maxZoom : 14,
				zoomControl : true
			});
			var layersControl = L.control.layers({}, {}, {
				collapsed : true
			}).addTo($scope.map);

			console.log('adding basemap layer.');
			$scope.map.addLayer(new L.TileLayer (iAttrs.basemap));

			$scope.map.setView([50.515, -110.62], 10);

			layerCall.query(null, function (json) {
				if (!json.layerlist) {
					return;
				}
				for (var i = 0, layer; layer = json.layerlist[i]; i++) {
					var icon = new L.AwesomeMarkers.icon ({
						icon : 'coffee',
						color : 'red'
					});
					var markers = new L.MarkerClusterGroup ({
						iconCreateFunction : function (cluster) {
							return icon;
						}
					}).addTo($scope.map);

					dataCall.query({
						"request" : "getdata",
						"serviceid" : 1,
						"layerid" : layer.id,
						"time" : layer.time,
						"bbox" : layer.bbox
					}, function (json) {
						if (!json.data) {
							return;
						}
						for (var i = 0, station; station = json.data[i]; i++) {
							markers.addLayer(new L.Marker ([station.lat, station.lon], {
								icon : icon
							}));
						}
					});
					layersControl.addOverlay(markers, layer.name);
				}
			});
		}
	};
	}])
