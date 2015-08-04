'use strict';

// Some module dependencies in \chapters\chapters.client.module.js

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans', 'BibleText',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans, BibleText) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.planSegment = 0;
		$scope.chaptersToday = [];
		$scope.plansTabs = [];
		$scope.readingMode = false;

				// Initialize controller
		$scope.init = function() {
			var userId = $scope.authentication.user._id;
			$scope.chapters = Chapters.query( {user: userId} );
			Plans.query({ 
				user: userId
			}, function(plans) {
				$scope.plans = plans;
				if(plans.length)
					$scope.beginPlanPortion();
			});
		};

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
				$scope.plansTabs[$scope.planSegment] = true;
				console.log('done reading ' + plan.name + ' today');
				if ($scope.planSegment === $scope.plans.length) {
					console.log('all reading plans finished for today!');
					///////
					// Show a 'keep reading' button
					//////
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
			$scope.plansTabs[$scope.planSegment] = true;
			$scope.beginPlanPortion();
		};

		// Create new Chapter
		$scope.create = function(params) {
			$scope.textPromise = $q(function(resolve) {
				
				// Create new Chapter object
				var chapter = new Chapters(params);
					// Add the current reading plan id if present
				if ($scope.plans) {
					chapter.plan = $scope.plans[$scope.planSegment]._id;
				}

				$scope.alerts = [];
				
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
			return $scope.textPromise;
		};

		// Create new Chapter
		$scope.submitChapterRange = function(name) {
			if(!$scope.range) return;

			var range = $scope.range.split('-');
			
			var rangeStart = range[0].trim();
			var rangeEnd = range[1];

			$scope.alerts = [];
				// if a range was entered
			if (rangeEnd) {
				rangeEnd = rangeEnd.trim();
				$http.get('/range', {params: { rangeStart: rangeStart, rangeEnd: rangeEnd}})
					.then(function (response) {
						var calls = [];
							for(var i= response.data.rangeStart; i < response.data.rangeEnd; i++) {
								calls.push($scope.create({absoluteChapter: i}));
							}
							$q.all(calls);
					}, function(err) {
						$scope.alerts.push({type: 'danger', msg: 'Range entry failed.', icon: 'times'});
					});
				// if only one chapter was entered
			} else {
				$scope.create({name: rangeStart});
			}
			$scope.range='';
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
				$scope.create({name: $scope.currentChapter}).then( function() {
					if($scope.plans) {
						$scope.incrementPlan();
					} else {
						BibleText.getChapterText($scope.currentChapter, increment)
							.then( function(result) {
								$scope.currentChapter = result[0].data.verses[0].ref.split(':')[0];
								$scope.chapterTextArray = result;
							});
					}
				}, function (err) {

				});

			} else BibleText.getChapterText($scope.currentChapter, increment)
							.then( function(result) {
								$scope.currentChapter = result[0].data.verses[0].ref.split(':')[0];
								$scope.chapterTextArray = result;
							});
			
		};

		$scope.openPlansModal = function (size) {
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
					$scope.beginPlanPortion();
				}

			}, function () {

			});
		};
	}

]);