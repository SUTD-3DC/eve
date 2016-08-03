# Eve

Electron app testbed!

# Getting started

```

npm install -g cmake-js
cp config.example.js config.js
npm install && npm start

```

If you are having problems with mismatching modules, ensure that the node version is the same as:
https://github.com/electron/electron/blob/master/.node-version

Otherwise, downgrade electron-prebuilt to v1.2.8.


# NLP and STT
The project currently uses pocketsphinx.

Download a Language Model from:

https://sourceforge.net/projects/cmusphinx/files/Acoustic%20and%20Language%20Models/US%20English/

Compile it into a .bin with `sphinx_lm_convert -i name.lm -o name.lm.bin`

