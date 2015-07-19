'use strict';

//Chapters service used to communicate Chapters REST endpoints
angular.module('chapters').factory('Chapters', ['$resource',
	function($resource) {
		return $resource('chapters/:chapterId', { chapterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);