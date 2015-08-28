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
	$scope.txPower = null;
	$scope.advertisementInterval = -1;

	$scope.dfuAvailable = false;

	var ble = new BleExt();

	var REMOTE_URL = "https://github.com/dobots/bluenet/raw/dfu_upload/release/dobeacon/";
	var LOCAL_URL = "dobeacon/";
	var FULL_LOCAL_URL = "/sdcard/" + LOCAL_URL;

	var REMOTE_VERSION_URL = REMOTE_URL + "version.json";
	var LOCAL_VERSION_URL = LOCAL_URL + "version.json";
	var LOCAL_TEMP_VERSION_URL = LOCAL_URL + "remote_version.json";
	var FULL_LOCAL_TEMP_VERSION_URL = "/sdcard/" + LOCAL_TEMP_VERSION_URL;

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
		setTimeout(function() {
			$scope.getConfiguration(function() {
				$scope.checkDfuAvailable();
			});
		});
	});

	supersonic.ui.views.current.whenHidden( function() {
		console.log("whenHidden");
		ble.disconnect();
	});

	$scope.getConfiguration = function(doneCB) {

		errorCB = function() {
			console.log("failed to read configuration");
			ble.disconnect();
			console.log("retry ...");
			// $scope.getConfiguration();
		}

		ble.init(function() {
			ble.connectAndDiscover($scope.beacon.address,
				null,
				function() {
					ble.readTxPower(
						function(value) {
							$scope.$apply(function() {
								$scope.txPower = value;
							});
							ble.readAdvertisementInterval(
								function(value) {
									$scope.$apply(function() {
										$scope.advertisementInterval = value;
									});
									console.log("read configuration success");
									doneCB();
									ble.disconnect();
								}, errorCB
							);
						}, errorCB
					);
				}, errorCB
			);
		});
	}

	$scope.checkDfuAvailable = function() {
		// ble.connectExecuteAndDisconnect($scope.beacon.address,
		// 	function() {
				var found = false;
				if (ble.hasCharacteristic(BleTypes.CHAR_RESET_UUID)) {
					if (ble.hasCharacteristic(BleTypes.CHAR_HARDWARE_REVISION_UUID)) {
						if (ble.hasCharacteristic(BleTypes.CHAR_FIRMWARE_REVISION_UUID)) {
							console.log("dfu available");
							found = true;
						}
					}
				}
				$scope.$apply(function() {
					$scope.dfuAvailable = found;
				});
				// ble.disconnect();
		// 	},
		// 	function() {
		// 	},
		// 	function() {
		// 		console.log("dfu not available");
		// 		$scope.$apply(function() {
		// 			$scope.dfuAvailable = false;
		// 		});
		// 	}
		// );
	}

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
												ble.writeTxPower($scope.txPower, function() {
													ble.writeAdvertisementInterval($scope.advertisementInterval, function() {
														console.log("success");
														ble.disconnect();
														$scope.setProcessing(false);
													}, errorCB);
												}, errorCB);
											}, errorCB);
										}, errorCB);
									}, errorCB);
								}, errorCB);
							}, errorCB);
						}, 500);
					}, errorCB);
				},
				errorCB
			);
		}

		ble.init(function() {
			bleInitialized = true;
			configure();
		});
	};

	$scope.newFirwmare = null;
	$scope.uploadFirmware = function() {

		if (!$scope.dfuAvailable) {
			navigator.notification.alert("DFU not available for this beacon", null, "Error");
			return;
		}

		console.log("initiate upload firmware sequence ...");

		var retry = true;

		var hardwareRevision = null;
		var firmwareRevision = null;
		var localVersionFile = null;

		// check if device already in DFU
		// if (!isDfuTarget){
			getCrownstoneVersions();
		// } else {
		// 	if (newFirmware != null) {
		// 		console.log("target already in dfu mode, start uploading ...");
		// 		uf_upload();
		// 	} else {
		// 		navigator.notification.activityStart("Please wait" , "Retrieving device version ...");
		// 		resetting = true;
		// 		console.log("target already in dfu mode, but no idea what hardware version." +
		// 			" going to reset to application and try again ...");
		// 		ble.resetToApplication(
		// 			function() {
		// 				connected = false;
		// 				console.log("back at application, starting upload firmware again ...");
		// 				setTimeout(function() {
		// 					ble.connectAndDiscover($scope.beacon.address, null,
		// 						function() {
		// 							console.log("connection ok, restarting upload ...");
		// 							resetting = false;
		// 							isDfuTarget = false;
		// 							navigator.notification.activityStop();
		// 							uploadFirmware();
		// 						},
		// 						function() {
		// 							console.log("connection failed");
		// 						}
		// 					);
		// 				}, 1000);
		// 			},
		// 			function() {
		// 				console.log("failed to reset to application");
		// 				navigator.notification.activityStop();
		// 			});
		// 		return;
		// 	}
		// }

		function readHardwareRevision(successCB, erroCB) {
			ble.connectExecuteAndDisconnect($scope.beacon.address,
				function() {
					ble.readHardwareRevision(successCB, erroCB);
				},
				null, erroCB);
		}

		function readFirmwareRevision(successCB, erroCB) {
			ble.connectExecuteAndDisconnect($scope.beacon.address,
				function() {
					ble.readFirmwareRevision(successCB, erroCB);
				},
				null, erroCB);
		}

		function getCrownstoneVersions() {
			console.log("retrieving device version ...");
			navigator.notification.activityStart("Please wait" , "Retrieving device version ...");
			readHardwareRevision(function(revision) {
					console.log("hardware revision: " + revision);
					hardwareRevision = revision;
					readFirmwareRevision(function(revision) {
							console.log("firmware revision " + revision);
							navigator.notification.activityStop();
							firmwareRevision = revision;
							startUpdateCheck();
						}, function() {
							console.log("failed to get firmware revision");
							navigator.notification.activityStop();
							navigator.notification.alert("Failed to retrieve firmware revision", null , "Error");
						}
					);
				}, function() {
					console.log("failed to get hardware revision");
					navigator.notification.activityStop();
					navigator.notification.alert("Failed to retrieve hardware revision", null , "Error");
				}
			)
		}

		function startUpdateCheck() {
			console.log("checking for update ...");
			navigator.notification.activityStart("Please wait" , "Checking for update ...");
		    checkFileSystem(function(fs) {
				// console.log("filesystem ok");

				getRemoteFile(fs, function(remoteVersionFile) {

					for (i = 0; i < remoteVersionFile.length; i++) {
						var boardVersion = remoteVersionFile[i];
						if (boardVersion.hardware == hardwareRevision) {

							newVersion = boardVersion.version;
							newFirmware = boardVersion.firmware;

							newVersionArr = newVersion.split('.');
							firmwareRevisionArr = firmwareRevision.split('.');

							// console.log("newVersionArr: " + JSON.stringify(newVersionArr));
							// console.log("firmwareRevisionArr: " + JSON.stringify(firmwareRevisionArr));

							var isNew = !(parseInt(firmwareRevisionArr[0]) > parseInt(newVersionArr[0]) ||
									  parseInt(firmwareRevisionArr[1]) > parseInt(newVersionArr[1]) ||
									  parseInt(firmwareRevisionArr[2]) >= parseInt(newVersionArr[2]));

							navigator.notification.activityStop();
							if (!isNew) {
								console.log("no new firmware found!");
								navigator.notification.alert("No new firmware found!", null, "DFU Upload");
							} else {
								console.log("new version " + newVersion + " available");
								navigator.notification.confirm("New version " + newVersion + " available. Do you really want to upload?",
									function(index) {
										if (index == 1) {
											// check if we had downloaded the binary already previously
											checkIfBinDownloaded(fs, hardwareRevision, newVersion, function(found) {
												if (!found) {
													// if not found, download binary first
													console.log("not found, start download");
													uf_downloadBin(newFirmware);
												} else {
													// if already download, proceed directly with reset and upload
													console.log("already downoaded, proceed with reset")
													uf_reset();
												}
											});
										}
									},
									"DFU Upload Confirmation",
									["Yes", "No"]
								);
							}
							break;
						}
					}
					// hardware not found
					// cb(false)
				});
			});
		}

		function saveVersionToFile() {
			console.log("save version to file: " + newVersion);
			getFile(fs, LOCAL_VERSION_URL,
				function(file) {
					console.log("writing to file ...");
					var reader = new FileWriter(file);
					reader.onwrite = function(evt) {
						console.log("save version successful");
					};
					reader.onerror = function(evt) {
						console.log("failed to save version: " + JSON.stringify(evt));
					}

					var found = false;
					// update version in file
					for (i = 0; i < localVersionFile.length; i++) {
						console.log("localVersionFile.hardware: " + localVersionFile.hardware);
						console.log("hardwareRevision: " + hardwareRevision);
						if (localVersionFile[i].hardware == hardwareRevision) {
							console.log("update version")
							localVersionFile[i].version = newVersion;
							found = true;
							break;
						}
					}

					if (!found) {
						console.log("add new");
						localVersionFile.push({
							hardware: hardwareRevision,
							version: newVersion,
							firmware: newFirmware
						});
					}

					console.log("new version file: " + JSON.stringify(localVersionFile));

					// write to file
					reader.write(localVersionFile);

					console.log("version file updated");
				},
				function(obj) {
					console.log("could not get local version: " + JSON.stringify(obj));
				}
			);
		}

		function verifyFirmware(successCB, errorCB) {
			console.log("verifying firmware ...");
			navigator.notification.activityStart("Please wait" , "Verifying Firmware ...");
			readFirmwareRevision(
				function(revision) {
					console.log("firmware revision " + revision);
					console.log("newVersion " + newVersion);
					navigator.notification.activityStop();
					if (revision == newVersion) {
						console.log("... verification OK");
						successCB();
					} else {
						console.log("... verification failed!");
						var msg = "Versions don't match"
						errorCB(msg);
					}
				}, function() {
					var msg = "Failed to get firmware revision"
					console.log(msg);
					errorCB(msg);
				}
			);
		}

		function onDone(success) {
			navigator.notification.activityStop();
			navigator.notification.progressStop();
			if (success) {
				newFirmware = null;
				navigator.notification.alert("Upload was successful!", null , "Success");
			} else {
				navigator.notification.alert("Upload failed, please try again!", null , "Upload Failure");
			}
			// $('#reconnect').prop("disabled", false);
			// $('#upload').prop("disabled", false);
		}

		function uf_connectAndDiscover() {
			console.log("checking DFU target ...");
			navigator.notification.activityStart("Please wait" , "connecting to DFU ...");
			ble.connectAndDiscover(
				$scope.beacon.address,
				null,
				function() {
					console.log("... ok, disconnect again");
					ble.disconnect();
					setTimeout(function() {
						uf_upload();
					}, 5000);
				},
				function(msg) {
					onDone(false);
					console.log("... failed, error: " + msg);
					if (retry) {
						console.log("retry ...");
						retry = false;
						uf_connectAndDiscover();
					}
				}
			);
		}

		function uf_upload() {
			console.log("start firmware upload ...");
			navigator.notification.progressStart("Please wait" , "uploading firmware ...");

			var device = ble.getDeviceList().getDevice($scope.beacon.address);

			params = {};
			params.address = $scope.beacon.address;
			params.name = $scope.beacon.name;
			params.filePath = FULL_LOCAL_URL + newFirmware;
			// params.initFilePath = "";
			// params.keepBond = true;

			// call bluenet dfu plugin to upload firmware
			bluenetDfu.uploadFirmware(
				function(obj) {
					console.log("/!\\ /!\\ update: " + JSON.stringify(obj));
					if (obj.status == "progress") {
						navigator.notification.progressValue(obj.progress);
					}
					if (obj.status == "completed") {
						console.log("... upload completed");
						navigator.notification.progressStop();
						navigator.notification.activityStart("Please wait" , "rebooting device ...");
						setTimeout(function() {
							navigator.notification.activityStop();
							verifyFirmware(
								function() {
									// $('#reconnect').trigger('click');
									onDone(true);
								},
								function(msg) {
									// $('#reconnect').prop("disabled", false);
									// $('#upload').prop("disabled", false);
									// $('#reconnect').trigger('click');
									navigator.notification.alert("Failed to verify firmware." + msg, null , "Error");
								}
							);
						}, 5000);
					}
				},
				function(obj) {
					onDone(false);
					console.log("error: " + obj.status);
					// setTimeout(function() {
						// $('#reconnect').trigger('click');
					// }, 5000);
				},
				params
			);
		}

		function uf_reset() {

			// if (!isDfuTarget) {

				// ble.disconnect(
				console.log("/!\\ resetting to bootloader... /!\\");

				navigator.notification.activityStart("Please wait" , "resetting to bootloader ...");

				ble.resetToBootloader(
					function() {
						console.log('reset done');

						resetting = true;
						connected = false;
						// $('#disconnect').hide();
						// $('#reconnect').show();
						// $('#reconnect').prop("disabled", true);
						// $('#upload').prop("disabled", true);

						// resetLayout();
						// $('#upload').show();

						setTimeout(function() {
							navigator.notification.activityStop();
							uf_connectAndDiscover();
						}, 5000);
					},
					function(obj) {
						navigator.notification.activityStop();
						console.log("error: " + obj.status);
						onDone(false);
					}
				);
			// } else {
			// 	console.log("target already in dfu mode, start uploading ...");
			// 	uf_upload();
			// }
		}

		function uf_downloadBin(firmware) {

			navigator.notification.activityStart("Please wait" , "downloading newest firmware ...");

			var fileTransfer = new FileTransfer();

			var remoteUri = encodeURI(REMOTE_URL + firmware);
			var localUri = encodeURI(FULL_LOCAL_URL + firmware);

			console.log("downloading firmware from " + remoteUri + " to " + localUri);

			// start download
			fileTransfer.download(remoteUri, localUri,
				function(entry) {
					console.log("download complete: " + entry.fullPath);
					navigator.notification.activityStop();
					saveVersionToFile();
					uf_reset();
				},
				function(error) {
					console.log("download failed! " + error.source + " - " + error.target + " (" + error.code + ")");
					if (error.code == FileTransferError.FILE_NOT_FOUND_ERR) {
						console.log("FILE_NOT_FOUND_ERR");
					} else if (error.code == FileTransferError.INVALID_URL_ERR) {
						console.log("INVALID_URL_ERR");
					} else if (error.code == FileTransferError.CONNECTION_ERR) {
						console.log("CONNECTION_ERR");
					} else if (error.code == FileTransferError.ABORT_ERR) {
						console.log("ABORT_ERR");
					} else {
						console.log("unknown");
					}

					navigator.notification.activityStop();
					navigator.notification.alert("Failed to download firmware, please try again!", null , "Upload Failure");
				},
				true
			);
		}

		function checkIfBinDownloaded(fs, hardwareRevision, firmwareRevision, cb) {

			console.log("checking if firmware is already downloaded ...")

			getLocalFile(
				fs,
				function(versionFile) {
					localVersionFile = versionFile;
					for (i = 0; i < versionFile.length; i++) {
						var boardVersion = versionFile[i];
						if (boardVersion.hardware == hardwareRevision) {
							// console.log("found");
							if (boardVersion.version == firmwareRevision) {
								newFirmware = boardVersion.firmware;
								console.log("found: " + boardVersion.version + " / " + firmwareRevision);
								cb(true);
							} else {
								console.log("not found: " + boardVersion.version + " / " + firmwareRevision);
								cb(false);
							}
							return;
						}
					}
					console.log("no version file found!");
					cb(false);
				},
				function(error) {
					console.log("error: " + error.code);
					if (error.code == FileError.NOT_FOUND_ERR) {
						console.log("file not found");
						cb(false);
					}
				}
			);
		}

		function checkFileSystem(cb) {
			console.log("checking file system ...");

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
				function(fileSystem) {
					// console.log("name: " + fileSystem.name);
					// console.log("root name: " + fileSystem.root.name);
					// console.log("root full path: " + fileSystem.root.fullPath);

					// create download directory if it doesn't exist already
					fileSystem.root.getDirectory(LOCAL_URL, {create: true},
						function(parent) {
							fs = fileSystem;
							cb(fileSystem);
						},
						function(error) {
							console.log("Unable to create new directory: " + error.code);
							onDone(false);
						}
					);
				},
				function(evt) {
					console.log("err code: " + evt.target.error.code);
					onDone(false);
				}
			);
		}

		function getFile(fs, strFile, cb, err) {
			// console.log("get file... ");
			fs.root.getFile(strFile, null,
				function(fileEntry) {
					// console.log("gotFile: " + JSON.stringify(fileEntry));
					fileEntry.file(cb, err);
				},
				err
			);
		}

		function getLocalFile(fs, cb, err) {
			console.log("get local version file");
			getFile(fs, LOCAL_VERSION_URL, function(file) {
				var reader = new FileReader();
				reader.onloadend = function(evt) {
					versionFile = JSON.parse(evt.target.result);
					console.log("localVersionFile: " + JSON.stringify(versionFile));
					cb(versionFile);
				};
				reader.readAsText(file);
			},
			err);
		}

		function getRemoteFile(fs, cb) {

			var remoteUri = encodeURI(REMOTE_VERSION_URL);
			var localUri = encodeURI(FULL_LOCAL_TEMP_VERSION_URL);

			console.log("downloading remote version file from " + remoteUri +
				" to " + localUri + " ...");

			var fileTransfer = new FileTransfer();
			fileTransfer.download(remoteUri, localUri,
				function(entry) {
					console.log("... done");

					fs.root.getFile(LOCAL_TEMP_VERSION_URL, null,
						function(fileEntry) {
							// console.log("gotFile: " + JSON.stringify(fileEntry));
							fileEntry.file(
								function(file) {
									var reader = new FileReader();
									reader.onloadend = function(evt) {
										var remoteVersionFile = JSON.parse(evt.target.result);
										console.log("remoteVersionFile: " + JSON.stringify(remoteVersionFile));
										fileEntry.remove(function() {
											// console.log("remote version file removed");
										}, function(error) {
											// console.log("failed to remove remote version file: " + error.code);
										});
										cb(remoteVersionFile);
									};
									reader.readAsText(file);
								},
								function fail(evt) {
									console.log("... failed, error: " + evt.target.error.code);
									onDone(false);
								}
							);
						},
						function(error) {
							console.log("... failed, error: " + error.code);
							onDone(false);
						}
					);
				},
				function(error) {
					console.log("download failed! " + error.source + " - " + error.target + " (" + error.code + ")");
					if (error.code == FileTransferError.FILE_NOT_FOUND_ERR) {
						console.log("FILE_NOT_FOUND_ERR");
					} else if (error.code == FileTransferError.INVALID_URL_ERR) {
						console.log("INVALID_URL_ERR");
					} else if (error.code == FileTransferError.CONNECTION_ERR) {
						console.log("CONNECTION_ERR");
					} else if (error.code == FileTransferError.ABORT_ERR) {
						console.log("ABORT_ERR");
					} else {
						console.log("unknown");
					}
					onDone(false);
				},
				true
			);
		}
	}
});
