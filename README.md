# App for DoBeacons

[![Build Status](https://travis-ci.org/dobots/dobeacon-app.svg?branch=master)](https://travis-ci.org/dobots/dobeacon-app)

An application for the DoBeacons, a device that is like an iBeacon, but can be plugged into a wall socket.

<img src="https://github.com/dobots/dobeacon-app/blob/master/doc/scan.png" alt="Screenshot of DoBeacon Android application" width="35%" align="right">

# Develop

Follow the installation instructions on http://www.appgyver.com/.

## Scanner

One thing you have to be aware of, is that you need to built a special Scanner app to be able to run this application within the development cycle.

See: https://muut.com/appgyver#!/steroids:bluetooth-low-energy-plugin

## Non-bower

Not all javascript is available in bower yet. Copy the files from the nonbower_components to the bower_components folder.

# Travis CI

To enable deploying using Travis CI, the $APPGYVER_ACCESS_TOKEN_CONTENTS has to be set using the travis client

1. follow the installation steps in https://github.com/travis-ci/travis.rb
2. execute the command to set the environment variable
	$ travis env set APPGYVER_ACCESS_TOKEN_CONTENTS `cat $HOME/.appgyver/token.json` --private
