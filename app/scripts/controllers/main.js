'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore', '$timeout',
	'CuraGeoJSON', 'curaConfig', 'Observation', 'cura',

function($scope, $cookieStore, $timeout, CuraGeoJSON, curaConfig, Observation, cura) {
	$scope.locations = [{
		id: "",
		watershed_name: " - Select community group - "
	}, {
		id: 0,
		watershed_name: "View All"
	}];
 

	curaConfig.get(function(res) {
		cura.config(res, $scope, $cookieStore);
	});
	CuraGeoJSON.query(function(res) {
		cura.geoLayer(res, $scope);
	});
	cura.resetFilterOptions($scope);


	$scope.refreshFilter = function() {
		$scope.AllFilterOptions.forceReset = Date.now();
	}
	$scope.highlightRow = function(obj, $event) {
		cura.highlightRow(obj, $event, $scope);
	}
	$scope.importFromCSV = cura.importFromCSV;
	$scope.resetFilterOptions = cura.resetFilterOptions;


	$scope.$watch('fields', function(value) {
		value && cura.watchFields(value, $scope, $cookieStore);
	}, true);
	$scope.$watch('sortList', function(value) {
		value && $cookieStore.put('sortList', value);
	}, true);
	$scope.$watch('filterOptions', function(value) {
		if (value) {
			$scope.AllFilterOptions = value
			$scope.geoLayer && $scope.geoLayer.doFilter(value);
			$scope.exportName = cura.getExportFileName(value);
		}
	}, true);
	$scope.$watch('AllFilterOptions', function(value) {
		if (value) {
			console.log('filter: ' + JSON.stringify(value));
			// use callback way to avoid table rows become 'empty' temporarily
			Observation.query(value, function(res) {
				$scope.observations = res;
			});
		}
	}, true);


	$scope.$on('updateLayer', function($event, props) {
		CuraGeoJSON.get(props, function(feature) {
			$scope.geoLayer.updateLayer(props, feature);
		});
	});
}]);