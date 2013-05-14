'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore',
	'CuraGeoJSON', 'curaConfig', 'locations', 'observations',

function($scope, $cookieStore, CuraGeoJSON, curaConfig, locations, observations) {
	/**
	 * Fields operations
	 */

	// Load fields from cookie or server
	curaConfig.query(function(json) {
		$scope.config = json;

		var fields = $cookieStore.get('fields');
		$scope.fields = fields || json.fields;
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

		/**
		 * watershed dropdown select
		 */
		$scope.locations = $scope.geoLayer.locations();
		$scope.resetFilterOptions();
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
			if (value.groupId !== '' && old && value.groupId !== old.groupId) {
				if (Object.keys(value.featureIds).length != 0) {
					value.featureIds = {};
					return;
				}
			}
			if (old && JSON.stringify(value.featureIds) != '{}') {
				if (JSON.stringify(value.featureIds) != JSON.stringify(old.featureIds)) {
					if (value.groupId !== '' || value.searchText != '') {
						value.groupId = '';
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
			groupId: 0, // 0 => View All
			searchText: '',
			featureIds: {},
		}
		$scope.geoLayer.unHighlightAll();
	}

	/* me.loadLocations(null, function() {
		if (!/mobile | tablet | android / i.test(navigator.userAgent)) {
	jQuery('.tooltip_description span').hide();
}
if (!jQuery.cookie('mobile-redirect')) {
	if (/mobile|tablet|android/i.test(navigator.userAgent)) {
		jQuery(".tooltip_description").dialog({
			width: 400,
			modal: true
		});
	}
} else {
	jQuery("#remember-choice").attr('checked', 'checked');
}
});
*/
}]);