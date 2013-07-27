'use strict';

angular.module('directives', [])


.directive('ngHtml', function() {
	return function($scope, $el, $attrs) {
		$scope.$watch($attrs.ngHtml, function(value) {
			value && $el.html(value);
		});
	}
})


.directive('sticky', ['$window',
	function($window) {
		return {
			restrict: 'C',
			link: function($scope, $el, $attr) {
				var $ghost = angular.element('<div class="ghost"></div>').insertAfter($el);
				var $detector = angular.element('<div></div>').insertAfter($ghost);

				$ghost.css('height', $el.height() + 10 + 'px') // 10 is for btn-toolbar's margin-top: 10px
				angular.element($window).bind('resize', setPosition)
				$scope.$on('tablesorterEnd', setPosition)

				function setPosition() {
					var topOffset = 0
					$attr.topOffset && angular.element($attr.topOffset).each(function(i, el) {
						topOffset += angular.element(el).height()
					})

					$el.affix({
						offset: {
							top: $el.offset().top - 10 - topOffset,
						}
					})

					$el.css({
						width: $detector.width() + 'px',
						left: $detector.offset().left + 'px',
						top: topOffset + 'px',
					})
				}
				setPosition();
			}
		}
	}
])


.directive('map', [
	function() {
		return {
			restrict: 'E',
			template: '<div id="map"></div>',
			replace: true,
			link: function($scope, $el, $attrs) {
				var height = parseInt($attrs.height) || 300;
				$el.css('height', height + 'px');

				console.log('initializing map');
				var map = L.map('map', {
					maxZoom: 14,
					zoomControl: true
				});

				console.log('adding basemap layer.');
				map.addLayer(new L.TileLayer($attrs.basemap));
				if ($attrs.lat && $attrs.lng && $attrs.zoom) {
					map.setView([$attrs.lat, $attrs.lng], $attrs.zoom);
				}

				$scope.$on('layerReady', function(event, layer) {
					layer && map.addLayer(layer);
				});
			}
		};
	}
])


.directive('datepicker', ['$parse',
	function($parse) {
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
				},
				onClose: function(dateText) {
					if (dateText) {
						$parse(attrs.ngModel).assign($scope, dateText);
						$scope.$apply();
					}
				},
			});
		}
	}
])


.directive('fieldManager', [
	function() {
		return {
			restrict: 'E',
			template: [
				'<ol class="field-manager">',
				'	<li ng-repeat="field in fields" ng-click="field[4]=!field[4]">',
				'		{{field[2]}}',
				'		<input type="checkbox" value="{{field[0]}}"',
				'		 ng-checked="field[4]" ng-model="field[4]"',
				'		 ng-click="$event.stopPropagation()" />',
				'	</li>',
				'</ol>'
			].join(''),
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
	}
])


.directive('tablesorter', ['$parse', '$cookieStore', 'Observation',
	function($parse, $cookieStore, Observation) {
		return {
			restrict: 'E',
			template: [
				'<table class="tablesorter table table-hover">',
				'	<thead>',
				'		<tr>',
				'			<th ng-repeat="field in visibleFields" ng-html="break2row(field[2])" ng-class="field[0]"></th>',
				'			<th>Action</th>',
				'			<th></th>',
				'		</tr>',
				'	</thead>',
				'	<tr tablesorter-row ng-class="highlightClass(obj)"',
				'	 ng-repeat="obj in observations"',
				'	 ng-click="selectRow(obj, $event)">',
				'		<td tablesorter-col ng-repeat="field in visibleFields">{{obj[field[0]]}}</td>',
				'		<td><button class="btn btn-mini" ng-click="openEditDialog(obj, $event)">Details</button></td>',
				'		<td><i class="icon-picture" ng-show="obj.photos.length"></i></td>',
				'	</tr>',
				'</table>'
			].join(''),
			replace: true,
			link: function($scope, $el) {
				var highlightedRows = {};
				var selectedRows = {};
				var focusedRow = null;
				$scope.break2row = function(field) {
					return field.replace(/ \(/, '<br />(');
				}
				$scope.selectRow = function(obj, $event) {
					console.log('------Row clicked------', obj);
					if (!$event || !$event.metaKey && !$event.ctrlKey) {
						selectedRows = {};
						highlightedRows = {};
					}
					focusedRow = selectedRows[obj.id] = highlightedRows[obj.id] = obj;
					$scope.$emit('observationHighlighted', highlightedRows);
					$scope.$emit('observationFocused', obj);
				}
				$scope.highlightClass = function(obj) {
					if (focusedRow && focusedRow.id == obj.id) {
						highlightedRows[obj.id] = obj
						return 'highlighted';
					} else if (selectedRows[obj.id]) {
						highlightedRows[obj.id] = obj
						return 'selected';
					} else {
						return '';
					}
				}
				$scope.$on('filterOptionsChanged', function(event, value) {
					console.log('tablesorter$on: filterOptionsChanged');
					// use callback way to avoid table rows become 'empty' temporarily
					Observation.query(value, function(res) {
						$scope.observations = res;
					});
				})
				$scope.$watch('sortList', function(value) {
					if (value) {
						$el.trigger('sorton', [value]);
						$cookieStore.put('sortList', value);
					}
				}, true)
				$scope.$on('filterReseted', function() {
					focusedRow = null;
					selectedRows = {};
					highlightedRows = {};
					$scope.sortList = [];
				})
				$scope.$on('observationAdded', function(event, ob) {
					console.log('tablesorter$on: observationAdded')
					selectedRows = {};
					focusedRow = selectedRows[ob.id] = ob;
				})
				$scope.$on('observationUpdated', function(event, ob) {
					console.log('tablesorter$on: observationUpdated')
					selectedRows = {};
					focusedRow = selectedRows[ob.id] = ob;
				})
				$scope.$on('tablesorterEnd', function() {
					if ($el[0].config) {
						$el.trigger('update');
						// since jquery.tablesorter bind 'update' using setTimeout(..., 1)
						// here we need at least 1 for Firefox to work
						setTimeout(function() {
							$el.trigger('sorton', [$scope.sortList]);
						}, 1);
						return;
					}
					var headers = {};
					// the Action column don't need sortable
					var cols = $el.find('thead tr th').length;
					headers[cols - 1] = headers[cols - 2] = {
						sorter: false
					};

					$el.tablesorter({
						headers: headers,
						sortList: $scope.sortList || [],
						widgets: ['zebra'],
					}).bind('sortEnd', function() {
						$scope.sortList = this.config.sortList;
					});

					$scope.$broadcast('tablesorterInitialized', $el);
				});
			}
		}
	}
])


.directive('tablesorterRow', [
	function() {
		return function($scope) {
			//console.log("row: " + scope.$index);
		}
	}
])


.directive('tablesorterCol', ['$timeout',
	function($timeout) {
		return function($scope) {
			//console.log("r" + scope.$parent.$index + ", c" + scope.$index)
			if ($scope.$parent.$last && $scope.$last) {
				$timeout(function() {
					// have to use timeout in order for the last row really rendered
					$scope.$emit('tablesorterEnd');
				}, 0);
			}
		}
	}
])


.directive('tablesorterPager', ['$cookieStore', '$compile', 'cura',

	function($cookieStore, $compile, cura) {
		return {
			restrict: 'C',
			scope: {
				group: '@',
			},
			link: function($scope, $el, $attrs) {
				var url = cura.pluginUrl + '../vendor/jquery.tablesorter/addons/pager/icons/';
				$el.append($compile([
					'<form>',
					'	<img class="first" ng-hide="page<1" src="' + url + 'first.png" />',
					'	<img class="disabled" ng-show="page<1" src="' + url + 'first-disabled.png" />',
					'	<img class="prev" ng-hide="page<1" src="' + url + 'prev.png" />',
					'	<img class="disabled" ng-show="page<1" src="' + url + 'prev-disabled.png" />',
					'	<input type="text" class="span1 pagedisplay" ng-model="currentPage" />',
					'	<img class="next" ng-hide="page>=total-1" src="' + url + 'next.png" />',
					'	<img class="disabled" ng-show="page>=total-1" src="' + url + 'next-disabled.png" />',
					'	<img class="last" ng-hide="page>=total-1" src="' + url + 'last.png" />',
					'	<img class="disabled" ng-show="page>=total-1" src="' + url + 'last-disabled.png" />',
					'	<select class="span1 pagesize">',
					'		<option value="100" selected="selected">100</option>',
					'		<option value="10">10</option>',
					'	</select>',
					'</form>'
				].join(''))($scope));

				var pagesize = parseInt($cookieStore.get('pagesize'));
				if (!isNaN(pagesize)) {
					$el.find('.pagesize').val(pagesize);
				} else {
					pagesize = $el.find('.pagesize').val();
				}

				$scope.$watch('pagesize', function(value) {
					value && $cookieStore.put('pagesize', value)
				});

				$scope.$on('tablesorterInitialized', function(event, $tb) {
					$scope.$watch('currentPage', function(value) {
						var m = value && value.match(/(\d+)\/\d+/);
						if (m) {
							var table = $tb[0],
								config = table.config;
							config.page = Math.max(0, m[1] - 1);
							setTimeout(function() {
								config.appender(table, config.rowsCopy);
							}, 0);
						}
					})

					$tb.tablesorterPager({
						container: $el,
						positionFixed: false,
						size: pagesize,
					}).bind('applyWidgets sortEnd', function() {
						var c = this.config;
						$scope.page = c.page;
						$scope.total = c.totalPages;
						$scope.pagesize = c.size;
						$scope.$apply();
					});
				});
			}
		}
	}
])


.directive('jqueryFileUpload', ['$compile', '$cookieStore', 'Photo',
	function($compile, $cookieStore, Photo) {
		return {
			restrict: 'E',
			scope: {
				canedit: '@',
				ob: '=',
			},
			template: '<div></div>',
			replace: true,
			link: function($scope, $el, $attrs) {
				var html = [
					'<div>',
					'	<input ng-show="canedit" class="field" type="file" multiple>',
					'	<table>',
					'		<tr ng-repeat="photo in ob.photos">',
					'			<td><a target="_blank" href="{{photo.url}}"><img ng-src="{{photo.thumbnail_url}}" /></a></td>',
					'			<td>{{photo.name}}</td>',
					'			<td><i class="close icon-remove"',
					'			 ng-show="canedit"',
					'			 ng-click="removePhoto(photo)"></i>',
					'			</td>',
					'		</tr>',
					'	</table>',
					'	<div id="progress" style="height: 3px;">',
					'		<div class="bar" style="background-color:green;height:100%;width:0%"></div>',
					'	</div>',
					'</div>',
				]

				$cookieStore.get('guest') || $cookieStore.put('guest', Date.now())

				$scope.$watch('canedit', function(value) {
					if (value == 'true' || value == 'false') {
						$el.html('').append($compile(html.join(''))($scope));

						$el.find('input').fileupload({
							dataType: 'json',
							maxChunkSize: 1024 * 1024,
							add: function(e, data) {
								$el.find('.bar').css('width', '0%');
								data.id = $scope.ob.id;
								data.url = '/wp-admin/admin-ajax.php?action=cura_photo.action' + '&id=' + data.id + '&guest=' + $cookieStore.get('guest')
								jQuery.blueimp.fileupload.prototype.options.add.call(this, e, data);
							},
							done: function(e, data) {
								$scope.ob.photos.push(new Photo(data.result[0]));
								$scope.$apply();
								$el.find('.bar').css('width', '0%');
							},
							progressall: function(e, data) {
								var progress = parseInt(data.loaded / data.total * 100, 10);
								$el.find('.bar').css('width', progress + '%');
							}
						})
					}
				})

				$scope.removePhoto = function(photo) {
					new Photo(photo).$remove({
						id: photo.id,
						file: photo.name
					}, function() {
						$scope.ob.photos.every(function(value, index) {
							return value != photo ? true : $scope.ob.photos.splice(index, 1) && false;
						})
					})
				}
			}
		}
	}
])


.directive('dialog', ['$compile', '$parse', '$timeout', 'Observation', 'curaConfig', 'Toast', 'Photo',

	function($compile, $parse, $timeout, Observation, curaConfig, Toast, Photo) {
		return {
			restrict: 'E',
			template: [
				'<div class="cura-dlg hide">',
				'	<a href="#" style="position: absolute; left: -10000px">.</a>',
				'	<form method="post"></form>',
				'</div>'
			].join(''),
			replace: true,
			transclude: true,
			link: function($scope, $el, iAttrs, controller) {
				var $form = $el.find('form');
				$scope.readOnly = {};

				var canEdit, canAdd, canDelete;
				var updatingOb;

				$scope.$watch('config', function(value) {
					if (value) {
						canEdit = value.canEdit;
						canAdd = value.canAdd;
						canDelete = value.canDelete;
					}
				});

				var lastTr, fields = {}, layout = [
						['watershed_name', 'datetime'],
						['station_name', 'location_id'],
						['latitude', 'longitude'],
						['do_mgl', 'do_%'],
						['cond', 'salinity'],
						['temp', 'air_temp'],
						['secchi_a', 'secchi_b'],
						['secchi_d', 'ph'],
						['lab_sample', 'lab_id'],
						['nitrate', 'phosphate'],
						['coliform'],
						['note'],
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
						html.push([
							'<td>Photo</td>',
							'<td colspan="3">',
							'	<jquery-file-upload canedit="{{canedit}}" ob="editingOb"></jquery-file-upload>',
							'</td>'
						].join(''));
						html.push('</table>');

						$form.html('').append($compile(html.join(''))($scope));
						enableFormValidator($form);
					}
				});

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
							'<td>' + propDesc + '</td>',
							'<td ' + colspan + '>',
							'	<input class="field" type="text" name="' + propName + '"',
							'	 placeHolder="' + placeHolder + '" style="width: 100%"',
							'	 ng-model="editingOb.lab_id"',
							'	 ng-disabled="editingOb.lab_sample==\'N\'" />',
							'</td>'
						]);
					} else if (propName == 'lab_sample') {
						html = html.concat([
							'<td>' + propDesc + '</td>',
							'<td>',
							'	<label class="radio inline"><input type="radio" name="' + propName + '"',
							'	 ng-model="editingOb.lab_sample"',
							'	 value="Y" /> Yes</label> &nbsp; ',
							'	<label class="radio inline"><input type="radio" name="' + propName + '"',
							'	 ng-model="editingOb.lab_sample"',
							'	 ng-click="editingOb.lab_id=\'\'" value="N" /> No</label>',
							'</td>'
						]);
					} else if (propName == 'coliform') {
						html = html.concat([
							'<td>' + propDesc + '</td>',
							'<td colspan="3">',
							'	<label class="radio inline"><input type="radio" name="' + propName + '"',
							'	 ng-model="editingOb.coliform"',
							'	 value="Present" /> Present</label> &nbsp; ',
							'	<label class="radio inline"><input type="radio" name="' + propName + '"',
							'	 ng-model="editingOb.coliform"',
							'	 value="Absent" /> Absent</label>',
							'</td>'
						]);
					} else if (propName == 'datetime') {
						html = html.concat([
							'<td>' + propDesc + '</td>',
							'<td ' + colspan + '>',
							'	<input datepicker class="field" type="text" name="' + propName + '"',
							'	 ng-model="editingOb.datetime"',
							'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
							'</td>'
						]);
					} else if (propName == 'note') {
						html = html.concat([
							'<td>' + propDesc + '</td>',
							'<td ' + colspan + '>',
							'	<textarea class="field" type="text" name="' + propName + '"',
							'	 ng-model="editingOb[\'' + propName + '\']"',
							'	 ng-readonly="readOnly[\'' + propName + '\']"',
							'	 placeHolder="' + placeHolder + '" style="width: 100%"></textarea>',
							'</td>'
						]);
					} else {
						var directive = '';
						if (propName == 'watershed_name' || propName == 'station_name' || propName == 'location_id') {
							directive = 'typeahead-' + propName;
						}
						html = html.concat([
							'<td>' + propDesc + '</td>',
							'<td ' + colspan + '>',
							'	<input ' + directive + ' class="field" type="text" name="' + propName + '"',
							'	 ng-model="editingOb[\'' + propName + '\']"',
							'	 ng-readonly="readOnly[\'' + propName + '\']"',
							'	 placeHolder="' + placeHolder + '" style="width: 100%" />',
							'</td>'
						]);
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
					updatingOb = null;
					$scope.editingOb = {
						id: 0,
						datetime: dt + ' ' + tm,
						photos: Photo.query(),
					}
					openDialog('Add Observation', $scope.editingOb);
					$form.validate().resetForm();
				}

				$scope.openEditDialog = function(obj, $event) {
					updatingOb = obj;
					$scope.editingOb = angular.extend({}, obj);
					openDialog('Edit Observation', $scope.editingOb);

					var validator = $form.validate();
					validator.prepareForm();
					validator.hideErrors();
					validator.elements().removeClass(validator.settings.errorClass);

					$timeout(function() {
						validator.form();
					}, 10);

					$event.stopPropagation();
				};

				function openDialog(title, ob) {
					var buttons = [];

					for (var key in $scope.readOnly) {
						$scope.readOnly[key] = false;
					}
					$scope.canedit = canEdit || (canAdd && (!ob.photos || !ob.photos.length));

					if (canDelete) {
						buttons.push({
							text: "Delete",
							style: "padding: 0 2em; font-size: 12px;" + (ob.id ? '' : 'display:none'),
							click: function() {
								Observation.delete(ob, delSuccess, saveError);
							}
						});
					}
					if (canEdit || (canAdd && !ob.id)) {
						buttons.push({
							text: "Save",
							style: "padding: 0 2em; font-size: 12px",
							click: function() {
								if ($form.validate().form()) {
									// Here we use Class.save instead of Instance.$save
									// because the returned Resource is not at root node
									Observation.save(ob, saveSuccess, saveError);
								} else {
									var msg = 'One or more observations are outside of the expected data range, do you wish to save the invalid data?';
									if (confirm(msg)) {
										Observation.save(ob, saveSuccess, saveError);
									}
								}
							}
						});
					}
					if (ob.id && (canEdit || canAdd)) {
						buttons.push({
							text: "Save As New",
							style: "padding: 0 2em; font-size: 12px",
							click: function() {
								ob.id = 0;
								if ($form.validate().form()) {
									// Here we use Class.save instead of Instance.$save
									// because the returned Resource is not at root node
									Observation.save(ob, saveSuccess, saveError);
								} else {
									var msg = 'One or more observations are outside of the expected data range, do you wish to save the invalid data?';
									if (confirm(msg)) {
										Observation.save(ob, saveSuccess, saveError);
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
						modal: true,
						title: title || '',
						width: 650,
						height: 470,
						zIndex: 99999,
						buttons: buttons,
						close: function(event, ui) {
							$scope.editingOb = null;
						}
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
							Toast.show('Entry ' + resp.insertId + ' added');
							$scope.editingOb.id = resp.insertId;
							$scope.$broadcast('observationAdded', $scope.editingOb);
						} else {
							Toast.show('Entry ' + resp.id + ' updated');
							$scope.$broadcast('observationUpdated', $scope.editingOb, updatingOb);
							angular.extend(updatingOb, $scope.editingOb);
						}
					} else {
						Toast.show('No changes updated')
					}
					$el.dialog('close');
				}

				function delSuccess(resp) {
					if (resp.affectedRows) {
						Toast.show('Entry ' + resp.id + ' deleted');
						$scope.$broadcast('observationDeleted', $scope.editingOb);
						$el.dialog('close');
					} else {
						Toast.show('Data Entry ' + resp.id + ' does not exist');
					}
				}

				function saveError() {
					Toast.show('Sorry, the server encountered an error');
				}
			}
		}
	}
])


.directive('export', ['$timeout', 'Export', 'Toast',

	function($timeout, Export, Toast) {
		return {
			restrict: 'E',
			scope: {
				filterOptions: '@',
			},
			template: [
				'<div>',
				'	<form ng-show="dlOptions.dlname != \'\'" method="post"',
				'	 action="/wp-admin/admin-ajax.php?action=cura_download.action">',
				'		<input type="hidden" name="dlname" value="{{dlOptions.dlname}}" />',
				'		<input type="hidden" name="ziphash" value="{{ziphash}}" />',
				'		<p class="lead">{{dlOptions.dlname}}.zip</p>',
				'		<dl class="dl-horizontal">',
				'			<dt><label class="checkbox">',
				'				<input type="checkbox" ng-model="dlOptions.entries" ng-checked="dlOptions.entries" />Observation entries',
				'			</label></dt>',
				'			<dd style="padding-bottom: 5px">{{csv_entries}} ({{csv_size_kb}})</dd>',
				'			<dt><label class="checkbox">',
				'				<input type="checkbox" ng-model="dlOptions.photos" ng-checked="dlOptions.photos" />Observation photos',
				'			</label></dt>',
				'			<dd style="padding-bottom: 5px">{{photos_number}} ({{photos_size_mb}})</dd>',
				'		</dl>',
				'		<div class="progress" ng-show="lastsize != null"><div class="bar"></div></div>',
				'	</form>',
				'</div>'
			].join(''),
			replace: true,
			transclude: true,
			link: function($scope, $el) {
				$scope.percent = 0;
				$scope.lastsize = null;
				var $dlOptions = $scope.dlOptions = {
					entries: true,
					photos: true,
					dlname: '',
				};

				$el.dialog({
					autoOpen: false,
					modal: true,
					title: 'Export As CSV',
					width: 400,
					height: 300,
					zIndex: 99999,
					buttons: [{
						text: "Download",
						click: checkZipOrStart
					}, {
						text: "Close",
						click: function() {
							$el.dialog('close');
						}
					}],
				});
				$el.closest('.ui-dialog').find('button').attr('class', 'btn').css({
					fontSize: '12px',
					minWidth: '100px',
				});

				$scope.$watch(function() {
					return $dlOptions.dlname && ($dlOptions.entries || $dlOptions.photos);
				}, function(value) {
					if (value != undefined) {
						$el.closest('.ui-dialog').find('button:first').attr('disabled', !value);
					}
				});

				// style="width: {{percent}}%" don't work for IE10
				$scope.$watch('percent', function(value) {
					value != undefined && $el.find('.progress .bar').css('width', value + '%');
				});

				/**
				 * Button to export data as CSV
				 */
				$scope.exportAsCSV = function() {
					$scope.percent = 0;
					$scope.lastsize = null;
					$dlOptions.dlname = '';
					$scope.ziphash = '';
					$el.dialog('open');
					$el.closest('.ui-dialog').find('button').blur();

					angular.extend($dlOptions, $scope.filterOptions);
					Export.info($dlOptions, function(res) {
						console.log('export info', res);
						$dlOptions.dlname = res.dlname;
						$scope.csv_entries = res.csv_entries;
						$scope.csv_size = res.csv_size;
						$scope.csv_size_kb = Math.round(res.csv_size / 1024 * 100) / 100 + 'Kb';
						$scope.photos_number = res.photos_number;
						$scope.photos_size = res.photos_size;
						$scope.photos_size_mb = Math.round(res.photos_size / 1024 / 1024 * 100) / 100 + 'Mb';
					});
				}

				function checkZipOrStart() {
					$scope.percent = 0;
					$scope.totalsize = ($dlOptions.photos ? $scope.photos_size : 0) + ($dlOptions.entries ? $scope.csv_size : 0);
					console.log('checkZipAndStart', $scope.csv_size, $scope.photos_size, $scope.totalsize);
					Export.start($dlOptions, function(res) {
						console.log('checkZipAndStart', res);
						res.status == 'error' ? Toast.show(res.error) : ($scope.ziphash = res.ziphash);
					});
					$timeout(checkProgress, 100);
				}

				function checkProgress() {
					Export.progress($dlOptions, function(value) {
						$scope.percent = $scope.lastsize == null ? 0 : Math.round(100 * $scope.lastsize / $scope.totalsize);
						console.log('checkProgress', $scope.lastsize, value.zipsize, $scope.percent);
						if ($scope.lastsize == null || value.zipsize != $scope.lastsize) {
							$scope.lastsize = value.zipsize;
							$timeout(checkProgress, 500);
						} else {
							if ($scope.ziphash) {
								$scope.percent = 100;
								console.log('ziphash ok', $scope.ziphash);
								$timeout(function() {
									$el.find('form').submit();
								}, 500);
							} else {
								Toast.show('Failed to get ziphash');
							}
						}
					});
				}
			}
		}
	}
])


.directive('mobiletip', ['$cookieStore',
	function($cookieStore) {
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
				'</div>'
			].join(''),
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
	}
])


.directive('typeaheadWatershedName', ['$parse', 'curaConfig',
	function($parse, curaConfig) {
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

					curaConfig.typeaheads_watershed_name(function(res) {
						for (var i = 0, row; row = res[i++];) {
							_items.push(row.watershed_name);
						}
						callback(_items);
					});
				},
				updater: function(watershed) {
					var $ob = $scope.editingOb;
					var $readOnly = $scope.readOnly;
					$ob.watershed_name = watershed;

					var array = ['station_name', 'location_id', 'latitude', 'longitude'];
					var $form = $el.closest('form');
					for (var i = 0, name; name = array[i++];) {
						//$ob[name] = '';
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
	}
])


.directive('typeaheadStationName', ['$parse', 'curaConfig',
	function($parse, curaConfig) {
		return function($scope, $el, $attrs) {
			var _items = {}, _rows = {};

			$scope.$on('clearTypeaheads', function() {
				_items = {};
				_rows = {};
			});

			$el.typeahead({
				source: function(query, callback) {
					var $form = $el.closest('form');
					var $ob = $scope.editingOb;
					var watershed = $ob && $ob.watershed_name || '';
					if (_items[watershed]) {
						return _items[watershed];
					}

					curaConfig.typeaheads_station_name({
						watershed: watershed,
					}, function(res) {
						var items = [],
							rows = {};
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
					$parse($attrs.ngModel).assign($scope, station);

					var $ob = $scope.editingOb;
					var $readOnly = $scope.readOnly;
					$ob && ($ob.station_name = station);

					var watershed = $ob && $ob.watershed_name || '';
					if (watershed.length == 0 || station.length == 0) {
						$scope.$apply();
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

						row.latitude !== null && validator.check($form.find('input[name=latitude]')[0]);
						row.longitude !== null && validator.check($form.find('input[name=longitude]')[0]);

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
	}
])


.directive('typeaheadLocationId', ['$parse', 'curaConfig',
	function($parse, curaConfig) {
		return function($scope, $el, $attrs) {
			var _items = {}, _rows = {};

			$scope.$on('clearTypeaheads', function() {
				_items = {};
				_rows = {};
			});

			$el.typeahead({
				source: function(query, callback) {
					var $ob = $scope.editingOb;
					var watershed = $ob.watershed_name || '';

					var station = $ob.station_name || '';
					var _key = station ? 's-' + station : 'all';
					if (_items[watershed] && _items[watershed][_key]) {
						return _items[watershed][_key];
					}

					curaConfig.typeaheads_location_id({
						watershed: watershed,
						station: station,
					}, function(res) {
						var items = [],
							rows = [];
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
					var $ob = $scope.editingOb;
					var $readOnly = $scope.readOnly;
					$ob.location_id = location_id;
					var watershed = $ob.watershed_name || '';

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

							$readOnly.latitude = row.latitude !== null && validator.check($form.find('input[name=latitude]')[0]);
							$readOnly.longitude = row.longitude !== null && validator.check($form.find('input[name=longitude]')[0]);
							$scope.$apply();

							validator.showErrors();
							break;
						}
					}

					return location_id;
				}
			});
		}
	}
])