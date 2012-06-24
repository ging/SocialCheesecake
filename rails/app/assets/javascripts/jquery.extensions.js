/*
 * Using jQuery to compare two arrays
 *
 * http://stackoverflow.com/questions/1773069/using-jquery-to-compare-two-arrays
 */
jQuery.fn.compare = function(t) {
	if (this.length != t.length) { return false; }
	var a = this.sort(),
	b = t.sort();
	for (var i = 0; t[i]; i++) {
		var ai = a[i];
		var bi = b[i];

		if ($.type(ai) !== $.type(bi))
			return false;

		if ($.type(ai) === "array") {
			if (!$(ai).compare(bi))
				return false;
		} else if (a[i] !== b[i]) { 
			return false;
		}
	}
	return true;
};
