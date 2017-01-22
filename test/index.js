/* global describe, it */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var pump = require('pump');
var rabin = require('../');
var rabinC = require('rabin');

var FIXTURES = path.join(__dirname, 'fixtures');

describe('rabin', function () {
	it('should js', function (done) {
		var inputStream = fs.createReadStream(path.join(FIXTURES, 'rabin.pdf'));
		var rabinStream = rabin();

		var inLen = 0;
		inputStream.on('data', function (d) {
			inLen += d.length;
		});

		var chunks = 0;
		var len = 0;
		var stream = pump(inputStream, rabinStream);
		stream.on('error', function (err) {
			console.error(err);
		});
		stream.on('data', function (d) {
			chunks++;
			len += d.length;
		});
		stream.on('end', function (d) {
			assert.equal(len, inLen);
			assert.equal(chunks, 38);
			done();
		});
	});
	// This test is just for comparison
	it.skip('should c', function (done) {
		var inputStream = fs.createReadStream(path.join(FIXTURES, 'rabin.pdf'));
		var rabinStream = rabinC();

		var inLen = 0;
		inputStream.on('data', function (d) {
			inLen += d.length;
		});

		var chunks = 0;
		var len = 0;
		var stream = pump(inputStream, rabinStream);
		stream.on('error', function (err) {
			console.error(err);
		});
		stream.on('data', function (d) {
			chunks++;
			len += d.length;
		});
		stream.on('end', function (d) {
			assert.equal(len, inLen);
			assert.equal(chunks, 40);
			done();
		});
	});
});
