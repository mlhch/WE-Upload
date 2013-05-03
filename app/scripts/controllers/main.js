'use strict';

curaApp.controller('MainCtrl', ['$scope', 'serviceCall', 'layerCall', 'dataCall',
function ($scope, serviceCall, layerCall, dataCall) {
	$scope.serviceList = [];
	$scope.layerInfoList = [];
	$scope.stationListByLayer = null;

	serviceCall.query(function (json) {
		$scope.serviceList = json.servicelist;

		layerCall.query(function (json) {
			$scope.layerInfoList = json.layerlist;

			for (var i = 0, layerInfo; layerInfo = $scope.layerInfoList[i]; i++) {
				dataCall.query({
					request : "getdata",
					serviceid : 1,
					layerid : layerInfo.id,
					time : layerInfo.time,
					bbox : layerInfo.bbox,
				}, (function (i) {
					return function (json) {
						$scope.stationListByLayer = $scope.stationListByLayer || {};
						$scope.stationListByLayer[i] = json.data;
					}
				})(i));
			}
		});
	});
}]);
