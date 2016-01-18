'use strict';

angular.module('chapters').factory('ReadingPlan', ['$http', '$q', 'BibleText', 'Plans', 'Badges',
	function($http, $q, BibleText, Plans, Badges) {
		var service = {};

		var plans = [];
		var planSegment = 0;
		var chaptersToday = [];
		var readingPace = 0;
		var chaptersInPortion = [];
		var currentChapter= '';

		service.getCurrentPlan = function() {
				return plans[planSegment];
			};

		service.setPlans = function(_plans, _planSegment) {
				plans = _plans;
				planSegment = (_planSegment) ? _planSegment : 0;
			};

		service.getPlans = function() {
			return plans;
		};

		service.getPlanSegment = function() {
			return planSegment;
		};

		service.setPlanSegment = function(_planSegment) {
			planSegment = _planSegment;
		};

		service.getCurrentChapter = function() {
			return currentChapter;
		};

		service.getChapterText = function() {
				return $q( function(resolve) {
					$http.get('/reference', {params: { chapterNumber: chaptersInPortion[0]}}).then(function(response) {
							currentChapter = response.data;
							resolve(BibleText.getChapterText(currentChapter, 0));
						});
				});
			};

		service.beginPlanPortion = function() {
				return $q( function(resolve) {
					if(!plans.length) {
						resolve();
						return;
					}
					readingPace = 0;
					chaptersInPortion = [];
					
					var i = planSegment;
					var planChaptersReadToday = plans[i].chapters ? plans[i].chapters.length : 0;
					
						//if less than {pace} chapters have been read today
					if (planChaptersReadToday < plans[i].pace) {
						readingPace += plans[i].pace;
							//fill in the amount of chapters in {pace} minus what's already read
						for (var p = 0; p < plans[i].pace - planChaptersReadToday; p++) {
								//if we're not at the end of the plan, add a chapter
							if (p + plans[i].cursor < plans[i].endChapter) 
								chaptersInPortion.push(p + plans[i].cursor);
						}

						// if the plan segment has already been read today, fill chaptersInPortion with all remaining
						// chapters in the plan
					} else {
						for (var k = plans[i].cursor; k <= plans[i].endChapter; k++) {
							chaptersInPortion.push(k);
						}
					}
						// if we're beginning a portion but it's been completed (manual input)
					if (chaptersInPortion.length === 0) {
						
						resolve('completed');
						return;
					}
					resolve(service.getChapterText());
				});
			};

		service.incompletePlan = function() {
			for(var i = 0; i < plans.length; i++) {
				var planChaptersReadToday = plans[i].chapters ? plans[i].chapters.length : 0;
				if (planChaptersReadToday < plans[i].pace) {
					return i;
				}	
			}
			return null;
		};

		service.planEnded = function() {
			var plan = angular.copy(plans[planSegment]);
			if(plan.cursor >= plan.endChapter) {
				var badge = new Badges({
					name: plan.name,
					created: plan.created,
					user: plan.user,
					startChapter: plan.startChapter,
					endChapter: plan.endChapter
				});
				badge.$save();
				return true;
			}
			return false;
		};

		service.incrementPlan = function() {
				return $q( function(resolve, reject) {
					plans[planSegment].$advance().then( function() {
						var plan = plans[planSegment];
							// remove the current chapter from list to read
						chaptersInPortion.shift(); 
							//check if portion is complete
						if(chaptersInPortion.length === 0) {
							var incompletePlan = service.incompletePlan();	
							
								// check if plan is ended
							if(service.planEnded()) {
								var newPlan = angular.copy(plan);
								plans.splice(planSegment, 1);
								planSegment = service.incompletePlan();
								newPlan.$remove().then(function(newPlan) {
									resolve(newPlan);
								});
								return;
							} else 
								planSegment += 1;
							
							if (incompletePlan === null) {
								///////
								// Show a 'keep reading' button
								//////
								
								planSegment = 0;
								resolve('completed');
								return;								
							} else {
								if(incompletePlan !== null)
									planSegment = incompletePlan;
								resolve(service.beginPlanPortion());
								return;
							}
						}
						resolve(service.getChapterText());
					}, function (err) {
						reject(err.data.message);
					});
				}); 
			};

		// Public API
		return service;
			
	}
]);