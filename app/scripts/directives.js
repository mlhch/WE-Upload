'use strict';

angular.module('directives', [])

	.directive('map', [function() {
	return {
		restrict: 'E',
		template: '<div id="map"></div>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			console.log('initializing map');
			var map = Cura.map('map', {
				maxZoom: 14,
				zoomControl: true
			});

			console.log('adding basemap layer.');
			map.addLayer(new L.TileLayer(iAttrs.basemap));

			$scope.$watch('geoJSONLayer', function(value) {
				if (value) {
					console.log('adding geoJSONLayer layer');
					map.addLayer(value);
					var bounds = value.getBounds();
					bounds.isValid() ? map.fitBounds(bounds) : map.fitWorld();
				}
			});
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

				wq.fields = value;
				wq.visibleFields = $scope.visibleFields;
				wq.sortList = $scope.sortList;
				wq.showObservationTable();
				wq.enableTableSorter();

				var headers = {};
				headers[$scope.visibleFields.length] = {
					sorter: false
				};
				jQuery(wq.table)[0].config.headers = headers;
				jQuery(wq.table).trigger('update');
				setTimeout(function() {
					jQuery(wq.table).trigger('sorton', [$scope.sortList]);
				}, 1);

			}, true);
		}
	}
}])