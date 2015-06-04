# App for DoBeacons

An application for the DoBeacons, a device that is like an iBeacon, but can be plugged into a wall socket.

![Screenhost](https://github.com/dobots/dobeacon-app/blob/master/doc/scan.png)
{:.some-css-class style="width: 35%; float: right; margin: 0px 0px 0px 20px;"}

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
