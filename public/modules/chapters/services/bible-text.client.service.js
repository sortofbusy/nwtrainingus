'use strict';

angular.module('chapters').factory('BibleText', [ '$q', '$http', 'Authentication',
	function($q, $http, Authentication) {
		var bibleVersions = [
			{ language: 'Afrikaans', name: 'Ou Vertaling', code: 'aov'},
			{ language: 'Albanian', name: 'Albanian', code: 'albanian'},
			{ language: 'Amharic', name: 'Haile Selassie Amharic Bible', code: 'hsab'},
			{ language: 'Arabic', name: 'Smith and Van Dyke', code: 'arabicsv'},
			{ language: 'Chinese', name: 'NCV Traditional', code: 'cnt'},
			{ language: 'Chinese', name: 'Union Simplified', code: 'cus'},
			{ language: 'Chinese', name: 'NCV Simplified', code: 'cns'},
			{ language: 'Chinese', name: 'Union Traditional', code: 'cut'},
			{ language: 'Croatian', name: 'Croatian', code: 'croatia'},
			{ language: 'Danish', name: 'Danish', code: 'danish'},
			{ language: 'Dutch', name: 'Dutch Staten Vertaling', code: 'statenvertaling'},
			{ language: 'English', name: 'American Standard Version', code: 'asv'},
			{ language: 'English', name: 'Amplified Version', code: 'amp'},
			{ language: 'English', name: 'Basic English Bible', code: 'basicenglish'},
			{ language: 'English', name: 'Darby', code: 'darby'},
			{ language: 'English', name: 'King James Version', code: 'kjv'},
			{ language: 'English', name: 'KJV Easy Read', code: 'akjv'},
			{ language: 'English', name: 'New American Standard', code: 'nasb'},
			{ language: 'English', name: 'Recovery Version', code: 'rcv'},
			{ language: 'English', name: 'Young\'s Literal Translation', code: 'ylt'},
			{ language: 'English', name: 'World English Bible', code: 'web'},
			{ language: 'English', name: 'Webster\'s Bible', code: 'wb'},
			{ language: 'Esperanto', name: 'Esperanto', code: 'esperanto'},
			{ language: 'Estonian', name: 'Estonian', code: 'estonian'},
			{ language: 'Finnish', name: 'Finnish Bible (1776)', code: 'finnish1776'},
			{ language: 'French', name: 'Martin (1744)', code: 'martin'},
			{ language: 'German', name: 'Luther (1912)', code: 'luther1912'},
			{ language: 'Greek', name: 'Greek Modern', code: 'moderngreek'},
			{ language: 'Greek', name: 'Textus Receptus', code: 'text'},
			{ language: 'Hebrew', name: 'Aleppo Codex', code: 'aleppo'},
			{ language: 'Hungarian', name: 'Hungarian Karoli', code: 'karoli'},
			{ language: 'Italian', name: 'Giovanni Diodati Bible (1649)', code: 'giovanni'},
			{ language: 'Korean', name: 'Korean', code: 'korean'},
			{ language: 'Norwegian', name: 'Bibelselskap (1930)', code: 'bibelselskap'},
			{ language: 'Portuguese', name: 'Almeida Atualizada', code: 'almeida'},
			{ language: 'Russian', name: 'Synodal Translation (1876)', code: 'synodal'},
			{ language: 'Spanish', name: 'Reina Valera (1909)', code: 'valera'},
			{ language: 'Swahili', name: 'Swahili', code: 'swahili'},
			{ language: 'Swedish', name: 'Swedish (1917)', code: 'swedish'},
			{ language: 'Turkish', name: 'Turkish', code: 'turkish'},
			{ language: 'Vietnamese', name: 'Vietnamese (1934)', code: 'vietnamese'},
			{ language: 'Xhosa', name: 'Xhosa', code: 'xhosa'}
		];

		var getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment}})
					.then(					
							// get an array of calls since the RcV API only returns 30 verses / call
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
				$http.jsonp('https://getbible.net/json', {params: { scripture: chapterName, v: version, callback: 'JSON_CALLBACK'}})
					.then(					
						function (response) {
							var json = response.data;
							
								// search for version in bibleVersions array
							var userVersion = {};
							userVersion.version = version;
							for (var b=0; b < bibleVersions.length; b++) {
						        if (bibleVersions[b].code === version) {
						            userVersion = bibleVersions[b];
						        }
						    }

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
							combined.copyright = userVersion.name + ' [' + userVersion.language + '] text from getbible.net.';
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