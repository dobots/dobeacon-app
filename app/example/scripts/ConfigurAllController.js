angular
.module('example')
.controller('ConfigureAllController', function($scope, supersonic) {
	supersonic.logger.info('Creating ConfigureAllController object');

	$scope.beacon = {};

	var ble = new BleExt();
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

			$scope.beacon.proximityUuid = newUuid;

		}

		return $scope.beacon.proximityUuid;
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
					ble.connectAndDiscover(device.address, BleTypes.GENERAL_SERVICE_UUID, CHAR_MESH_UUID,
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

});
