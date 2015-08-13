'use strict';

angular.module('chapters').factory('BibleText', [ '$q', '$http', 'Authentication',
	function($q, $http, Authentication) {
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
							$q.all(calls).then(function (result) {
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
						    		combined.verses[i].ref = combined.verses[i].ref.split(':')[1];
						    	}
						    	
						    	combined.copyright = result[0].data.copyright;
						    	
						    	resolve(combined);
							}, function(error) {
								resolve(error);
							});
						});
				
			});
		};

		var getGetBibleText = function(chapterName, version) {
			return $q(function(resolve) {
				$http.get('https://getbible.net/json', {params: { scripture: chapterName, v: version}})
					.then(					
						function (response) {
							var data = response.data.substr(0, response.data.length - 2).substr(1);
							var json = JSON.parse(data);
							
							var combined = {};
							combined.verses = [];
							try {
							combined.inputstring = json.book_name + ' ' + json.chapter_nr;
								for (var i in json.chapter) {
									combined.verses.push({ref: json.chapter[i].verse_nr, text: json.chapter[i].verse});
								}
							} catch (e) {
								resolve(e);
								return;
							}
							combined.copyright = version.toUpperCase() + ' text from getbible.net.';
							resolve(combined);
						}, function(error) {
							resolve(error);
						});
				
			});
		};

		// Public API - eventually this will call other providers
		return {
			getChapterText: function(chapterName, increment) {
				var version = Authentication.user.preferences.version;
				if (version === 'rcv') {
					return $q(function(resolve) {
						resolve(getRCVText(chapterName, increment));
					});
				} else {
					return $q(function(resolve) {
						resolve(getGetBibleText(chapterName, version));
					});
				}
			}
		};
	}
]);