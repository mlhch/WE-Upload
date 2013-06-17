'use strict';

curaApp.controller('MainCtrl', [
		'$scope', '$cookieStore', '$timeout',
		'CuraGeoJSON', 'curaConfig', 'cura',

	function($scope, $cookieStore, $timeout, CuraGeoJSON, curaConfig, cura) {
		var defaultGroups = [{
				id: "",
				watershed_name: " - Select community group - "
			}, {
				id: 0,
				watershed_name: "View All"
			}
		];
		var defaultFilterOption = {
			location: defaultGroups[1],
			searchText: '',
			startDate: '',
			endDate: '',
		};
		var defaultFilterOptions = angular.extend({}, defaultFilterOption, {
			locationIds: []
		});
		var setFilterOptions = function(options) {
			return $scope.filterOptions = angular.extend({}, defaultFilterOptions, options || {});
		}
		$scope.filterOption = angular.extend({}, defaultFilterOptions);


		$scope.importFromCSV = cura.importFromCSV;
		$scope.resetFilterOptions = function() {
			console.log('------reset------')
			$scope.filterOption = angular.extend({}, defaultFilterOption);
			$scope.filterLocationIds = [];
			$scope.$broadcast('filterReseted');
		};


		$scope.$watch('fields', function(value) {
			value && cura.watchFields(value, $scope, $cookieStore);
		}, true);
		$scope.$watch('sortList', function(value) {
			value && $cookieStore.put('sortList', value);
		}, true);
		$scope.$watch('filterLocationIds', function(value) {
			if (value) {
				console.log('main@watch: filterLocationIds', value.slice(0));
				$scope.$broadcast('filterLocationIdsChanged', value);
				setFilterOptions({
					locationIds: value,
				});
			}
		});
		$scope.$watch('filterOption', function(value) {
			if (value) {
				console.log('------filterOption------');
				$scope.$broadcast('filterOptionChanged', value);
				setFilterOptions(value);
			}
		}, true);
		$scope.$watch('filterOptions', function(value) {
			if (value) {
				console.log('main$watch: filterOptions');
				$scope.$broadcast('filterOptionsChanged', value);
			}
		}, true);
		$scope.$watch('updatingOb', function(value, oldValue) {
			if (value && oldValue) {
				$scope.$broadcast('clearTypeaheads');
				$scope.filterLocationIds = [value.location_id];
				$scope.updatingOb = null;

				curaConfig.get(function(res) {
					cura.config(res, $scope, $cookieStore);
				});
			}
		}, true);


		curaConfig.get(function(res) {
			var config = $scope.config = res;
			var fields = $cookieStore.get('fields');
			// Detect server side fields configuration changes
			$scope.fields = cura.fieldsChanged(fields, config.fields) ? config.fields : fields;
			$scope.locations = defaultGroups.concat(config.locations);
		});
		CuraGeoJSON.query(function(res) {
			cura.geoLayer(res, $scope);
		});
		setFilterOptions();
	}
]);