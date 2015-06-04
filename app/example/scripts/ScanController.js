angular
.module('example')
.controller('ScanController', function($scope, supersonic) {
	supersonic.logger.info('Creating ScanController object');
	$scope.navbarTitle = 'Scan DoBeacons';
	$scope.scanButtonText = 'Scan';
	$scope.scanIcon = 'super-refresh';

	$scope.introText = 'Scan for devices. This will ask to enable your bluetooth radio if not yet enabled.';

	$scope.scanning = false;

	// do not use array if necessary
	// https://jsperf.com/object-hasownproperty-vs-array-indexof/2
	// $scope.beacons = [];
	$scope.beacons = {};

	var ble;

//	ble = new BLEHandler();
//	setTimeout(function() {
//	ble.init(function(enabled) {  });
//	}, 1000);

	$scope.startScanDevices = function() {
		console.log("Try to load BLE functionality");
		ble = new BLEHandler();
		ble.init(function(enabled) {});
//		ble.init(function(enabled) {
//		setTimeout(function() {
//		$scope.$apply(function() {$scope.scanning = true;});
		$scope.scanning = true;
		console.log("Start scanning for devices");
		callback = function(device) {
			if (device.isIBeacon) {
				var address = device.address;
				console.log("BLE device with address " + address + " is visible");
				console.log(JSON.stringify(device));
				if ($scope.deviceExist($scope.beacons, device)) {
					console.log("Device is already added");
				} else {
					console.log("Add device to list");
					$scope.$apply(function() {
						// add id to uniquely identify beacon
						device.id = device.address;
						// add to list
						$scope.beacons[device.id] = device;
						// even though explicitly applied, this is not updated immediately!
					});
				}
			}
		};
		ble.startEndlessScan(callback, function errorCB() {
			console.log("failed to start endless scan");
			$scope.$apply(function() {$scope.scanning = false;});
		});
//		}, 0);
//		});
	}

	$scope.deviceExist = function(devices, device) {
		for (var i = 0; i < devices.length; i++) {
			if (devices[i].address === device.address) return true;
		}
		return false;
	}

	$scope.stopScanDevices = function() {
		$scope.scanning = false;
		ble.stopEndlessScan();
	}

	$scope.toggleScanning = function() {
		console.log("scanning: " + $scope.scanning);
		if (!$scope.scanning) {
			$scope.startScanDevices();
		} else {
			$scope.stopScanDevices();
		}
	}

});

