var throug2 = require('through2');

module.exports = function (opts) {
	opts = opts || {};

	var polynomial = +opts.polinomial || 15487469;
	var polynomialDegree = deg(polynomial);
	var winSize = +opts.winSize || 64;
	var avgBits = +opts.bits || 12;
	var mask = (1 << avgBits) - 1;
	var min = +opts.min || 8 * 1024;
	var max = +opts.max || 32 * 1024;

	// The hasher object
	var hasher = {
		polynomial: polynomial,
		polynomialDegree: polynomialDegree,
		polynomialShift: polynomialDegree - 8,
		winSize: winSize,
		window: new Array(winSize),
		wpos: 0,
		digest: 0,
		mask: mask,
		outTable: [],
		modTable: []
	};

	calcOutTable(hasher);
	calcModTable(hasher);

	// Keep remaining buffer from last chunk
	var buf = Buffer.alloc(0);

	// A buffer to accumulate in
	return throug2.obj(function (chunk, enc, done) {
		fingerprint(chunk, this.push.bind(this), done);
	}, function (done) {
		// Push any remaining data less than max chunk size
		if (buf.length) {
			// Reset transition buffer
			var b = buf;
			buf = Buffer.alloc(0);
			var push = this.push.bind(this);

			// Fingerprint any remaining data
			fingerprint(b, push, function () {
				// Push the last of it if anything is remaining
				if (buf.length) {
					push(buf);
				}
				done();
			});
			return;
		}
		done();
	});

	function fingerprint (chunk, push, done) {
		// Track current chuck
		var count = 0;
		var start = 0;

		// Prepend previous buf
		var c = Buffer.concat([buf, chunk]);
		buf = Buffer.alloc(0);

		for (var i = 0; i < c.length; i++) {
			rabinSlide(hasher, c[i]);
			count++;

			if ((count >= min && ((hasher.digest & hasher.mask) === 0)) || count >= max) {
				push(c.slice(start, i));

				// keep position
				count = 0;
				start = i;

				// Reset the fingerprinter
				rabinReset(hasher);
			} else if (i === c.length - 1) {
				// unaccounted for, save for later
				buf = Buffer.concat([buf, c.slice(start)]);
			}
		}

		done();
	}
};

function rabinSlide (hasher, b) {
	var out = hasher.window[hasher.wpos];
	hasher.window[hasher.wpos] = b;
	hasher.digest = hasher.digest ^ hasher.outTable[out];
	hasher.wpos = (hasher.wpos + 1) % hasher.winSize;
	rabinAppend(hasher, b);
}

function rabinAppend (h, b) {
	var index = h.digest >> h.polynomialShift;
	h.digest <<= 8;
	h.digest |= b;
	h.digest ^= h.modTable[index];
}

function rabinReset (hasher) {
	for (var i = 0; i < hasher.winSize; i++) {
		hasher.window[i] = 0;
	}
	hasher.wpos = 0;
	hasher.digest = 0;
	rabinSlide(hasher, 1);
}

function calcOutTable (h) {
	for (var b = 0; b < 256; b++) {
		var hash = 0;
		hash = append(hash, b, h.polynomial);
		for (var i = 0; i < h.winSize - 1; i++) {
			hash = append(hash, 0, h.polynomial);
		}
		h.outTable[b] = hash;
	}
}

function calcModTable (h) {
	for (var b = 0; b < 256; b++) {
		var s = b << h.polynomialDegree;
		h.modTable[b] = mod(s, h.polynomial) | s;
	}
}

function append (hash, b, p) {
	hash = hash << 4;
	hash = hash | b;
	return mod(hash, p);
}

function mod (h, p) {
	while (deg(h) >= deg(p)) {
		h = h ^ (p << (deg(h) - deg(p)));
	}
	return h;
}

function deg (x) {
	var mask = 0x80000000;
	for (var i = 0; i < 32; i++) {
		if ((mask & x) > 0) {
			return 31 - i;
		}
		mask >>= 1;
	}
	return -1;
}
