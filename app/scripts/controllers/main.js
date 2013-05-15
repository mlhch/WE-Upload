'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore',
	'CuraGeoJSON', 'curaConfig', 'locations', 'observations',

function($scope, $cookieStore, CuraGeoJSON, curaConfig, locations, observations) {
	/**
	 * Fields, Locations and other configurations
	 */
	curaConfig.query(function(json) {
		$scope.config = json;

		var fields = $cookieStore.get('fields');
		$scope.fields = fields || json.fields;

		$scope.locations = [{
			id: "",
			watershed_name: " - Select community group - "
		}, {
			id: 0,
			watershed_name: "View All"
		}].concat(json.locations);

		/**
		 * GeoJSON layer
		 */
		CuraGeoJSON.query(function(json) {
			$scope.geoLayer = Cura.geoJson(json, {
				onFeatureClick: function(options) {
					var $event = options.originalEvent;
					$scope.geoLayer.highlightLayer(this, $event);
					if (!$event.metaKey && !$event.ctrlKey) {
						$scope.filterOptions.featureIds = {};
					}
					$scope.filterOptions.featureIds[this.feature.id] = true;
					$scope.$apply();
				},
			});

			$scope.resetFilterOptions();
		});
	})

	$scope.$watch('fields', function(value) {
		if (!value) {
			return;
		}
		$cookieStore.put('fields', value);

		var visibleFields = [];
		for (var key in value) {
			value[key][4] && visibleFields.push(value[key]); // 4 means Visible
		}
		$scope.visibleFields = visibleFields;

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
		$scope.sortList = sortList;
	}, true);

	/**
	 * Fields toggle and sorter
	 */
	// click <li> to toggle field status
	$scope.toggleFieldStatus = function(field) {
		field[4] = !field[4];
	}
	// drag/drop to update fields order
	jQuery('#fields-selector').sortable({
		start: function(e, ui) {
			ui.item.data('start', ui.item.index());
		},
		stop: function(e, ui) {
			var start = ui.item.data('start'),
				end = ui.item.index();

			$scope.fields.splice(end, 0, $scope.fields.splice(start, 1)[0]);
			$scope.$apply();
		}
	});

	/**
	 * Search Options
	 */
	$scope.$watch('filterOptions', function(value, old) {
		if (typeof value != 'undefined') {
			console.log('filter: ' + JSON.stringify(value) + ' <- ' + JSON.stringify(old));

			if (value.searchText != '' && old && value.searchText != old.searchText) {
				if (Object.keys(value.featureIds).length != 0) {
					value.featureIds = {};
					return;
				}
			}
			if (value.location.id !== '' && old && value.location.id !== old.location.id) {
				if (Object.keys(value.featureIds).length != 0) {
					value.featureIds = {};
					return;
				}
			}
			if (old && JSON.stringify(value.featureIds) != '{}') {
				if (JSON.stringify(value.featureIds) != JSON.stringify(old.featureIds)) {
					if (value.location.id !== '' || value.searchText != '') {
						value.location.id = '';
						value.searchText = '';
						return;
					}
				}
			}

			$scope.geoLayer.doFilter(value);
		}
	}, true);

	$scope.resetFilterOptions = function() {
		$scope.filterOptions = {
			location: $scope.locations[1], // View All
			searchText: '',
			featureIds: {},
		}
		$scope.geoLayer.unHighlightAll();
	}

	$scope.fieldValue = function(layer, propName) {
		if (propName == 'latitude') {
			return layer.feature.geometry.coordinates[0];
		} else if (propName == 'longitude') {
			return layer.feature.geometry.coordinates[1];
		}
		return layer.feature.properties[propName];
	}

	/**
	 * Button to export data as CSV
	 */
	$scope.exportAsCSV = function() {
		location.href = ['/wp-admin/admin-ajax.php',
			'?action=cura_observations.json',
			'&export&watershed=' + $scope.filterOptions.location.id].join('');
	};
}]);