'use strict';

angular.module('chapters').factory('BibleText', [ '$q', '$http',
	function($q, $http) {
		var getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment}})
					.then(					
							// create an array of calls since the RcV API only returns 30 verses / call
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
							resolve($q.all(calls));
						});
				
			});
		};

		// Public API - eventually this will call other providers
		return {
			getChapterText: function(chapterName, increment) {
				return $q(function(resolve) {
					getRCVText(chapterName, increment).then(function (result) {
				    		//combine all verses into one array
				    	var combined = {};
				    	combined.verses = [];
				    	combined.inputstring = result[0].data.inputstring.split(':')[0];
				    	for (var i = 0; i < result.length; i++) {
				    		combined.verses = combined.verses.concat(result[i].data.verses);
				    	}
				    	
				    		// replace chars for HTML output
				    	for (i = 0; i < combined.verses.length; i++) {
				    		combined.verses[i].text = combined.verses[i].text.split('[').join('<i>');
				    		combined.verses[i].text = combined.verses[i].text.split(']').join('</i>');
				    	}
				    	
				    	combined.copyright = result[0].data.copyright;
				    	
				    	resolve(combined);
					}, function(error) {
						resolve(error);
					});
				});
			}
		};
	}
]);