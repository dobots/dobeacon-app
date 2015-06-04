angular
.module('example')
.controller('ConfigureAllController', function($scope, supersonic) {
	supersonic.logger.info('Creating ConfigureAllController object');

	$scope.beacon = {};

	var ble = new BLEHandler();
	var bleInitialized = false;

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

	});

//	$scope.processing = false;

	$scope.configureAll = function() {
//		if ($scope.processing) return;

		configure = function() {
//			$scope.processing = true;

			callback = function(device) {
				if (device.isIBeacon) {
					// check if it has the mesh characteristic
					console.log("found ibeacon: " + device.name)
//					ble.stopEndlessScan();
					ble.connectAndDiscover(device.address, generalServiceUuid, meshCharacteristicUuid,
						function successCB() {
							console.log('success');
							self.disconnectDevice(device.address);
							// found an ibeacon, stop scanning and connect to send mesh message
							// connect and send message
//							$scope.sendIBeaconMeshMessage(device.address);
						},
						function errorCB() {
							console.log('error');
							// nothing to do, continue searching
//							ble.stopEndlessScan();
						});
				}
			}

			// start scanning for an ibeacon to connect to
			ble.startEndlessScan(callback);
		}

//		if (!bleInitialized) {
//			ble.init(function(enabled) {
//				bleInitialized = true;
//				configure();
//			});
//		} else {
		setTimeout(function() {
			configure();
		}, 0);
//		}

	}
	
	$scope.init = function() {
		console.log("init");
		ble.init(function(enabled) {});
		bleInitialized = true;
	}
	
	$scope.stop = function() {
		console.log("stop");

		if (!bleInitialized) {
			ble.init(function(enabled) {
				bleInitialized = true;
				ble.stopEndlessScan();
			});
		} else {
			ble.stopEndlessScan();
		}
		
	}

	$scope.sendIBeaconMeshMessage = function(address) {

		errorCB = function() {
			console.log("failed to configure beacons");
			ble.disconnectDevice(address);
//			$scope.processing = false;
		}

		ble.connectDevice(address, 5, function(success) {
			if (success) {
				ble.sendIBeaconMeshMessage(address, $scope.beacon,
					function successCB() {
						console.log("success");
						ble.disconnectDevice($scope.beacon.address);
					}, errorCB);
			} else {
				errorCB();
			}
		});
	}

	// $scope.configureBeacon = function() {
	// 	if ($scope.processing) return;

	// 	errorCB = function() {
	// 		console.log("failed to configure beacon");
	// 		ble.disconnectDevice($scope.beacon.address);
	// 		$scope.processing = false;
	// 	}

	// 	configure = function() {
	// 		$scope.processing = true;
	// 		ble.connectDevice($scope.beacon.address, 5, function(success) {
	// 			if (success) {
	// 				ble.discoverServices($scope.beacon.address, function() {}, errorCB, function() {
	// 					ble.setName($scope.beacon.address, $scope.beacon.name, function() {
	// 						setTimeout(function() {
	// 							ble.setMajor($scope.beacon.address, $scope.beacon.major, function() {
	// 								setTimeout(function() {
	// 									ble.setMinor($scope.beacon.address, $scope.beacon.minor, function() {
	// 										setTimeout(function() {
	// 											ble.setUuid($scope.beacon.address, $scope.beacon.uuid, function() {
	// 												setTimeout(function() {
	// 													ble.setRssi($scope.beacon.address, $scope.beacon.rssi, function() {
	// 														console.log("success");
	// 														setTimeout(function() {
	// 															ble.disconnectDevice($scope.beacon.address);
	// 															$scope.processing = false;
	// 														}, 500);
	// 													}, errorCB);
	// 												}, 500);
	// 											}, errorCB);
	// 										}, 500);
	// 									}, errorCB);
	// 								}, 500);
	// 							}, errorCB);
	// 						}, 500);
	// 					}, errorCB);
	// 				});
	// 			} else {
	// 				errorCB();
	// 			}
	// 		})
	// 	}

	// 	if (!bleInitialized) {
	// 		ble.init(function(enabled) {
	// 			bleInitialized = true;
	// 			configure();
	// 		});
	// 	} else {
	// 		configure();
	// 	}
	// };
});
