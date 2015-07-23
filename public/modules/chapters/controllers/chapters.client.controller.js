'use strict';

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q',
	function($scope, $http, $stateParams, $location, Authentication, Chapters, Users, $q) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.readingMode = false;

		// Create new Chapter
		$scope.create = function(name) {
			return $q(function(resolve) {
				if (!name) name = $scope.name;
				// Create new Chapter object
				var chapter = new Chapters ({
					name: name
				});
				$scope.alerts = [];
				// Redirect after save
				chapter.$save(function(response) {
					$scope.user.lastChapter = response._id;
					$scope.user.$update(function(response) {
					}, function(errorResponse) {
						$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed' + errorResponse, icon: 'times'});
					});

					$scope.alerts.push({type: 'success', msg: 'Chapter entered', icon: 'check-square-o'});
					$scope.chapters.unshift(response); // adds the new chapter to the beginning of chapters
					
					// Clear form fields
					$scope.name = '';
					$scope.chapterTextArray = null;
					resolve();
				}, function(errorResponse) {
					$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed', icon: 'times'});
					resolve();
				});
			});
		};

		// Remove existing Chapter
		$scope.remove = function(chapter) {
			if ( chapter ) { 
				chapter.$remove();

				for (var i in $scope.chapters) {
					if ($scope.chapters [i] === chapter) {
						$scope.chapters.splice(i, 1);
					}
				}
			} else {
				$scope.chapter.$remove(function() {
					$location.path('chapters');
				});
			}
		};

		// Update existing Chapter
		$scope.update = function() {
			var chapter = $scope.chapter;
			chapter.$update(function() {
				$location.path('chapters/' + chapter._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Chapters
		$scope.find = function(userId) {
			if(!userId) userId = $scope.authentication.user._id;
			$scope.chapters = Chapters.query({user: userId});
		};

		$scope.moveChapter = function(increment) {
			$scope.alerts = [];
			// IF we are in readingMode, the current chapter is unsaved, so save it
			if ($scope.readingMode && increment === 1) {
				$scope.create($scope.currentChapter).then( function() {
					$scope.getChapterText($scope.user.lastChapter, increment);
				}, function (err) {

				});

			} else $scope.getChapterText($scope.user.lastChapter, increment);
			
		};

		$scope.getChapterText = function(chapterId, increment) {
			$scope.readingMode = true;
			$scope.getRCVText(chapterId, increment).then(function (result) {
			    $scope.currentChapter = result[0].data.verses[0].ref.split(':')[0];
				$scope.chapterTextArray = result;
			});
		};

		$scope.getRCVText = function(chapterId, increment) {
			return $q(function(resolve) {
			$http.get('/chapters/' + chapterId + '/next', {params: {increment: increment}})
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

		
	}

]);