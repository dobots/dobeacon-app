#!/bin/sh

cd ..

echo "Make sure you have an updated version of the so-called \"Debug Scanner Application\". You have to create these in the AppGyver cloudservice. For our application this is https://cloud.appgyver.com/applications/62082#/builds"

sleep 1

echo "Run steroids connect (automatically updates connected target)"
steroids connect
