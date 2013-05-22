'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore', '$timeout',
	'CuraGeoJSON', 'curaConfig', 'Observation',

function($scope, $cookieStore, $timeout, CuraGeoJSON, curaConfig, Observation) {
	/**
	 * Fields, Locations and other configurations
	 */
	curaConfig.get(function(res) {
		var config = $scope.config = res;

		var fields = $cookieStore.get('fields');
		$scope.fields = fields || config.fields;

		$scope.locations = [{
			id: "",
			watershed_name: " - Select community group - "
		}, {
			id: 0,
			watershed_name: "View All"
		}].concat(config.locations);

		/**
		 * GeoJSON layer
		 */
		CuraGeoJSON.get(function(res) {
			$scope.geoLayer = Cura.geoJson(res, {
				onFeatureClick: function(options) {
					var $event = options.originalEvent;
					var layers = $scope.geoLayer.highlightLayer(this, $event);
					searchByLayers(layers);
					$scope.$apply();
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

	$scope.$watch('sortList', function(value) {
		value && $cookieStore.put('sortList', value);
	}, true);

	/**
	 * Fields toggle and sorter
	 */
	// click <li> to toggle field status
	$scope.toggleFieldStatus = function(field) {
		field[4] = !field[4];
	}

	/**
	 * Search Options
	 */
	$scope.resetFilterOptions = function() {
		$scope.filterOptions = {
			location: $scope.locations[1], // View All
			searchText: '',
			startDate: '',
			endDate: '',
			forceReset: Date.now(), // This makes 'reset' always refresh
		}
		$scope.geoLayer.unHighlightAll();
	}

	function setExportFileName(value) {
		var name = ['water-quality'];
		if (value.location) {
			var l = value.location;
			if (l.id === 0) {
				name.push('-(group=all)');
			} else if (l.id !== '') {
				name.push('-(group=' + l.watershed_name + ')');
			}
		}
		if (value.searchText) {
			name.push('-(search=' + value.searchText + ')');
		}
		if (value.startDate || value.endDate) {
			name.push('-(');
			if (value.startDate) {
				var startDate = new Date(Date.parse(value.startDate));
				name.push(jQuery.datepicker.formatDate('yy-mm-dd', startDate));
			} else {
				name.push('?');
			}
			if (value.endDate) {
				var endDate = new Date(Date.parse(value.endDate));
				name.push('~' + jQuery.datepicker.formatDate('yy-mm-dd', endDate));
			} else {
				name.push('~?');
			}
			name.push(')');
		}
		if (value instanceof Array) {
			value.forEach(function(value) {
				name.push('-(station=' + value.watershed_name);
				name.push(',' + value.station_name);
				name.push(',' + value.location_id);
				name.push(')');
			});
		}
		name.push('.csv');

		$scope.exportName = name.join('').toLowerCase().replace(/ /g, '-');
		console.log($scope.exportName);
	}

	$scope.$watch('filterOptions', function(value) {
		if (value) {
			console.log('filter: ' + JSON.stringify(value));
			$scope.geoLayer.doFilter(value);
			setExportFileName(value);
			// use callback way to avoid table rows become 'empty' temporarily
			Observation.query(value, function(res) {
				$scope.observations = res;
			});
		}
	}, true);

	function searchByLayers(layers) {
		var stations = layers.map(function(layer) {
			var props = layer.feature.properties;
			return {
				watershed_name: props.watershed_name,
				station_name: props.station_name,
				location_id: props.location_id
			}
		});
		setExportFileName(stations);
		// use callback way to avoid table rows become 'empty' temporarily
		Observation.query({
			stations: stations
		}, function(res) {
			$scope.observations = res;
		});
	}

	$scope.highlightedRows = {};
	$scope.highlightRow = function(obj, $event) {
		var map = $scope.highlightedRows;
		if (!$event || !$event.metaKey && !$event.ctrlKey) {
			for (var key in map) {
				delete map[key];
			}
		}
		$scope.highlightedRows[obj.id] = true;

		$scope.geoLayer.highlightLayerByProperties({
			watershed_name: obj.watershed_name,
			station_name: obj.station_name,
			location_id: obj.location_id,
		}, $event);
	}

	$scope.highlightedClass = function(obj) {
		return this.highlightedRows[obj.id] ? 'highlight' : '';
	}
}]);