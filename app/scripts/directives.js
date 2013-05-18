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


	.directive('fieldManager', [function() {
	return {
		restrict: 'E',
		template: [
			'<ol class="field-manager">',
			'	<li ng-repeat="field in fields" ng-click="toggleFieldStatus(field)">',
			'		{{field[2]}}',
			'		<input type="checkbox" value="{{field[0]}}"',
			'		 ng-checked="field[4]" ng-model="field[4]"',
			'		 ng-click="$event.stopPropagation()" />',
			'	</li>',
			'</ol>'].join(''),
		replace: true,
		transclude: true,
		link: function(scope, iElement, iAttrs, controller) {
			scope.toggleFieldManager = function() {
				iElement.slideToggle()
			}

			// drag and drop to update fields order
			iElement.sortable({
				start: function(e, ui) {
					ui.item.data('start', ui.item.index());
				},
				stop: function(e, ui) {
					var start = ui.item.data('start'),
						end = ui.item.index();

					scope.fields.splice(end, 0, scope.fields.splice(start, 1)[0]);
					scope.$apply();
				}
			});
		}
	}
}])


	.directive('tablesorter', ['$parse', function($parse) {
	return {
		restrict: 'E',
		template: [
			'<table class="tablesorter">',
			'	<thead>',
			'		<tr>',
			'			<th ng-repeat="field in visibleFields">{{field[2]}}</th>',
			'			<th style="text-align:center; width:10px">Action</th>',
			'		</tr>',
			'	</thead>',
			'	<tr tablesorter-row ng-class="highlightedClass(obj)"',
			'	 ng-repeat="obj in observations"',
			'	 ng-click="highlightRow(obj, $event)">',
			'		<td tablesorter-col ng-repeat="field in visibleFields">{{obj[field[0]]}}</td>',
			'		<td style="padding: 0px; text-align: center">',
			'			<button type="button" ng-click="openEditDialog(obj)"',
			'			 class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"',
			'			><span class="ui-button-text" style="padding:3px 1em">Details</span></button></td>',
			'	</tr>',
			'</table>'].join(''),
	}
}])


	.directive('tablesorterRow', [function() {
	return function(scope, iElement, iAttrs, controller) {
		//console.log("row: " + scope.$index);
	}
}])


	.directive('tablesorterCol', [function() {
	return {
		restrict: 'A',
		link: function(scope, iElement, iAttrs, controller) {
			//console.log("r" + scope.$parent.$index + ", c" + scope.$index)
			if (scope.$parent.$last && scope.$last) {
				var $scope = scope.$parent.$parent;
				var $tb = jQuery('table.tablesorter');

				if ($tb[0].config) {
					$tb.trigger('update');
					setTimeout(function() {
						$tb.trigger('sorton', [$scope.sortList]);
					}, 1);
					return;
				}
				var headers = {};
				// the Action column don't need sortable
				var cols = $tb.find('thead tr th').length;
				headers[cols - 1] = {
					sorter: false
				};

				$tb.tablesorter({
					headers: headers,
					sortList: $scope.sortList || [],
					//widthFixed: true,
					widgets: ['zebra'],
				}).bind('sortEnd', function() {
					$scope.sortList = this.config.sortList;
					$scope.$apply();
					$tb.trigger("applyWidgets");
				});

				scope.$emit('tablesorterInitialized', $tb);
			}
		}
	}
}])


	.directive('tablesorterPagination', ['$cookieStore', '$compile',

function($cookieStore, $compile) {
	return {
		restrict: 'E',
		template: [
			'<div class="tablesorterPager" style="display: block">',
			'</div>'].join(''),
		replace: true,
		transclude: true,
		link: function(scope, iElement, iAttrs, controller) {
			scope.$watch('config.pluginUrl', function(value) {
				if (value) {
					var url = value + 'lib/tablesorter/addons/pager/icons';
					var html = [
						'	<form>',
						'		<img src="' + url + '/first.png" class="first" width="30" />',
						'		<img src="' + url + '/prev.png" class="prev" width="30" />',
						'		<input type="text" class="pagedisplay" />',
						'		<img src="' + url + '/next.png" class="next" width="30" />',
						'		<img src="' + url + '/last.png" class="last" width="30" />',
						'		<select class="pagesize">',
						'			<option selected="selected" value="10">10</option>',
						'			<option value="5">5</option>',
						'		</select>',
						'	</form>'].join('');
					iElement.append($compile(html)(scope));
				}
			});

			scope.$watch('pagesize', function(value) {
				value && $cookieStore.put('pagesize', value);
			})

			scope.$on('tablesorterInitialized', function(event, $tb) {
				scope.pagesize = $cookieStore.get('pagesize') || iElement.find('.pagesize').val();

				$tb.tablesorterPager({
					container: iElement,
					positionFixed: false,
				}).bind('applyWidgets', function() {
					var config = this.config;

					/*if (config.totalPages <= 1 && scope.filterOptions.location.id) {
						iElement.hide();
						return;
					} else {
						iElement.show();
					}*/

					if (config.page < 1) {
						var img = iElement.find(config.cssFirst);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);

						var img = iElement.find(config.cssPrev);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
					} else {
						var img = iElement.find(config.cssFirst);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);

						var img = iElement.find(config.cssPrev);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
					}
					if (config.page >= config.totalPages - 1) {
						var img = iElement.find(config.cssLast);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);

						var img = iElement.find(config.cssNext);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1-disabled$2');
						img.attr('src', src);
					} else {
						var img = iElement.find(config.cssLast);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);

						var img = iElement.find(config.cssNext);
						var src = img.attr('src').replace(/(\/[^\/\-]+)(?:-disabled)*(\.png)/, '$1$2');
						img.attr('src', src);
					}
				});
			});
		}
	}
}])


	.directive('dialog', ['$compile', '$parse', 'Observation', 'curaConfig', 'Toast',

function($compile, $parse, Observation, curaConfig, Toast) {
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

					$form.append($compile(html.join(''))($scope));
					enableFormValidator($form);
				}
			});

			$scope.isFieldDisabled = function() {
				var config = $scope.config;
				var ob = $scope.observation;
				return ob && !((!ob.id && config.canAdd) || (ob.id && config.canEdit));
			}

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
						'	 ng-disabled="isFieldDisabled()||observation.lab_sample==\'N\'" />',
						'</td>']);
				} else if (propName == 'lab_sample') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td>',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.lab_sample"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 value="Y" /> Yes</label> &nbsp; ',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.lab_sample"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 ng-click="observation.lab_id=\'\'" value="N" /> No</label>',
						'</td>']);
				} else if (propName == 'coliform') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td colspan="3">',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.coliform"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 value="Present" /> Present</label> &nbsp; ',
						'	<label><input type="radio" name="' + propName + '"',
						'	 ng-model="observation.coliform"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 value="Absent" /> Absent</label>',
						'</td>']);
				} else if (propName == 'datetime') {
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input datepicker class="field" type="text" name="' + propName + '"',
						'	 ng-model="observation.datetime"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				} else {
					var directive = '';
					if (propName == 'watershed_name' || propName == 'station_name' || propName == 'location_id') {
						directive = 'typeahead-' + propName;
					}
					html = html.concat([
						'<td class="label">' + propDesc + '</td>',
						'<td style="vertical-align: top" ' + colspan + '>',
						'	<input ' + directive + ' class="field" type="text" name="' + propName + '"',
						'	 ng-model="observation[\'' + propName + '\']"',
						'	 ng-disabled="isFieldDisabled()"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				}
				return html.join('');
			}

			function enableFormValidator($form) {
				jQuery.validator.addMethod("secchi_b", function(value, element, param) {
					var value_a = jQuery('input[name=secchi_a]').val();
					var value_b = value;
					var a = parseFloat(value_a);
					var b = parseFloat(value_b);

					if (a && b) {
						var el = jQuery('input[name=secchi_d]').val(a / 2 + b / 2);
						$parse(el.attr('ng-model')).assign($scope, el.val());
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

				$form.validate(cura_validation_options);
			}

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
				if (config.canEdit || (config.canAdd && !ob.id)) {
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
					Toast.show('Server validation errors:\n\n' + error.join('<br /><br />\n\n'));
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
					$scope.$broadcast('clearTypeaheads');
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
					$scope.$broadcast('clearTypeaheads');
				} else {
					Toast.show('Data Entry ' + resp.id + ' does not exist');
				}
			}

			function saveError() {
				Toast.show('Sorry, the server encountered an error');
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


	.directive('typeaheadWatershedName', ['$parse', 'curaConfig', function($parse, curaConfig) {
	return function($scope, $el, $attrs) {
		var typeaheadWatershedItems;

		$scope.$on('clearTypeaheads', function() {
			typeaheadWatershedItems = null;
		});

		$el.typeahead({
			source: function(query, callback) {
				if (typeaheadWatershedItems) {
					return typeaheadWatershedItems;
				}
				curaConfig.locations(function(res) {
					var items = [];
					for (var i = 0, row; row = res[i++];) {
						items.push(row.watershed_name);
					}
					typeaheadWatershedItems = items;
					callback(items);
					return;
				});
			},
			updater: function(value) {
				$attrs.ngModel && $parse($attrs.ngModel).assign($scope, value);

				var els = [],
					$form = $el.closest('form');
				els.push($form.find("input[name=station_name]"));
				els.push($form.find("input[name=location_id]"));
				els.push($form.find("input[name=latitude]"));
				els.push($form.find("input[name=longitude]"));
				for (var i = 0, el; el = els[i++];) {
					el.val('').attr('readOnly', false).removeClass('error');
					$form.validate().errorsFor(el[0]).hide();
				}
				return value;
			}
		});
	}
}])


	.directive('typeaheadStationName', ['$parse', 'curaConfig', function($parse, curaConfig) {
	return function($scope, $el, $attrs) {
		var typeaheadStationItems, typeaheadStationRows;

		$scope.$on('clearTypeaheads', function() {
			typeaheadStationItems = null;
			typeaheadStationRows = null;
		});

		$el.typeahead({
			source: function(query, callback) {
				var $form = $el.closest('form');
				var watershed = $form.find("input[name=watershed_name]").val();
				if (watershed.length == 0) {
					return;
				}

				typeaheadStationItems = typeaheadStationItems || {};
				typeaheadStationRows = typeaheadStationRows || {};
				if (typeaheadStationItems[watershed]) {
					return typeaheadStationItems[watershed];
				}
				curaConfig.typeaheads_station_name({
					watershed: watershed
				}, function(res) {
					var items = [];
					for (var i = 0, row; row = res[i++];) {
						items.push(row.station_name);
					}
					typeaheadStationItems[watershed] = items;
					typeaheadStationRows[watershed] = res;
					callback(items);
				});
			},
			updater: function(value) {
				$attrs.ngModel && $parse($attrs.ngModel).assign($scope, value);

				var $form = $el.closest('form');
				var watershed = $form.find("input[name=watershed_name]").val();
				var station = value;
				if (watershed.length == 0 || station.length == 0) {
					return value;
				}

				$form.find("input[name=location_id]").val('');
				$form.find("input[name=latitude]").val('').attr('readOnly', false);
				$form.find("input[name=longitude]").val('').attr('readOnly', false);

				if (typeaheadStationItems[watershed]) {
					var el, validator = $form.validate();
					for (var i = 0, row; row = typeaheadStationRows[watershed][i++];) {
						if (row.station_name == station) {
							el = $form.find("input[name=location_id]").val(row.location_id);
							$parse(el.attr('ng-model')).assign($scope, row.location_id);

							el = $form.find("input[name=latitude]").val(row.latitude);
							el.attr('readOnly', row.latitude !== null && validator.check(el[0]));
							$parse(el.attr('ng-model')).assign($scope, row.latitude);

							el = $form.find("input[name=longitude]").val(row.longitude);
							el.attr('readOnly', row.longitude !== null && validator.check(el[0]));
							$parse(el.attr('ng-model')).assign($scope, row.longitude);

							validator.showErrors();
							break;
						}
					}
				}

				return value;
			}
		});
	}
}])


	.directive('typeaheadLocationId', ['$parse', 'curaConfig', function($parse, curaConfig) {
	return function($scope, $el, $attrs) {
		var typeaheadLocationItems, typeaheadLocationRows;

		$scope.$on('clearTypeaheads', function() {
			typeaheadLocationItems = null;
			typeaheadLocationRows = null;
		});

		$el.typeahead({
			source: function(query, callback) {
				var $form = $el.closest('form');
				var watershed = $form.find("input[name=watershed_name]").val();
				if (watershed.length == 0) {
					return;
				}

				typeaheadLocationItems = typeaheadLocationItems || {};
				typeaheadLocationRows = typeaheadLocationRows || {};
				if (typeaheadLocationItems[watershed]) {
					return typeaheadLocationItems[watershed];
				}
				curaConfig.typeaheads_location_id({
					watershed: watershed
				}, function(res) {
					var items = [];
					for (var i = 0, row; row = res[i++];) {
						items.push(row.location_id);
					}
					typeaheadLocationItems[watershed] = items;
					typeaheadLocationRows[watershed] = res;
					callback(items);
				});
			},
			updater: function(value) {
				$attrs.ngModel && $parse($attrs.ngModel).assign($scope, value);

				var $form = $el.closest('form');
				var watershed = $form.find("input[name=watershed_name]").val();
				var location_id = value;
				if (watershed.length == 0 || location_id.length == 0) {
					return value;
				}

				$form.find("input[name=station_name]").val('');
				$form.find("input[name=latitude]").val('').attr('readOnly', false);
				$form.find("input[name=longitude]").val('').attr('readOnly', false);

				if (typeaheadLocationRows[watershed]) {
					var el, validator = $form.validate();
					for (var i = 0, row; row = typeaheadLocationRows[watershed][i++];) {
						if (row.location_id == location_id) {
							el = $form.find("input[name=station_name]").val(row.station_name);
							$parse(el.attr('ng-model')).assign($scope, row.station_name);

							el = $form.find("input[name=latitude]").val(row.latitude);
							el.attr('readOnly', row.latitude !== null && validator.check(el[0]));
							$parse(el.attr('ng-model')).assign($scope, row.latitude);

							el = $form.find("input[name=longitude]").val(row.longitude);
							el.attr('readOnly', row.longitude !== null && validator.check(el[0]));
							$parse(el.attr('ng-model')).assign($scope, row.longitude);

							validator.showErrors();
							break;
						}
					}
				}

				return value;
			}
		});
	}
}])