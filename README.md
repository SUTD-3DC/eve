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

If you are having problems with mismatching modules, ensure that the node version is the same as:
https://github.com/electron/electron/blob/master/.node-version

Otherwise, downgrade electron-prebuilt to v1.2.8.


# NLP and STT
The project aims to use Google Speech with wit.ai but currently it uses wit.ai for full STT and NLP.

# Features
Clock.
Displays the hourly weather until the end of day for a country.

