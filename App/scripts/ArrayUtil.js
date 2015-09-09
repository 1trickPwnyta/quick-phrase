_ArrayUtil = {
	
	/**
	 * Shuffles the values in an array.
	 * @param v the array to shuffle.
	 * @return the shuffled array.
	 */
	shuffle: function(v) {
	    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
	    return v;
	}
	
};
