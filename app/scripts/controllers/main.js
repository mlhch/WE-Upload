'use strict';

curaApp.controller('MainCtrl', [
	'$scope', '$cookieStore',
	'CuraGeoJSON', 'fields', 'locations', 'observations',

function($scope, $cookieStore, CuraGeoJSON, Fields, locations, observations) {
	/**
	 * Fields operations
	 */

	// Load fields from cookie or server
	var fields = $cookieStore.get('fields');
	if (fields instanceof Array && fields.length) {
		$scope.fields = fields;
	} else {
		Fields.query(function(json) {
			$scope.fields = json.fields;
		})
	};

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
		$scope.geoJSONLayer = Cura.geoJson(json, {
			onFeatureClick: onFeatureClick
		});

		/**
		 * watershed dropdown select
		 */
		$scope.locations = $scope.geoJSONLayer.locations();
		$scope.selectedLocation = 0; // 0 => View All
	});

	$scope.$watch('selectedLocation', function(value) {
		if (typeof value != 'undefined') {
			console.log('community group ' + value + ' selected');
			$scope.geoJSONLayer.filterByCommunityGroup(value);
		}
	});

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

	function onFeatureClick() {
		var p = this.feature.properties;
		var c = this.feature.geometry.coordinates;
		var a = [this.feature.id];

		for (var i = 0, field; field = $scope.visibleFields[i++];) {
			var pos = field[3];
			var name = field[0];
			if (name == 'latitude') {
				a[pos] = c[1];
			} else if (name == 'longitude') {
				a[pos] = c[0];
			} else {
				a[pos] = p[name];
			}
		}

		$scope.observations = {};
		$scope.observations[this.feature.id] = a;
		$scope.location.selected = "";
		$scope.$apply();
	}
}]);