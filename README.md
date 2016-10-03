# Eve

Electron app testbed!

# Getting started

```
cp config.example.js config.js
```

Create your keyfile.json with a service account.
https://cloud.google.com/speech/docs/common/auth

```
export GOOGLE_APPLICATION_CREDENTIALS=`set your location of keyfile.json here`
npm install && npm start
```

Follow the instructions here to install dependencies for the hotword detection.

https://github.com/Kitt-AI/snowboy

Generate _snowboydetect.so and snowboydetect.py with SWIG (check SWIG version!)

Copy the files into the speech folder.

Test that the hotword detection is working by:

```
python speech/srs.py speech/resources/hotword.pmdl
```

Set these if rec is not working (typically on the Pi)

```
export AUDIODEV=hw:1,0
export AUDIODRIVER=alsa
```

If you are having problems with mismatching modules, ensure that the node version is the same as:
https://github.com/electron/electron/blob/master/.node-version

Otherwise, downgrade electron-prebuilt to v1.2.8.


# NLP and STT
The project aims to use Google Speech with wit.ai for STT and NLP.

# Features
Clock - Displays the hourly weather until the end of day for a country.
Video - Plays a Youtube Video
Weather - Shows the current weather

