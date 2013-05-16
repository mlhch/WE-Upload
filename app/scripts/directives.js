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
		$el.datetimepicker({
			changeYear: true,
			changeMonth: true,
			ampm: true,
			dateFormat: 'mm/dd/yy',
			timeFormat: 'hh:mm TT',
			defaultDate: attrs.defaultdate,
			onSelect: function(dateText) {
				$parse(attrs.ngModel).assign($scope, dateText);
				$scope.$apply();
			}
		});
	}
}])

	.directive('dialog', ['$compile', 'Observation', 'Toast', function($compile, Observation, Toast) {
	return {
		restrict: 'E',
		template: [
			'<div id="dialog-data-entry" style="display: none;">',
			'	<a id="catch-dialog-focus" href="#" style="position: absolute; left: -10000px">.</a>',
			'	<form id="form-data-entry" method="post"></form>',
			'</div>'].join(''),
		replace: true,
		transclude: true,
		link: function($scope, $el, iAttrs, controller) {
			var $form = $el.find('form');
			validateForm();

			var lastTr, fields = {}, layout = [
				['watershed_name', 'datetime'],
				['station_name', 'location_id'],
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
				// input[name] is needed by validation
				if (propName == 'lab_id') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text" name="' + propName + '"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%"',
						'	 ng-model="observation.lab_id"',
						'	 ng-readonly="!config.canEdit"',
						'	 ng-disabled="Observation.lab_sample==\'N\'" />',
						'</td>']);
				} else if (propName == 'lab_sample') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td>',
						'	<label><input type="radio" value="Y" name="' + propName + '"',
						'	 ng-model="observation.lab_sample"',
						'	 ng-disabled="!config.canEdit" /> Yes</label> &nbsp; ',
						'	<label><input type="radio" value="N" name="' + propName + '"',
						'	 ng-model="observation.lab_sample"',
						'	 ng-disabled="!config.canEdit"',
						'	 ng-click="observation.lab_id=\'\'" /> No</label>',
						'</td>']);
				} else if (propName == 'coliform') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td colspan="3">',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.coliform"',
						'	 value="Present" ng-disabled="!config.canEdit" /> Present</label> &nbsp; ',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.coliform"',
						'	 value="Absent" ng-disabled="!config.canEdit" /> Absent</label>',
						'</td>']);
				} else if (propName == 'datetime') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input datepicker class="field" type="text" name="' + propName + '"',
						'	 ng-model="observation.datetime"',
						'	 ng-disabled="!config.canEdit"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				} else {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input class="field" type="text" name="' + propName + '"',
						'	 ng-model="observation[\'' + propName + '\']"',
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

					// Binding to Hidden Fields does not seem to work.
					// @see https://groups.google.com/forum/?fromgroups=#!topic/angular/pjZm4KMEoyc
					var html = ['<input ng-show="false" name="id" ng-model="Observation.id" />'];
					html.push('<table style="width: 100%;">');
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

			$scope.openAddDialog = function() {
				var now = new Date;
				now.hour = now.getHours();
				now.minute = now.getMinutes();
				var dt = jQuery.datepicker.formatDate('mm/dd/yy', now);
				var tm = jQuery.datepicker.formatTime('hh:mm TT', now);
				$scope.observation = {
					id: 0,
					datetime: dt + ' ' + tm,
				};
				openDialog('Add Observation', $scope.observation);
				jQuery.validator && $form.validate().resetForm();
			}

			$scope.openEditDialog = function(obj) {
				$scope.observation = obj;
				openDialog('Edit Observation', obj);

				var validator = jQuery('#form-data-entry').validate();
				validator.prepareForm();
				validator.hideErrors();
				validator.elements().removeClass(validator.settings.errorClass);
			};

			function openDialog(title, ob) {
				var buttons = [];
				var config = $scope.config;

				if (config.canDelete) {
					buttons.push({
						text: "Delete",
						style: "padding: 0 2em; font-size: 12px;" + (ob.id ? '' : 'display:none'),
						click: function() {
							Observation.delete(ob, delSuccess, saveError);
						}
					});
				}
				if (config.canEdit || (config.canAdd && !layer)) {
					buttons.push({
						text: "Save",
						style: "padding: 0 2em; font-size: 12px",
						click: function() {
							if ($form.validate().form()) {
								// Here we use Class.save instead of Instance.$save
								// because the returned Resource is not at root node
								Observation.save(ob, saveSuccess, saveError);
							}
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

			function saveSuccess(resp) {
				if (resp.error) {
					var error = [];
					for (var i in resp.error) {
						var v = $el.find('[name="' + i + '"]').val();
						error.push(i + ' (' + v + ') : ' + resp.error[i]);
					}
					Toast.show('Server validation errors:\n\n' + error.join('\n\n'));
					return;
				}

				if (resp.affectedRows) {
					if (resp.insertId) {
						$scope.observation.id = resp.insertId;
						$scope.geoLayer.addRawData($scope.observation);
						var props = $scope.observation;
						Observation.query({
							stations: [{
								watershed_name: props.watershed_name,
								station_name: props.station_name,
								location_id: props.location_id
							}]
						}, function(res) {
							$scope.observations = res;
							$scope.highlightRow(res[0]);
						})
						Toast.show('Entry ' + resp.insertId + ' added');
					} else {
						Toast.show('Entry ' + resp.id + ' updated');
					}
					//me.clearTypeaheads();
				} else {
					Toast.show('No changes updated')
				}
				$el.dialog('close');
			}

			function delSuccess(resp) {
				if (resp.affectedRows) {
					$el.dialog('close');
					$scope.observations.every(function(value, index) {
						return value.id != resp.id || $scope.observations.splice(index, 1) && false;
					});
					Toast.show('Entry ' + resp.id + ' deleted');
					//me.clearTypeaheads();
				} else {
					Toast.show('Data Entry ' + resp.id + ' does not exist');
				}
			}

			function saveError() {
				Toast.show('Sorry, the server encountered an error');
			}

			function validateForm() {
				if (!jQuery.validator) {
					return;
				}

				jQuery.validator.addMethod("secchi_b", function(value, element, param) {
					var value_a = jQuery('input[name=secchi_a]').val();
					var value_b = value;
					var a = parseFloat(value_a);
					var b = parseFloat(value_b);

					if (a && b) {
						jQuery('input[name=secchi_d]').val(a / 2 + b / 2);
					}

					return ('' === value_a && '' === value_b) || (Math.abs(a - b) <= 4);
				}, cura_validation_options.messages.secchi_b);

				jQuery.validator.addMethod("secchi_d", function(value, element, param) {
					var value_a = jQuery('input[name=secchi_a]').val();
					var value_b = jQuery('input[name=secchi_b]').val();
					var value_d = jQuery('input[name=secchi_d]').val();
					var a = parseFloat(value_a);
					var b = parseFloat(value_b);
					var d = parseFloat(value_d);

					return ('' === value_a && '' === value_b) || a + b == d + d;
				}, cura_validation_options.messages.secchi_d);

				$el.find('form').validate(cura_validation_options);
			}
		}
	}
}])

	.directive('mobiletip', ['$cookieStore', function($cookieStore) {
	return {
		restrict: 'E',
		template: [
			'<div class="tooltip_description" title="Mobile site available!" style="display: none">',
			'	<p>',
			'		<span>Looks like you are on a mobile device. </span>Would you like to be redirected to the site optimized for mobile devices?',
			'	</p>',
			'	<p style="margin: 10px; text-align: left">',
			'		<label><input type="checkbox" /> Remember my choice on this device</label>',
			'	</p>',
			'	<p style="margin-bottom: 0px; text-align: center">',
			'		<button ng-click="gotoMobile()" style="padding: 3px 20px; margin: 10px 20px">Yes</button>',
			'		<button ng-click="notgoMobile()" style="padding: 3px 20px; margin: 10px 20px">No</button>',
			'	</p>',
			'</div>'].join(''),
		replace: true,
		transclude: true,
		link: function($scope, $el, iAttrs, controller) {
			var $tip = jQuery(".tooltip_description");

			if (!/mobile|tablet|android/i.test(navigator.userAgent)) {
				$tip.find('span').hide();
			}

			if (!$cookieStore.get('mobile-redirect')) {
				if (/mobile|tablet|android/i.test(navigator.userAgent)) {
					$tip.dialog({
						width: 400,
						modal: true
					});
				}
			} else {
				$tip.find('input').attr('checked', 'checked');
			}

			$scope.mobileSite = function() {
				if (!$scope.tipDialog) {
					$scope.tipDialog = $tip.dialog({
						width: 400,
						modal: true
					});
				} else {
					if ($tip.dialog('isOpen')) {
						$tip.dialog('close');
					} else {
						$tip.dialog('open');
					}
				}
			};
			$scope.gotoMobile = function() {
				if ($tip.find('input').is(':checked')) {
					$cookieStore.put('mobile-redirect', 'YES');
				} else {
					$cookieStore.remove('mobile-redirect');
				}
				location.href = "../m/water-quality/";
			};

			$scope.notgoMobile = function() {
				if ($tip.find('input').is(':checked')) {
					$cookieStore.put('mobile-redirect', 'NO');
				} else {
					$cookieStore.remove('mobile-redirect');
				}
				$tip.dialog('close');
			};
		}
	};
}])