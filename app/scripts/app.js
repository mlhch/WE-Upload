'use strict';


window.debug = function(level) {
	switch (level) {
		case 'fn':
		return true;
	}
	return true;
}

var pluginUrl = angular.element('script:last')[0].src.replace('app/scripts/app.js', '');
angular.element('head').append([
		'<link rel="stylesheet" href="' + pluginUrl + 'vendor/bootstrap/css/bootstrap.css" />',
		//'<link rel="stylesheet" href="' + pluginUrl + 'vendor/bootstrap/css/bootstrap-responsive.css" />',
		'<link rel="stylesheet" href="' + pluginUrl + 'app/styles/main.css" />'
]);

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
			pluginUrl: pluginUrl,
			fieldsChanged: function(cookieFields, serverFields) {
				return !_in(cookieFields, serverFields) || !_in(serverFields, cookieFields);
			},
			geoLayer: function(res, $scope) {
				var geoLayer = Cura.geoJson(res, {
					onFeatureClick: function(options) {
						console.log('------onFeatureClick------');
						var $event = options.originalEvent;
						if (!$event || !$event.metaKey && !$event.ctrlKey) {
							geoLayer.unSelectAll();
						}
						var layer = this,
							layers = geoLayer.selectLayer(layer);
						geoLayer.highlightLayers();
						geoLayer.focusLayer(layer);

						var locationIds = [];
						for (var id in layers) {
							var location_id = layers[id].feature.properties.location_id;
							if (!locationIds[location_id]) {
								locationIds.push(location_id);
								locationIds[location_id] = true;
							}
						}
						$scope.filterLocationIds = locationIds;

						$scope.$apply();
					}
				});
				$scope.$broadcast('layerReady', geoLayer);

				$scope.$on('featureReady', function(event, props, feature) {
					geoLayer.updateLayer(props, feature);
				})
				$scope.$on('filterReseted', function(event, filterOptions) {
					console.log('geoLayer$on: filterReseted');
					geoLayer.unSelectAll();
					geoLayer.highlightLayers();
					geoLayer.fitRange();
				});
				$scope.$on('filterOptionChanged', function(event, filterOptions) {
					console.log('geoLayer$on: filterOptionChanged');
					geoLayer.doFilter(filterOptions);
					geoLayer.fitRange();
				});
				$scope.$on('observationFocused', function(event, ob) {
					console.log('geoLayer$on: observationFocused', ob);
					geoLayer.findLayerByProperties({
						watershed_name: ob.watershed_name,
						location_id: ob.location_id,
					}).forEach(function(layer) {
						geoLayer.focusLayer(layer);
					});
				});
				$scope.$on('observationHighlighted', function(event, selectedObs) {
					console.log('geoLayer$on: observationHighlighted', selectedObs);
					var map = {};
					geoLayer.unSelectAll(); // this is not expected when click a feature
					for (var id in selectedObs) {
						var ob = selectedObs[id];
						var key = ob.watershed_name + '|' + ob.location_id;
						if (!map[key]) { /// for new ob, it is possible here to find nothing
							geoLayer.findLayerByProperties({
								watershed_name: ob.watershed_name,
								location_id: ob.location_id,
							}).forEach(function(layer) {
								geoLayer.selectLayer(layer);
							});
						}
					}
					geoLayer.highlightLayers();
				});

				return geoLayer;
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
		}
	}
})