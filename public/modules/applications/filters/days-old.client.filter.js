'use strict';

angular.module('applications').filter('daysOld', [
	function() {
		return function(input) {
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var created = new Date(input);
			return Math.floor((Date.now() - created) / oneDay);
		};
	}
]);