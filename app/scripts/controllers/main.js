'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore',
	'CuraGeoJSON', 'curaConfig', 'locations', 'Observations',

function($scope, $cookieStore, CuraGeoJSON, curaConfig, locations, Observations) {
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
					var layers = $scope.geoLayer.highlightLayer(this, $event);
					$scope.$apply();
					$scope.searchByLayers(layers);
				}
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
	$scope.resetFilterOptions = function() {
		$scope.filterOptions = {
			location: $scope.locations[1], // View All
			searchText: '',
			startDate: '',
			endDate: '',
			forceReset: Date.now(),
		}
		$scope.geoLayer.unHighlightAll();
	}
	$scope.$watch('filterOptions', function(value) {
		if (value) {
			console.log('filter: ' + JSON.stringify(value));

			$scope.geoLayer.doFilter(value);
			Observations.query(value, function(json) {
				$scope.observations = json.observations;
			});
		}
	}, true);
	$scope.searchByLayers = function(layers) {
		var stations = layers.map(function(layer) {
			var props = layer.feature.properties;
			return {
				watershed_name: props.watershed_name,
				station_name: props.station_name,
				location_id: props.location_id
			}
		});
		Observations.query({
			stations: stations
		}, function(json) {
			$scope.observations = json.observations;
		});
	}

	$scope.highlightedRows = {};
	$scope.highlightRow = function(row, $event) {
		var obj = $scope.highlightedRows;
		if (!$event.metaKey && !$event.ctrlKey) {
			for (var key in obj) {
				delete obj[key];
			}
		}
		$scope.highlightedRows[row[0]] = true;

		var props = {};
		$scope.fields.forEach(function(field) {
			var propName = field[0];
			var PropValue = row[field[3]];
			(propName == 'watershed_name') && (props[propName] = PropValue);
			(propName == 'station_name') && (props[propName] = PropValue);
			(propName == 'location_id') && (props[propName] = PropValue);
		});
		$scope.geoLayer.highlightLayerByProperties(props, $event);
	}

	$scope.highlightedClass = function(row) {
		return this.highlightedRows[row[0]] ? 'highlight' : '';
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