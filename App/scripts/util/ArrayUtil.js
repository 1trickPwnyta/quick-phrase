{
	_ArrayUtil = {
		
		/**
		 * Shuffles the values in an array.
		 * @param v the array to shuffle.
		 * @return the shuffled array.
		 */
		shuffle: function(v) {
		    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
		    return v;
		},
		
		/**
		 * Looks for differences between two arrays.
		 * @param a the first array.
		 * @param b the second array.
		 * @param equal a function that returns true if the two array elements are 
		 * equal and false otherwise.
		 * @param inaonly an empty array that will be filled with elements that are 
		 * only in the first array.
		 * @param inboth an empty array that will be filled with elements that are 
		 * in both arrays.
		 * @param inbonly an empty array that will be filled with elements that are 
		 * only in the second array.
		 */
		compare: function(a, b, equal, inaonly, inboth, inbonly) {
			for (var i = 0; i < a.length; i++) {
				var found = false;
				for (var j = 0; j < b.length; j++) {
					if (equal(b[j], a[i])) {
						found = true;
						break;
					}
				}
				if (found) {
					inboth.push(a[i]);
				} else {
					inaonly.push(a[i]);
				}
			}
			
			for (var i = 0; i < b.length; i++) {
				var found = false;
				for (var j = 0; j < a.length; j++) {
					if (equal(a[j], b[i])) {
						found = true;
						break;
					}
				}
				if (!found) {
					inbonly.push(b[i]);
				}
			}
		}
		
	};
}
