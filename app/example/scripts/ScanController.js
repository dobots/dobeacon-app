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

	supersonic.ui.views.current.whenVisible( function() {
		console.log("view visible");
	});


	supersonic.ui.views.current.whenHidden( function() {
		console.log("view hidden");
	});


	ble = new BleExt();

	$scope.startScanDevices = function() {
		// clear old scan list
		$scope.beacons = {};

		// setTimeout(function() {
			ble.init(function() {
				setTimeout(function() {
			//		ble.init(function(enabled) {
			//		setTimeout(function() {
					$scope.$apply(function() {$scope.scanning = true;});
					// $scope.scanning = true;
					console.log("Start scanning for devices");
					successCB = function(device) {
						if (device.isIBeacon) {
							var address = device.address;
							console.log("BLE device with address " + address + " is visible");
							if ($scope.deviceExist($scope.beacons, device)) {
								console.log("Device is already added");
							} else {
								console.log(JSON.stringify(device));
								$scope.$apply(function() {
									console.log("Add device to list");
									// add id to uniquely identify beacon
									device.id = device.address;
									// add to list
									$scope.beacons[device.id] = device;
									// even though explicitly applied, this is not updated immediately!
								});
							}
						}
					};
					ble.startScan(successCB, function errorCB() {
						console.log("failed to start endless scan");
						$scope.$apply(function() {$scope.scanning = false;});
					});
				}, 500);
			}, function erroCB() {
				console.log("failed to init");
			});
		// }, 0);
//		}, 0);
//		});
	}

	$scope.deviceExist = function(devices, device) {
		return devices[device.address] != null;
	}

	$scope.stopScanDevices = function() {
		console.log("stop endless scan");
		$scope.scanning = false;
		ble.stopScan();
	}

	$scope.toggleScanning = function() {
		if (!$scope.scanning) {
			$scope.startScanDevices();
		} else {
			$scope.stopScanDevices();
		}
	}

});

