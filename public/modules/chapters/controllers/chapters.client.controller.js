'use strict';

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.readingMode = false;
		$scope.planSegment = 0;
		$scope.plans = Plans.query({ 
			user: $scope.authentication.user._id
		});

		$scope.beginPlanPortion = function() {
			//check for day
			//$scope.plans[i].$update({startedPortion: new Date(Date.now()), portionEnd})
			$scope.chaptersToday = $scope.plans[0].$readToday();
			
			$scope.readingPace = 0;
			var i = $scope.planSegment;
			var chaptersInPortion = [];
			$scope.readingPace += $scope.plans[i].pace;
			for (var p = 0; p < $scope.plans[i].pace; p++) {
				if (p + $scope.plans[i].cursor < $scope.plans[i].endChapter) 
					chaptersInPortion.push(p + $scope.plans[i].cursor);
			}
			$scope.chaptersInPortion = chaptersInPortion;
			$http.get('/reference', {params: { chapterNumber: chaptersInPortion[0]}}).then(function(response) {
				$scope.currentChapter = response.data;
				$scope.moveChapter(0);
			});
			$scope.find();
		};

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
					$scope.user.lastChapter = response.name;
					$scope.user.$update(function(response) {
						$scope.currentChapter = response.name;
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
			
			/*
			var d = new Date(Date.now());
			var year = d.getFullYear();
			var month = d.getMonth();
			var day = d.getDate();
			console.log(new Date(year, month, day));
			$scope.chaptersToday = Chapters.query({created: {'lte': new Date(year, month, 25)}});
			*/
		};

		$scope.moveChapter = function(increment) {
			$scope.alerts = [];
			// IF we are in readingMode, the current chapter is unsaved, so save it
			if ($scope.readingMode && increment === 1) {
				$scope.create($scope.currentChapter).then( function() {
					$scope.getChapterText($scope.currentChapter, increment);
				}, function (err) {

				});

			} else $scope.getChapterText($scope.currentChapter, increment);
			
		};

		$scope.getChapterText = function(chapterName, increment) {
			$scope.readingMode = true;
			$scope.getRCVText(chapterName, increment).then(function (result) {
			    console.log(result);
			    $scope.currentChapter = result[0].data.verses[0].ref.split(':')[0];
				$scope.chapterTextArray = result;
			});
		};

		$scope.getRCVText = function(chapterName, increment) {
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

		$scope.open = function (size) {
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/plans/views/plan-modal.html',
			  controller: 'PlansController',
			  size: size,
			  resolve: {
			    plans: function () {
			    	return $scope.plans;
			    },
			    authentication: function () {
			    	return $scope.authentication;
			    }
			  }
			});

			modalInstance.result.then(function (plans) {
				$scope.plans = plans;
				if(plans) {
					$scope.beginPlanPortion();
				}

			}, function () {

			});
		};
	}

]);