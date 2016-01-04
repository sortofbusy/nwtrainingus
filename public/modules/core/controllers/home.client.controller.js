'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll',
	function($scope, Authentication, $http, $q, $sce, $location, $anchorScroll) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		$scope.read = function(increment) {
			var chapter = $scope.chapterString;
			if (this.readChapter) chapter = this.readChapter;
			$scope.getRCVText(chapter, increment).then(function(response) {
				$scope.chapterText = response;
				$scope.chapterString = response.inputstring;
				if (increment !== 0) {
					$location.hash('readLocation');
					$anchorScroll();
				}
			});
			this.readChapter = '';
		};

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