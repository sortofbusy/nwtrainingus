'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll',
	function($scope, Authentication, $http, $q, $sce, $location, $anchorScroll) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		$scope.read = function(increment) {
			var chapter = $scope.chapterString;
			if ($scope.readChapter) chapter = $scope.readChapter;
			$scope.getRCVText(chapter, increment).then(function(response) {
				$scope.chapterText = response;
				$scope.chapterString = response.inputstring;
				$location.hash('readLocation');
				$anchorScroll();
			});
			$scope.readChapter = '';
		};

		$scope.books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];


		$scope.getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment, addNumber: true}})
					.then(					
							// get an array of calls since the RcV API only returns 30 verses / call
						function (response) {
							$scope.chapterNumber = response.data.chapterNumber;
							var calls = [];
							for(var i =0; i < response.data.chapterChunks.length; i++) {
								
								var lsmApiConfig = {
								  params: {
								    String: response.data.chapterChunks[i],
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

		$scope.sceTrust = function(input) {
			return $sce.trustAsHtml(input);
		};
	}


]);