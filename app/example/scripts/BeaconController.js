angular
.module('example')
.controller('BeaconController', function($scope, supersonic) {
	supersonic.logger.info('Creating BeaconController object');
	$scope.navbarTitle = "Beacon settings";

	$scope.configureButtonText = 'Configure!';

	$scope.configureIcon = 'super-gear-b';

	$scope.beacon = {};

	var ble = new BLEHandler();

	$scope.uuidStr = function(newUuid) {

		if (arguments.length) {

			newUuid = newUuid.replace('\n', '');

			if (newUuid.indexOf('-') == -1) {
			 	var separatorList = [8, 13, 18, 23];
			 	for (var i = 0; i < separatorList.length; ++i) {

			 		if (separatorList[i] > newUuid.length) break;

			 		newUuid = newUuid.insert(separatorList[i], '-');
			 	}
			}

			if (newUuid.length != 36) {
				// TODO set invalid
			} else {
				// TODO set valid
			}

			$scope.beacon.uuid = newUuid;

		}

		return $scope.beacon.uuid;
	}

	supersonic.ui.views.current.whenVisible( function(){
		$scope.beacon = JSON.parse(steroids.view.params.id);
	});

	$scope.processing = false;
	
	$scope.setProcessing = function(val) {
		$scope.$apply(function() {
			$scope.processing = val;
		});
	}

	$scope.configureBeacon = function() {
		if ($scope.processing) return;

		errorCB = function() {
			console.log("failed to configure beacon");
			ble.disconnectDevice($scope.beacon.address);
			$scope.setProcessing(false);
		}

		configure = function() {
			$scope.setProcessing(true);
			ble.connectDevice($scope.beacon.address, 20, function(success) {
				if (success) {
					ble.discoverServices($scope.beacon.address, function() {}, errorCB, function() {
						ble.setName($scope.beacon.address, $scope.beacon.name, function() {
							ble.setMajor($scope.beacon.address, $scope.beacon.major, function() {
								ble.setMinor($scope.beacon.address, $scope.beacon.minor, function() {
									ble.setUuid($scope.beacon.address, $scope.beacon.uuid, function() {
										ble.setRssi($scope.beacon.address, $scope.beacon.rssi, function() {
											console.log("success");
											ble.disconnectDevice($scope.beacon.address);
											$scope.setProcessing(false);
										}, errorCB);
									}, errorCB);
								}, errorCB);
							}, errorCB);
						}, errorCB);
					});
				} else {
					errorCB();
				}
			})
		}

		ble.init(function(enabled) {
			bleInitialized = true;
			configure();
		});
	};
});
