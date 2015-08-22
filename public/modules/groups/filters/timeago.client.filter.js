'use strict';

angular.module('groups').filter('timeago', [
	function() {
		return function(input) {
			var value = null;
			var unit = 'just now';
			var created = new Date(input);
			
			var diff = (Date.now() - created) / (60*1000); // time in minutes
			if (Math.floor(diff) > 0 ) {
				unit = ' minute(s) ago';
			}
			if (Math.floor(diff) > 59 ) {
				unit = ' hour(s) ago';
				diff /= 60;
			}
			if (Math.floor(diff) > 23 ) {
				unit = ' day(s) ago';
				diff /= 24;
			}
			value = Math.floor(diff);
			if (value === 0) value = '';
			
			return value + unit;
		};
	}
]);