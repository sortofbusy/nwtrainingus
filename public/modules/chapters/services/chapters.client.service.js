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

		chapterFactory.getRCVText = function(inputString) {
			var lsmApiConfig = {
			  params: {
			    String: inputString,
			    Out: 'json'
			  }
			};
			var deferred = $q.defer();
    		$http.get('http://api.lsm.org/recver.php', lsmApiConfig).success(
				function(data, status) {
					console.log(data);
					deferred.resolve(data);
				}).
			  	error( function(data, status, headers, config) {
			    	deferred.reject(new Error('Failed to load chapter: | ' + data));
		  	});
			return deferred.promise;

		}; 

		chapterFactory.thing = 5;

		return chapterFactory;
	}
]);