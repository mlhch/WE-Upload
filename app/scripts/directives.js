'use strict';

angular.module('directives', [])
.directive('map', ['layerService', function(layerService){
	
	return {
		restrict: 'E',
		template: '<div id="map"></div>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			console.log('initializing map');
			$scope.map =  new L.map('map', {maxZoom: 14, zoomControl: true});
			var layersControl = L.control.layers({}, {}, {
				collapsed : true
			}).addTo($scope.map);

			console.log('adding basemap layer.');
			$scope.map.addLayer(new L.TileLayer(iAttrs.basemap));

			$scope.map.setView([50.515, -110.62], 10);
			
			layerService.query({layer:'all'}, function(json) {
				if (!json.layerlist) {
					return;
				}
				for (var i = 0, layer; layer = json.layerlist[i]; i++) {
					layersControl.addOverlay(L.circle([50.515, -110.62], 200).addTo($scope.map), layer.name);
				}
			});

			$scope.map.on('zoomend', function (evt) {
				$scope.$apply(function () {
					$scope.zoom = $scope.map.getZoom();
				});
			});

			$scope.map.on('load', function (evt) {
				$scope.$apply(function () {
					$scope.zoom = $scope.map.getZoom();
				});
			});
		}
	};
}])