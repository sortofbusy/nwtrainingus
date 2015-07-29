'use strict';

//Plans service used to communicate Plans REST endpoints
angular.module('plans').factory('Plans', ['$resource',
	function($resource) {
		return $resource('plans/:planId', { planId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			readToday: {
				method: 'GET',
				url: 'plans/:planId/today',
				isArray: true
			}
		});
	}
]);