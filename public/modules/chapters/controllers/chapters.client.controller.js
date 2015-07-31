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
		$scope.chaptersToday = [];
		$scope.plansTabs = [];
		

		$scope.beginPlanPortion = function() {
			$scope.readingPace = 0;
			var chaptersInPortion = [];
			
			var i = $scope.planSegment;
			var planChaptersReadToday = $scope.plans[i].chapters ? $scope.plans[i].chapters.length : 0;
			
				//if less than {pace} chapters have been read today
			if (planChaptersReadToday < $scope.plans[i].pace) {
				$scope.readingPace += $scope.plans[i].pace;
					//fill in the amount of chapters in {pace} minus what's already read
				for (var p = 0; p < $scope.plans[i].pace - planChaptersReadToday; p++) {
						//if we're not at the end of the plan, add a chapter
					if (p + $scope.plans[i].cursor < $scope.plans[i].endChapter) 
						chaptersInPortion.push(p + $scope.plans[i].cursor);
				}
				$scope.chaptersInPortion = chaptersInPortion;
				
				// if the plan segment has already been read today.
			} else {
				for (var k = $scope.plans[i].cursor; k <= $scope.plans[i].endChapter; k++) {
					chaptersInPortion.push(k);
				}
				$scope.chaptersInPortion = chaptersInPortion;
			}
				//load the text of the first chapter
			$http.get('/reference', {params: { chapterNumber: chaptersInPortion[0]}}).then(function(response) {
				$scope.currentChapter = response.data;
				$scope.moveChapter(0);
			});

			$scope.find();
		};

		$scope.incrementPlan = function() {
			var plan = $scope.plans[$scope.planSegment];
			
				// remove the current chapter from list to read
			$scope.chaptersInPortion.shift(); 
			
				//check if portion is complete
			if($scope.chaptersInPortion.length === 0) {
				$scope.planSegment += 1;
				console.log('done reading ' + plan.name + ' today');
				if ($scope.planSegment === $scope.plans.length) {
					console.log('all reading plans finished for today!');
					$scope.planSegment = 0;
				} else {
					$scope.beginPlanPortion();
				}
				
			} else {
				$http.get('/reference', {params: { chapterNumber: $scope.chaptersInPortion[0]}}).then(function(response) {
					$scope.currentChapter = response.data;
					$scope.getChapterText($scope.currentChapter, 0);
				});
			}

			//if (plan.cursor === ;
		};

		$scope.changePlan = function(index) {
			$scope.planSegment = index;
			$scope.beginPlanPortion();
		};

		// Create new Chapter
		$scope.create = function(name) {
			return $q(function(resolve) {
				if (!name) name = $scope.name;
				
				// Create new Chapter object
				var chapter = new Chapters ({
					name: name
				});
					// Add the current reading plan id if present
				if ($scope.plans) {
					chapter.plan = $scope.plans[$scope.planSegment]._id;
				}

				$scope.alerts = [];
				// Redirect after save
				chapter.$save(function(response) {
					if($scope.plans) {
						var plan = $scope.plans[$scope.planSegment];
							// increment plan cursor, add chapter to plan.chapters
						plan.cursor += 1;
						plan.chapters.push(response._id);
						plan.$update();
					}

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
			Plans.query({ 
				user: userId
			}, function(plans) {
				console.log(plans[$scope.planSegment].chapters);
				$scope.plans = plans;
				
			});
		};

		$scope.moveChapter = function(increment) {
			$scope.alerts = [];
			// IF we are in readingMode, the current chapter is unsaved, so save it
			if ($scope.readingMode && increment === 1) {
				$scope.create($scope.currentChapter).then( function() {
					if($scope.plans) {
						$scope.incrementPlan();
					} else {
						$scope.getChapterText($scope.currentChapter, increment);
					}
				}, function (err) {

				});

			} else $scope.getChapterText($scope.currentChapter, increment);
			
		};

		$scope.getChapterText = function(chapterName, increment) {
			$scope.readingMode = true;
			$scope.getRCVText(chapterName, increment).then(function (result) {
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
					$scope.planSegment = 0;
					//$scope.beginPlanPortion();
				}

			}, function () {

			});
		};
	}

]);