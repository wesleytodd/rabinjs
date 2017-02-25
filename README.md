# rabin

This is a work in progress.  I think this currently works, but I need to do a bunch more testing and optimization. If you know more about this than me, PLEASE HELP :)

[![NPM Version](https://img.shields.io/npm/v/rabinjs.svg)](https://npmjs.org/package/@wesleytodd/rabin)
[![NPM Downloads](https://img.shields.io/npm/dm/rabinjs.svg)](https://npmjs.org/package/@wesleytodd/rabin)
[![Build Status](https://travis-ci.org/wesleytodd/rabin.svg?branch=master)](https://travis-ci.org/wesleytodd/rabin)
[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)

## Install

```
$ npm install --save rabinjs
```

## Usage

```javascript
var fs = require('fs');
var rabin = require('rabinjs');

var chunks = [];
fs.createReadStream('rabin.pdf').pipe(rabin())
	.on('data', function (d) {
		chunks.push(d);
	})
	.on('end', function (d) {
		console.log('File processed!');
		console.log('Chunks: ', chunks.length);
	});
```

## Development

The tests can be run with `npm test`, which also runs the linter and any other builds steps for the module.
When a release is ready, use npm to bump the version:

```
$ npm version minor
$ git push
$ npm publish
```

Pull requests should be made against master or the currently active development branch.
