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
npm install
./node_modules/.bin/electron-rebuild --pre-gyp-fix
npm start
```

Set these if rec is not working (typically on the Pi)

```
export AUDIODEV=hw:1,0
export AUDIODRIVER=alsa
```

If you are having problems with mismatching modules, ensure that the node version is the same as:
https://github.com/electron/electron/blob/master/.node-version

# NLP and STT
The project aims to use Google Speech with wit.ai for STT and NLP.

# Features
Clock - Displays the hourly weather until the end of day for a country.

Video - Plays a Youtube Video

Weather - Shows the current weather

