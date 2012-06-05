var socialCheesecake = socialCheesecake || {};

// function mergeDeep
//
// Completes the attributes of original from the ones from default
//
// Based on extendDeep from:
// JavaScript Patterns, by Stoyan Stefanov
// (O’Reilly). Copyright 2010 Yahoo!, Inc., 9780596806750

socialCheesecake.mergeDeep = function(def, original) {
	var i,
	toStr = Object.prototype.toString,
	astr = "[object Array]";

	original = original || {};

	for (i in def) {
		if (def.hasOwnProperty(i)) {
			if (original.hasOwnProperty(i)) {
				if (typeof original[i] === "object" && toStr.call(original[i]) !== astr && toStr.call(def[i]) === toStr.call(original[i]) ) {
					socialCheesecake.mergeDeep(def[i], original[i]);
				}
			} else {
				if (typeof def[i] === "object") {
					original[i] = (toStr.call(def[i]) === astr) ? [] : {};
					socialCheesecake.mergeDeep(def[i], original[i]);
				} else {
					original[i] = def[i];
				}

			}
		}
	}

	return original;
};
