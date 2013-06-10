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

		function searchByLayers(layers, $scope) {
			var stations = layers.map(function(layer) {
				var props = layer.feature.properties;
				return {
					watershed_name: props.watershed_name,
					station_name: props.station_name,
					location_id: props.location_id
				}
			});
			$scope.exportName = getExportFileName(stations);

			$scope.AllFilterOptions = {
				location: $scope.locations[0], // View All
				searchText: '',
				startDate: '',
				endDate: '',
				stations: stations,
				forceReset: Date.now(), // This makes 'reset' always refresh
			};
		}

		function getExportFileName(value) {
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

			return name.join('').toLowerCase().replace(/ /g, '-');
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
						var layers = geoLayer.highlightLayer(this, $event);
						searchByLayers(layers, $scope);
						$scope.$apply();
					}
				});
			},
			resetFilterOptions: function($scope) {
				$scope.filterOptions = {
					location: $scope.locationsPrefix[1], // View All
					searchText: '',
					startDate: '',
					endDate: '',
					stations: [],
					forceReset: Date.now(), // This makes 'reset' always refresh
				}
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
			getExportFileName: getExportFileName,
			importFromCSV: importFromCSV,
			highlightRow: function(obj, $event, $scope) {
				var map = $scope.highlightedRows || ($scope.highlightedRows = {});
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
		}
	}
})