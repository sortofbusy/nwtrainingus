'use strict';

angular.module('chapters').factory('ReadingPlan', ['$http', '$q', 'BibleText', 'Plans',
	function($http, $q, BibleText, Plans) {
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
					resolve(service.getChapterText());
				});
			};

		service.incrementPlan = function() {
				return $q( function(resolve) {
					var plan = plans[planSegment];
						// remove the current chapter from list to read
					chaptersInPortion.shift(); 
					
						//check if portion is complete
					if(chaptersInPortion.length === 0) {
						planSegment += 1;
						console.log('done reading ' + plan.name + ' today');
						if (planSegment === plans.length) {
							console.log('all reading plans finished for today!');
							///////
							// Show a 'keep reading' button
							//////
							planSegment = 0;
							resolve();
						} else {
							service.beginPlanPortion();
						}
					}
					resolve(service.getChapterText());
				}); 
			};

		service.addChapter = function(chapterId) {
			var plan = plans[planSegment];
			plan.cursor += 1;
			plan.chapters.push(chapterId);
			plan.$update(function(response) {
				plans[planSegment] = response;
			});
		};

		

		// Public API
		return service;
			
	}
]);