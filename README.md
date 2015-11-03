# App for DoBeacons

[![Build Status](https://travis-ci.org/dobots/dobeacon-app.svg?branch=master)](https://travis-ci.org/dobots/dobeacon-app)

An application for the DoBeacons, a device that is like an iBeacon, but can be plugged into a wall socket.

<img src="https://github.com/dobots/dobeacon-app/blob/master/doc/scan.png" alt="Screenshot of DoBeacon Android application" width="35%" align="right">

# Installation

Follow the instructions on http://www.appgyver.io/steroids/getting_started to get started with appgyver and steroids. After installing the steroids tooling ([instructions](http://docs.appgyver.com/tooling/cli/steroids-cli/)) and checking out this repository, be sure to run

    steroids update
    
which will install all the dependencies, before running

    steroids connect
    
to run the app.

# Develop

To run the app within the development cycle, you will need to create your own Scanner app. See http://docs.appgyver.com/tooling/build-service/plugins/configuring-custom-plugins/ for explanations on how to create your custom Scanner app, and add the following to the Plugins field:

```
[
  {"source":"https://github.com/eggerdo/BluetoothLE.git"},
  {"source":"https://github.com/dobots/cordova-plugin-bluenet-dfu.git#appgyver"}
]
```

# Travis CI

To enable deploying using Travis CI, the $APPGYVER_ACCESS_TOKEN_CONTENTS has to be set using the travis client

1. follow the installation steps in https://github.com/travis-ci/travis.rb
2. execute the command to set the environment variable
	$ travis env set APPGYVER_ACCESS_TOKEN_CONTENTS `cat $HOME/.appgyver/token.json` --private
