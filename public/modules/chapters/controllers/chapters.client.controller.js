'use strict';

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users',
	function($scope, $http, $stateParams, $location, Authentication, Chapters, Users) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = response.data;
			console.log($scope.user);
		});

		// Create new Chapter
		$scope.create = function(name) {
			if (!name) name = this.name;
			// Create new Chapter object
			var chapter = new Chapters ({
				name: name
			});
			$scope.alerts = [];
			// Redirect after save
			chapter.$save(function(response) {
				
				$scope.user = Users.update({
					lastChapter: response._id
				});
				$location.path('');
				$scope.alerts.push({type: 'success', msg: 'Chapter entered', icon: 'check-square-o'});
				
				$scope.find();
				// Clear form fields
				$scope.name = '';
				$scope.chapterTextArray = null;
			}, function(errorResponse) {
				//$scope.error = errorResponse.data.message;
				$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed', icon: 'times'});
				
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

		$scope.getChapterText = function(increment) {
			var chapter = $scope.chapters[0];
			$scope.alerts = [];
			if ($scope.currentChapter) {
				$scope.create($scope.currentChapter);
				$scope.alerts.push({type: 'success', msg: 'Chapter entered', icon: 'check-square-o'});
			}
			
			var promiseText = Chapters.getRCVText(chapter);
			promiseText.then(function (result) {
			    $scope.currentChapter = result[0].data.verses[0].ref.split(':')[0];
			    $scope.chapterTextArray = result;
			});



		};

		
	}

]);