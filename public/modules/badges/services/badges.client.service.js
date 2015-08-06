'use strict';

//Badges service used to communicate Badges REST endpoints
angular.module('badges').factory('Badges', ['$resource',
	function($resource) {
		return $resource('badges/:badgeId', { badgeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);