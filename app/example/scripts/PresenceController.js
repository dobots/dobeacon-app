angular
.module('example')
.controller('PresenceController', function($scope, $http, supersonic) {

	$scope.loggedIn = false;
	$scope.presenceDetected = false;
	$scope.scanning = false;

	$scope.userName = "DoBots";
	$scope.password = "dobido";
	$scope.location = "Almende";

	var baseURL = "http://dev.ask-cs.com"

	$scope.targetBeacon = "C4:4C:CA:D7:A6:ED";

	$scope.beacon = {};

//	var triggerThreshold = -50;

	$scope.signIn = function() {
		var hash = CryptoJS.MD5($scope.password);
		console.log("hashed password: " + hash);
		var url = baseURL + "/login?uuid=" + $scope.userName + "&pass=" + hash;
		$http.get(url).
			success(function(data, status, headers, config) {
				console.log("onSuccess: " + JSON.stringify(data));
				$http.defaults.headers.common = data;
				setTimeout(function() {
					$scope.$apply(function() {
						$scope.loggedIn = true;
						// $scope.presenceDetected = true;
					});
					$scope.startScanDevices();
				}, 500);
			}).
			error(function(data, status, headers, config) {
				console.log("data: " + data + ", status: " + status);
			});
	}

	$scope.manualPresence = function(present) {
		var url = baseURL + "/mobile/presence/manual?presence=" + present + "&location=" + $scope.location;
		console.log("url: " + url);
		$http.put(url).
			success(function(data, status, headers, config) {
				console.log("onSuccess: " + JSON.stringify(data));
				$scope.presenceDetected = false;
			}).
			error(function(data, status, headers, config) {
				console.log("onError: data: " + data + ", status: " + status);
			});
	}

	supersonic.ui.views.current.whenVisible( function(){
		$scope.loggedIn = false;
		$scope.presenceDetected = false;
		$scope.scanning = false;
	});

	var ble = new BleExt();
	ble.setScanFilter(BleFilter.doBeacon);

	$scope.startScanDevices = function() {
		if ($scope.scanning) return;

		setTimeout(function() {

		ble.init(function() {
			setTimeout(function() {
				console.log("Start scanning for devices");
				successCB = function(device) {
					setTimeout(function() {
//						console.log("found device: " + device.name + ", " + device.address + ", $scope.targetBeacon: " + $scope.targetBeacon);
						$scope.$apply(function() {
							 $scope.scanning = true;
						})
						if (device.address === $scope.targetBeacon) {
							$scope.beacon = device;
//							console.log("device: " + JSON.stringify(device));
							if (device.rssi > device.calibratedRssi) {
								$scope.$apply(function() {
									$scope.presenceDetected = true;
								});
							}
						}
					}, 0);
				};
				ble.startScan(successCB, function errorCB() {
					$scope.$apply(function() {
						$scope.scanning = false;
					})
					console.log("failed to start endless scan");
					// setTimeout(function() { $scope.startScanDevices() }, 1000);
				});
			}, 500);
		}, function erroCB() {
			$scope.$apply(function() {
				$scope.scanning = false;
			})
			console.log("failed to init, retry in 1s ...");
			setTimeout($scope.startScanDevices, 1000);
		});
		},0);
	}

	$scope.stopScanDevices = function() {
		$scope.scanning = false;
		setTimeout(function() {
			$scope.$apply(function() {
				$scope.scanning = false;
			})
			console.log("stop endless scan");
			ble.stopScan();
		}, 0);
	}

});
