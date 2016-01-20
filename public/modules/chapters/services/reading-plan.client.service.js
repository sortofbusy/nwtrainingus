'use strict';

angular.module('chapters').factory('ReadingPlan', ['$http', '$q', 'BibleText', 'Plans', 'Badges',
	function($http, $q, BibleText, Plans, Badges) {
		var service = {};

		var plans = [];
		var planSegment = 0;
		var chaptersToday = [];
		var chaptersInPortion = [];
		var currentChapter= '';
		var keepReadingFlag = false;
		
		service.keepReading = function() {
			keepReadingFlag = true;
		};

		service.getCurrentPlan = function() {
				return plans[planSegment];
			};

		service.setPlans = function(_plans, _planSegment) {
				plans = _plans;
				planSegment = (_planSegment) ? _planSegment : planSegment;
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
					$http.get('/reference', {params: { chapterNumber: plans[planSegment].cursor}}).then(function(response) {
							currentChapter = response.data;
							resolve(BibleText.getChapterText(currentChapter, 0));
						});
				});
			};

		service.beginPlanPortion = function() {
				return $q( function(resolve) {
					// return if there are no plans
					if(!plans.length) {
						resolve();
						return;
					}
					resolve(service.getChapterText());
				});
			};

		service.incrementPlan = function() {
			return $q( function(resolve, reject) {
				plans[planSegment].$advance().then( function(response) {
					var plan = response;
						//check if portion is complete
					if(plan.chapters.length === plan.pace || plan.cursor >= plan.endChapter) {
						
						// check if plan is ended, resolve the plan
						if(plan.cursor > plan.endChapter) {
							resolve(plan);
							return;
						} 
						
						// otherwise, find the next unread plan
						var incompletePlan = service.incompletePlan();	
						
						// if all plans have been completed today
						if (incompletePlan === null) {
							// reset the active plan to the beginning, resolve
							planSegment = 0;
							resolve('portionRead');
							return;								
						} else { //  otherwise, read the next unread plan 
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

		service.incompletePlan = function() {
			for(var i = 0; i < plans.length; i++) {
				var planChaptersReadToday = plans[i].chapters ? plans[i].chapters.length : 0;
				if (planChaptersReadToday < plans[i].pace) {
					return i;
				}	
			}
			return null;
		};

		// Public API
		return service;
			
	}
]);