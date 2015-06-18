String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

angular
.module('example')
.controller('BeaconController', function($scope, supersonic) {
	supersonic.logger.info('Creating BeaconController object');
	$scope.navbarTitle = "Beacon settings";

	$scope.configureButtonText = 'Configure!';

	$scope.configureIcon = 'super-gear-b';

	$scope.beacon = {};

	var ble = new BleExt();

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
			console.log("$scope.beacon.proximityUuid: " + $scope.beacon.proximityUuid);

		}

		return $scope.beacon.proximityUuid;
	}

	supersonic.ui.views.current.whenVisible( function(){
		$scope.beacon = JSON.parse(steroids.view.params.id);
	});

	supersonic.ui.views.current.whenHidden( function() {
		console.log("whenHidden");
		ble.disconnect();
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
			ble.disconnect();
			$scope.setProcessing(false);
		}

		configure = function() {
			ble.connect(
				$scope.beacon.address,
				function() {
					$scope.setProcessing(true);
					ble.discoverServices(null, function() {
						// dobeacon can't keep up if characteristic is written too fast, so we need
						// to delay a bit before starting to write
						setTimeout(function() {
							ble.writeDeviceName($scope.beacon.name, function() {
								ble.writeBeaconMajor($scope.beacon.major, function() {
									ble.writeBeaconMinor($scope.beacon.minor, function() {
										ble.writeBeaconProximityUuid($scope.beacon.proximityUuid, function() {
											ble.writeBeaconCalibratedRssi($scope.beacon.calibratedRssi, function() {
												console.log("success");
												ble.disconnect();
												$scope.setProcessing(false);
											}, errorCB);
										}, errorCB);
									}, errorCB);
								}, errorCB);
							}, errorCB);
						}, 500);
					}, errorCB);
				},
				errorCB()
			);
		}

		ble.init(function() {
			bleInitialized = true;
			configure();
		});
	};
});
