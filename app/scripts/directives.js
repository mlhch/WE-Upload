'use strict';

angular.module('directives', [])
.directive('map', [function(){
	
	return {
		restrict: 'E',
		template: '<div id="map"></div>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			console.log('initializing map');
			$scope.map =  new L.map('map', {maxZoom: 14, zoomControl: false});

			console.log('adding basemap layer.');
			$scope.map.addLayer(new L.TileLayer(iAttrs.basemap));

			$scope.map.setView([50.515, -110.62], 10);

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