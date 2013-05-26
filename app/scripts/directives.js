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
					var url = value + 'vendor/jquery.tablesorter/addons/pager/icons';
					var html = [
						'	<form>',
						'		<img src="' + url + '/first.png" class="first" width="30" />',
						'		<img src="' + url + '/prev.png" class="prev" width="30" />',
						'		<input type="text" class="pagedisplay" />',
						'		<img src="' + url + '/next.png" class="next" width="30" />',
						'		<img src="' + url + '/last.png" class="last" width="30" />',
						'		<select class="pagesize">',
						'			<option selected="selected" value="100">100</option>',
						'			<option value="50">50</option>',
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
					size: scope.pagesize,
				}).bind('applyWidgets', function() {
					var config = this.config;

					if (config.totalPages <= 1 && scope.filterOptions.location.id) {
						iElement.hide();
						return;
					} else {
						iElement.show();
					}

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


	.directive('dialog', ['$compile', '$parse', '$timeout', 'Observation', 'curaConfig', 'Toast',

function($compile, $parse, $timeout, Observation, curaConfig, Toast) {
	return {
		restrict: 'E',
		template: [
			'<div class="ob-dialog" style="display: none;">',
			'	<a href="#" style="position: absolute; left: -10000px">.</a>',
			'	<form method="post"></form>',
			'</div>'].join(''),
		replace: true,
		transclude: true,
		link: function($scope, $el, iAttrs, controller) {
			var $form = $el.find('form');
			$scope.readOnly = {};

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
						'	 ng-readonly="readOnly[\'' + propName + '\']"',
						'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
						'</td>']);
				}
				return html.join('');
			}

			function enableFormValidator($form) {
				var cura_validation_options = $scope.config.validationOptions;

				for (var i in cura_validation_options.rules) {
					var rules = cura_validation_options.rules[i];
					for (var j in rules) {
						if (j == 'pattern') {
							rules[j] = new RegExp(rules[j].substr(1, rules[j].length - 2));
						}
					}
				}

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

				cura_validation_options.ignore = ''; // override default :hidden
				$form.validate(cura_validation_options);
			}

			$scope.openAddDialog = function() {
				var now = new Date;
				now.hour = now.getHours();
				now.minute = now.getMinutes();
				var dt = jQuery.datepicker.formatDate('mm/dd/yy', now);
				var tm = jQuery.datepicker.formatTime('hh:mm TT', now);
				var $ob = {};
				$scope.fields.forEach(function(field) {
					$ob[field[0]] = '';
				});
				$ob.id = 0;
				$ob.datetime = dt + ' ' + tm;
				$scope.observation = $ob;
				openDialog('Add Observation', $ob);
				$form.validate().resetForm();
			}

			$scope.openEditDialog = function(obj) {
				$scope.observation = obj;
				openDialog('Edit Observation', obj);

				var validator = $form.validate();
				validator.prepareForm();
				validator.hideErrors();
				validator.elements().removeClass(validator.settings.errorClass);

				$timeout(function() {
					validator.form();
				}, 10);
			};

			function openDialog(title, ob) {
				var buttons = [];
				var config = $scope.config;
				var invalidTimes = 0;
				var $msg = jQuery('.ui-dialog .msg');
				$msg.hide();

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
							} else {
								invalidTimes++;
								if (invalidTimes > 1) {
									if (confirm('Save invalid data anyway?')) {
										Observation.save(ob, saveSuccess, saveError);
									} else {
										invalidTimes = 0;
										$msg.hide();
									}
								} else {
									$msg = jQuery('.ui-dialog .msg');
									if ($msg.length == 0) {
										var msg = '<span class="msg">Click again to save invalid inputs</span>';
										jQuery('.ui-dialog-buttonpane').prepend(msg);
									} else {
										$msg.show();
									}
								}
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

			/**
			 * Button to export data as CSV
			 */
			$scope.exportAsCSV = function($event) {
				var validator = $form.validate();
				var array = [];
				array.push($scope.fields.map(function(field) {
					return field[2]; // field description
				}));
				$scope.observation = {};
				$scope.observations.forEach(function(ob) {
					$scope.fields.forEach(function(field) {
						$form.find('input[name="' + field[0] + '"]').val(ob[field[0]]);
					})
					array.push($scope.fields.map(function(field) {
						var name = field[0];
						var value = ob[name];
						var element = $form.find('input[name="' + name + '"]')[0];
						var isValid = validator.check( element );
						if (isValid === false) {
							validator.check( element )
						}
						return isValid !== false ? value : '**' + value; // field name
					}));
				});
				var csv = CSV.arrayToCsv(array);

				var w = window.open();
				w.document.write([
					'<a download="' + $scope.exportName + '"',
					' href="data:application/download,' + encodeURIComponent(csv) + '"></a>',
					'<script>document.getElementsByTagName("a")[0].click()</script>'].join(''));
				setTimeout(function() {
					w.close();
					w = null;
				}, 1000);
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
		var _items = [];

		$scope.$on('clearTypeaheads', function() {
			_items = [];
		});

		$el.typeahead({
			source: function(query, callback) {
				if (_items.length) {
					return _items;
				}
				curaConfig.locations(function(res) {
					for (var i = 0, row; row = res[i++];) {
						_items.push(row.watershed_name);
					}
					callback(_items);
					return;
				});
			},
			updater: function(watershed) {
				var $ob = $scope.observation;
				var $readOnly = $scope.readOnly;
				$ob.watershed_name = watershed;

				var array = ['station_name', 'location_id', 'latitude', 'longitude'];
				var $form = $el.closest('form');
				for (var i = 0, name; name = array[i++];) {
					$ob[name] = '';
					$readOnly[name] = false;
					var el = $form.find("input[name=" + name + "]");
					el.removeClass('error');
					$form.validate().errorsFor(el[0]).hide();
				}

				$scope.$apply();
				return watershed;
			}
		});
	}
}])


	.directive('typeaheadStationName', ['$parse', 'curaConfig', function($parse, curaConfig) {
	return function($scope, $el, $attrs) {
		var _items = {}, _rows = {};

		$scope.$on('clearTypeaheads', function() {
			_items = {};
			_rows = {};
		});

		$el.typeahead({
			source: function(query, callback) {
				var $form = $el.closest('form');
				var $ob = $scope.observation;
				var watershed = $ob.watershed_name || '';
				if (watershed.length == 0) {
					return;
				}
				if (_items[watershed]) {
					return _items[watershed];
				}
				
				curaConfig.typeaheads_station_name({
					watershed: watershed,
				}, function(res) {
					var items = [], rows = {};
					for (var i = 0, row; row = res[i++];) {
						if (!rows[row.station_name]) {
							rows[row.station_name] = [];
							items.push(row.station_name);
						}
						rows[row.station_name].push(row);
					}
					_items[watershed] = items;
					_rows[watershed] = rows;
					callback(items);
				});
			},
			updater: function(station) {
				var $ob = $scope.observation;
				var $readOnly = $scope.readOnly;
				$ob.station_name = station;

				var watershed = $ob.watershed_name;
				if (watershed.length == 0 || station.length == 0) {
					return station;
				}

				if (_rows[watershed][station].length == 1) {
					var $form = $el.closest('form');
					var validator = $form.validate();
					var row = _rows[watershed][station][0];
					$ob.location_id = row.location_id;
					$ob.latitude = row.latitude;
					$ob.longitude = row.longitude;
					$scope.$apply();

					$readOnly.latitude = row.latitude !== null
						&& validator.check($form.find('input[name=latitude]')[0]);
					$readOnly.longitude = row.longitude !== null
						&& validator.check($form.find('input[name=longitude]')[0]);

					validator.showErrors();
				} else {
					$ob.location_id = $ob.latitude = $ob.longitude = '';
					$readOnly.latitude = $readOnly.longitude = false;
				}

				$scope.$apply();
				return station;
			}
		});
	}
}])


	.directive('typeaheadLocationId', ['$parse', 'curaConfig', function($parse, curaConfig) {
	return function($scope, $el, $attrs) {
		var _items = {}, _rows = {};

		$scope.$on('clearTypeaheads', function() {
			_items = {};
			_rows = {};
		});

		$el.typeahead({
			source: function(query, callback) {
				var $ob = $scope.observation;

				var watershed = $ob.watershed_name || '';
				if (watershed.length == 0) {
					return;
				}

				var station = $ob.station_name || '';
				var _key = station ? 's-' + station : 'all';
				if (_items[watershed] && _items[watershed][_key]) {
					return _items[watershed][_key];
				}

				curaConfig.typeaheads_location_id({
					watershed: watershed,
					station: station,
				}, function(res) {
					var items = [], rows = [];
					for (var i = 0, row; row = res[i++];) {
						items.push(row.location_id);
						rows.push(row);
					}
					_items[watershed] = _items[watershed] || {};
					_items[watershed][_key] = items;
					_rows[watershed] = _rows[watershed] || {};
					_rows[watershed][_key] = rows;
					callback(items);
				});
			},
			updater: function(location_id) {
				var $ob = $scope.observation;
				var $readOnly = $scope.readOnly;
				$ob.location_id = location_id;

				var watershed = $ob.watershed_name;
				if (watershed.length == 0 || location_id.length == 0) {
					return location_id;
				}

				$ob.latitude = $ob.longitude = '';
				$readOnly.latitude = $readOnly.longitude = false;

				var station = $ob.station_name;
				var _key = station ? 's-' + station : 'all';
				var $form = $el.closest('form');
				var el, validator = $form.validate();
				for (var i = 0, row; row = _rows[watershed][_key][i++];) {
					if (row.location_id == location_id) {
						$ob.station_name = row.station_name;
						$ob.latitude = row.latitude;
						$ob.longitude = row.longitude;
						$scope.$apply();

						$readOnly.latitude = row.latitude !== null
							&& validator.check($form.find('input[name=latitude]')[0]);
						$readOnly.longitude = row.longitude !== null
							&& validator.check($form.find('input[name=longitude]')[0]);
						$scope.$apply();

						validator.showErrors();
						break;
					}
				}

				return location_id;
			}
		});
	}
}])


	.directive('curaButton', ['$timeout', function($timeout) {
	return {
		restrict: 'E',
		template: [
		'<button class="cura-button ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">',
		'	<span class="ui-button-text"></span>',
		'</button>'].join(''),
		replace: true,
		transclude: true,
		link: function($scope, $el, $attrs, $controller) {
			$el.find('span').html($attrs.text);
		}
	};
}])