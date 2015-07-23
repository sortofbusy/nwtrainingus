'use strict';
		
//Chapters service used to communicate Chapters REST endpoints
angular.module('chapters').factory('Chapters', ['$resource', '$http', '$q',
	function($resource, $http, $q) {
		var chapterFactory = $resource('chapters/:chapterId', { chapterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});

		

		return chapterFactory;
	}
]);