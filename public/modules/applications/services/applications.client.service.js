'use strict';

//Groups service used to communicate Groups REST endpoints
angular.module('applications').factory('Applications', ['$resource',
	function($resource) {
		return $resource('applications/:applicationId', { applicationId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);