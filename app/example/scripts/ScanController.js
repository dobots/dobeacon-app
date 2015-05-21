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
    $scope.beacons = [];

    var ble;

    $scope.startScanDevices = function() {
      console.log("Try to load BLE functionality");
      ble = new BLEHandler();
      ble.init(function(enabled) {})
      console.log("Start scanning for devices");
      callback = function(device) {
        var address = device.address;
        console.log("BLE device with address " + address + " is visible");
        if ($scope.beacons.indexOf(address + '') === -1) {
          console.log("Add device to list");
          $scope.beacons.push(address);
          $scope.$apply();
        } else {
          console.log("Device is already added");
        }
      };
      ble.startEndlessScan(callback);
    }

    $scope.stopScanDevices = function() {
      ble.stopEndlessScan();
    }

    $scope.toggleScanning = function() {
      $scope.scanning = !$scope.scanning;
      if ($scope.scanning) {
        $scope.startScanDevices();
        $scope.scanButtonText = 'Scanning';
        //$scope.scanIcon = 'super-refreshing'; // makes entire button rotate
      } else {
	$scope.stopScanDevices();
	$scope.scanButtonText = 'Scan';
        $scope.scanIcon = 'super-refresh';
      }
    }

  });

