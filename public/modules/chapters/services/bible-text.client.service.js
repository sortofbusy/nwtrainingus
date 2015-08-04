'use strict';

angular.module('chapters').factory('BibleText', [ '$q', '$http',
	function($q, $http) {
		var getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment}})
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
								calls.push($http.get('https://api.lsm.org/recver.php', lsmApiConfig)); // second call - call LSM API
							}
							$q.all(calls).then( function(arrayOfResults) {
								resolve(arrayOfResults);
							});
						});
				
			});
		};

		// Public API - eventually this will call other providers
		return {
			getChapterText: function(chapterName, increment) {
				return $q(function(resolve) {
					getRCVText(chapterName, increment).then(function (result) {
				    	resolve(result);
					});
				});
			}
		};
	}
]);