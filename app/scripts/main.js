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
			$scope.filterOptions = $scope.filterOptions || {};
			angular.extend($scope.filterOptions, options || {});
		}
		var config = function(res) {
			var config = $scope.config = res;
			var fields = $cookieStore.get('fields');
			// Detect server side fields configuration changes
			$scope.fields = cura.fieldsChanged(fields, config.fields) ? config.fields : fields;
			$scope.locations = defaultGroups.concat(config.locations.map(function(value){
				return {
					id: value.id,
					watershed_name: value.watershed_name,
				}
			}));
			var id = $scope.filterOption.location.id;
			$scope.locations.every(function(value) {
				return value.id !== id || ($scope.filterOption.location = value) && false
			}) && ($scope.filterOption.location = $scope.locations[1]);
		}


		$scope.importFromCSV = cura.importFromCSV;
		$scope.resetFilterOptions = function() {
			console.log('------reset------')
			$scope.$broadcast('filterReseted');
			$scope.filterOption = angular.extend({}, defaultFilterOption);
			$scope.filterLocationIds = [];
			$scope.filterOptions.forceReset = Date.now()
		};


		$scope.$watch('fields', function(value) {
			value && cura.watchFields(value, $scope, $cookieStore);
		}, true);
		$scope.$watch('filterLocationIds', function(value) {
			if (value) {
				console.log('main@watch: filterLocationIds', value);
				setFilterOptions({
					locationIds: value,
				});
			}
		}, true);
		$scope.$watch('filterOption', function(value) {
			if (value) {
				console.log('main$watch: filterOption', value)
				if (value.location.id !== '') {
					setFilterOptions(value);
					$scope.$broadcast('filterOptionChanged', value);
				}
			}
		}, true);
		$scope.$watch('filterOptions', function(value) {
			if (value) {
				console.log('main$watch: filterOptions', value)
				$scope.$broadcast('filterOptionsChanged', value);
			}
		}, true);


		$scope.$on('observationAdded', function(event, newOb) {
			console.log('main$on: observationAdded')

			$scope.$broadcast('clearTypeaheads');
			if ($scope.filterOptions.locationIds.length) {
				if (!$scope.filterLocationIds[newOb.location_id]) {
					$scope.filterLocationIds[newOb.location_id] = true
					$scope.filterLocationIds.push(newOb.location_id)
				}
			}
			$scope.filterOptions.forceReset = Date.now();

			curaConfig.get(config);
			var props = {
				watershed_name: newOb.watershed_name,
				location_id: newOb.location_id,
			}
			CuraGeoJSON.get(props, function(res) {
				$scope.$broadcast('featureReady', props, res);
				$scope.$broadcast('observationFocused', newOb);
			})
		});
		$scope.$on('observationUpdated', function(event, newOb, oldOb) {
			console.log('main$on: observationUpdated')

			$scope.$broadcast('clearTypeaheads');
			if ($scope.filterOptions.locationIds.length) {
				$scope.filterOptions.locationIds.push(newOb.location_id);
			}
			$scope.filterOptions.forceReset = Date.now();

			curaConfig.get(config);

			var props = {
				watershed_name: newOb.watershed_name,
				location_id: newOb.location_id,
			}
			CuraGeoJSON.get(props, function(res) {
				$scope.$broadcast('featureReady', props, res);
				$scope.$broadcast('observationFocused', newOb);
			})
			if (newOb.watershed_name != oldOb.watershed_name || newOb.location_id != oldOb.location_id) {
				var props = {
					watershed_name: oldOb.watershed_name,
					location_id: oldOb.location_id,
				}
				CuraGeoJSON.get(props, function(res) {
					$scope.$broadcast('featureReady', props, res);
				})
			}
		});
		$scope.$on('observationDeleted', function(event, deletingOb) {
			console.log('main$on: observationDeleted')

			$scope.$broadcast('clearTypeaheads');
			$scope.filterOptions.forceReset = Date.now();

			curaConfig.get(config);

			var props = {
				watershed_name: deletingOb.watershed_name,
				location_id: deletingOb.location_id,
			}
			CuraGeoJSON.get(props, function(res) {
				$scope.$broadcast('featureReady', props, res);
			})
		})


		curaConfig.get(config);
		CuraGeoJSON.query(function(res) {
			var geoLayer = cura.geoLayer(res, $scope);
			$scope.showAllLayers = function() {
				geoLayer.fitRange();
			}
		});
		$scope.filterLocationIds = []
		/// show default observations
		$scope.filterOption = angular.extend({}, defaultFilterOption);
	}
]);