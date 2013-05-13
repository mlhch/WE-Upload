'use strict';

angular.module('directives', [])

	.directive('map', [function() {
	return {
		restrict: 'E',
		template: '<div id="map"></div>',
		replace: true,
		transclude: true,
		link: function($scope, $el, iAttrs, controller) {
			console.log('initializing map');
			var map = L.map('map', {
				maxZoom: 14,
				zoomControl: true
			});

			console.log('adding basemap layer.');
			map.addLayer(new L.TileLayer(iAttrs.basemap));

			$scope.$watch('geoLayer', function(value) {
				if (value) {
					console.log('adding geoLayer layer');
					map.addLayer(value);
					var bounds = value.getBounds();
					bounds.isValid() ? map.fitBounds(bounds) : map.fitWorld();
				}
			});
		}
	};
}])

	.directive('datepicker', ['$parse', function($parse) {
	return function($scope, $el, attrs) {
		$el.datepicker({
			changeYear: true,
			changeMonth: true,
			dateFormat: 'yy-mm-dd',
			defaultDate: attrs.defaultdate,
			onSelect: function(dateText) {
				$parse(attrs.ngModel).assign($scope, dateText);
				$scope.$apply();
			}
		});
	}
}])

	.directive('dialog', ['$compile', function($compile) {
	return {
		restrict: 'E',
		template: ['<div id="dialog-data-entry" style="display: none; margin: 10px 0 -3px">',
			'<a id="catch-dialog-focus" href="#" style="position: absolute; left: -10000px">.</a>',
			'<form id="form-data-entry" method="post">',
			'<input class="field" type="hidden" name="id" ng-model="feature.id" />',
			'</form></div>'].join(''),
		replace: true,
		transclude: true,
		link: function($scope, $el, iAttrs, controller) {
			var lastTr, fields = {}, layout = [
				['watershed_name', 'datetime'],
				['latitude', 'longitude'],
				['do_mgl', 'do_%'],
				['cond', 'salinity'],
				['temp', 'ph'],
				['secchi_a', 'secchi_b'],
				['secchi_d'],
				['lab_sample', 'lab_id'],
				['nitrate', 'phosphate'],
				['coliform']
			];

			function cura_form_field(name, single) {
				var field = fields[name],
					propName = field[0],
					placeHolder = field[1],
					propDesc = field[2],
					colspan = single ? 'colspan="3"' : '',
					html = [];
				if (propName == 'lab_id') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%"',
						'	 ng-model="feature.properties.lab_id"',
						'	 ng-readonly="!config.canEdit"',
						'	 ng-disabled="feature.properties.lab_sample==\'N\'" />',
						'</td>']);
				} else if (propName == 'lab_sample') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td>',
						'	<label><input type="radio" value="Y"',
						'	 ng-model="feature.properties.lab_sample"',
						'	 ng-disabled="!config.canEdit" /> Yes</label> &nbsp; ',
						'	<label><input type="radio" value="N"',
						'	 ng-model="feature.properties.lab_sample"',
						'	 ng-disabled="!config.canEdit"',
						'	 ng-click="feature.properties.lab_id=\'\'" /> No</label>',
						'</td>']);
				} else if (propName == 'coliform') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td colspan="3">',
						'	<label><input type="radio" ng-model="feature.properties.coliform"',
						'	 value="Present" ng-disabled="!config.canEdit" /> Present</label> &nbsp; ',
						'	<label><input type="radio" ng-model="feature.properties.coliform"',
						'	 value="Absent" ng-disabled="!config.canEdit" /> Absent</label>',
						'</td>']);
				} else if (propName == 'latitude') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text" name="' + propName + '"',
						'	 ng-model="feature.geometry.coordinates[1]"',
						'	 ng-readonly="!config.canEdit"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				} else if (propName == 'longitude') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text" name="' + propName + '"',
						'	 ng-model="feature.geometry.coordinates[0]"',
						'	 ng-readonly="!config.canEdit"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				} else if (propName == 'datetime') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input datepicker class="field" type="text"',
						'	 ng-model="feature.properties.datetime"',
						'	 ng-disabled="!config.canEdit"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				} else {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text"',
						'	 ng-model="feature.properties[\'' + propName + '\']"',
						'	 ng-readonly="!config.canEdit"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				}
				return html.join('');
			}

			$scope.$watch('fields', function(value) {
				if (value) {
					value.forEach(function(field) {
						fields[field[0]] = field;
					});

					var html = ['<table style="width: 100%;">'];
					layout.forEach(function(row) {
						html.push('<tr>');
						row.forEach(function(field) {
							html.push(cura_form_field(field, row.length == 1));
						});
						html.push('</tr>');
					});
					html.push('</table>');

					jQuery('#form-data-entry').append($compile(html.join(''))($scope));
				}
			});

			$scope.openDialog = function(layer) {
				$scope.feature = layer.feature;
				showDialog('Edit Observation', layer);

				var validator = jQuery('#form-data-entry').validate();
				validator.prepareForm();
				validator.hideErrors();
				validator.elements().removeClass(validator.settings.errorClass);
			};

			function showDialog(title, layer) {
				var buttons = [];
				var config = $scope.config;

				if (config.canDelete) {
					buttons.push({
						text: "Delete",
						style: "padding: 0 2em; font-size: 12px;" + (layer ? '' : 'display:none'),
						click: function() {
							$scope.geoLayer.removeLayer(layer);

							$scope.geoLayer.filteredRows.every(function(value, index) {
								return value != layer || $scope.geoLayer.filteredRows.splice(index, 1) && false;
							});
							$scope.$apply();

							$el.dialog('close');
						}
					});
				}
				if (config.canEdit || (config.canAdd && !layer)) {
					buttons.push({
						text: "Save",
						style: "padding: 0 2em; font-size: 12px",
						click: function() {

						}
					});
				}
				buttons.push({
					text: "Close",
					style: "padding: 0 2em; font-size: 12px",
					click: function() {
						$el.dialog('close');
					}
				});

				$el.dialog({
					title: title || '',
					width: 650,
					height: 450,
					zIndex: 99999,
					buttons: buttons,
				});
			}
		}
	}
}])