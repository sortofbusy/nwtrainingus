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

		chapterFactory.getRCVText = function(chapter) {
			/*
			var deferred = $q.defer(); // first call - query for next chapter
			$http.get('/chapters/' + chapter._id + '/next').success(
				function(data, status) {
					var calls = data.length;
					var called = 0;
					var results = [];
					for(var i =0; i < data.length; i++) {
						
						var lsmApiConfig = {
						  params: {
						    String: data[i],
						    Out: 'json'
						  }
						};
						$http.get('http://api.lsm.org/recver.php', lsmApiConfig).success( // second call - call LSM API
							function(data, status) {
								results[called] = data;
								called++;
								if (called === calls) {
									deferred.resolve(results); // return completed results
								}
							});
					}
			});
    		
			return deferred.promise;
			*/
			return $q(function(resolve) {
			$http.get('/chapters/' + chapter._id + '/next')
				.then(
					function (response) {
						var calls = [];
						for(var i =0; i < response.data.length; i++) {
							
							var lsmApiConfig = {
							  params: {
							    String: response.data[i],
							    Out: 'json'
							  }
							};
							calls.push($http.get('http://api.lsm.org/recver.php', lsmApiConfig)); // second call - call LSM API
						}
						$q.all(calls).then( function(arrayOfResults) {
							resolve(arrayOfResults);
						});
					});
			});
		};

		return chapterFactory;
	}
]);