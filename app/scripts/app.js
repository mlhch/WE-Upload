'use strict';

var curaApp = angular.module('curaApp', ['services', 'directives', 'ngResource', 'ngCookies'])
	.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('', {
			templateUrl: 'views/main.html',
			controller: 'MainCtrl'
		})
			.otherwise({
			redirectTo: ''
		});
	}
])

.provider('cura', function() {
	this.$get = function() {
		function _in(subset, main) {
			if (subset instanceof Array && main instanceof Array) {
				return subset.every(function(s) { // every s find one m
					return s instanceof Array && !main.every(function(m) { // at lease one m match s
						// 0:field, 1:placeHolder, 2:description, 3:serial, 4:visible, 5:pattern
						return !(m instanceof Array && m[0] == s[0] && m[1] == s[1] && m[2] == s[2] && m[5] == s[5]);
					});
				});
			}
			return false;
		}

		function importFromCSV($scope) {
			if (jQuery('#formImport').length == 0) {
				jQuery([
						'<form id="formImport" method="POST" enctype="multipart/form-data" target="quiet"',
						' action="/wp-admin/admin-ajax.php?action=cura_import.action"></form>',
						'<iframe id="quiet"></iframe>'
				].join('')).hide().appendTo(document.body);
				window.curaCallback = function() {
					$scope.refreshFilter();
					$scope.$apply();
				}
			}
			var $form = jQuery('#formImport');
			$form.html('<input type="file" name="csvData" />');
			var $file = $form.find('[type=file]');
			$file.change(function() {
				$form.submit();
			})
			$file.click();
		}

		return {
			fieldsChanged: function(cookieFields, serverFields) {
				return !_in(cookieFields, serverFields) || !_in(serverFields, cookieFields);
			},
			config: function(res, $scope, $cookieStore) {
				var config = $scope.config = res;
				var fields = $cookieStore.get('fields');
				// Detect server side fields configuration changes
				$scope.fields = this.fieldsChanged(fields, config.fields) ? config.fields : fields;
				$scope.locations = $scope.locationsPrefix.concat(config.locations);
			},
			geoLayer: function(res, $scope) {
				var geoLayer = $scope.geoLayer = Cura.geoJson(res, {
					onFeatureClick: function(options) {
						var $event = options.originalEvent;
						$scope.highlightLocation(this.feature.properties.location_id, $event);
						$scope.resetFilterOptions($scope);
						$scope.filterOptions.locationIds = [];
						for (var location_id in $scope.highlightedLocations) {
							$scope.filterOptions.locationIds.push(location_id);
						}
						$scope.$apply();
					}
				});
			},
			watchFields: function(value, $scope, $cookieStore) {
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
			},
			importFromCSV: importFromCSV,
			highlightRow: function(obj, $event, $scope) {
				if (!$event || !$event.metaKey && !$event.ctrlKey) {
					$scope.highlightedRows = {};
				} else {
					$scope.highlightedRows = $scope.highlightedRows || {};
				}
				$scope.highlightedRows[obj.id] = true;

				$scope.highlightLocation(obj.location_id, $event);
			},
			highlightLocation: function(location_id, $event, $scope) {
				if (!$event || !$event.metaKey && !$event.ctrlKey) {
					$scope.highlightedLocations = {};
				} else {
					$scope.highlightedLocations = $scope.highlightedLocations || {};
				}
				$scope.highlightedLocations[location_id] = true;
			},
		}
	}
})