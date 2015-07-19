'use strict';

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Chapters',
	function($scope, $http, $stateParams, $location, Authentication, Chapters) {
		$scope.authentication = Authentication;
		

		//$scope.lastChapter = '';
		// Create new Chapter
		$scope.create = function() {
			// Create new Chapter object
			var chapter = new Chapters ({
				name: this.name
			});
			$scope.alerts = [];
			// Redirect after save
			chapter.$save(function(response) {
				$location.path('' + response._id);
				$scope.alerts.push({type: 'success', msg: 'Chapter entered.'});
				
				$scope.find();
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				//$scope.error = errorResponse.data.message;
				$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed!'});
				
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

		// Find existing Chapter
		$scope.findOne = function() {
			$scope.chapter = Chapters.get({ 
				chapterId: $stateParams.chapterId
			});
		};

		$scope.getChapterText = function(increment) {
			var chapter = $scope.chapters[0];
			
			$http.get('/chapters/' + chapter._id + '/next').success(
				function(data, status) {
					$scope.getRCVText(data.body);
			});

		};

		$scope.getRCVText = function(inputString) {
			var lsmAPIconfig = {
			  params: {
			    String: '\'John 1:1-9\'',
			    Out: 'json'
			  }
			};
			$http.get('http://api.lsm.org/recver.php', lsmAPIconfig).success(
				function(data, status) {
					$scope.chapterText = data;
			}).
		  	error( function(data, status, headers, config) {
		    	return new Error('Failed to load chapter: | ' + data.message);
		  	});

		}; 
	}

]);