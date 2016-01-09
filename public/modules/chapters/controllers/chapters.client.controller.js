'use strict';

// Some module dependencies in \chapters\chapters.client.module.js

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$uibModal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans', 'BibleText', 'ReadingPlan', '$sce', 'BibleRef',
	function($scope, $uibModal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans, BibleText, ReadingPlan, $sce, BibleRef) {
		$scope.loadingDefer = $q.defer();
		$scope.loadingPromise = $scope.loadingDefer.promise;
		$scope.loaded = false;
		$scope.optionsCollapsed = true;

		$scope.authentication = Authentication;
		
		$scope.completed = false;
		$scope.plans = null;
		$scope.plansTabs = [];

		$scope.bibleVersions = [
			{ language: 'Afrikaans', name: 'Ou Vertaling', code: 'aov' },
			{ language: 'Albanian', name: 'Albanian', code: 'albanian' },
			{ language: 'Amharic', name: 'Haile Selassie Amharic Bible', code: 'hsab' },
			{ language: 'Arabic', name: 'Smith and Van Dyke', code: 'arabicsv' },
			{ language: 'Chinese', name: 'NCV Traditional', code: 'cnt' },
			{ language: 'Chinese', name: 'Union Simplified', code: 'cus' },
			{ language: 'Chinese', name: 'NCV Simplified', code: 'cns' },
			{ language: 'Chinese', name: 'Union Traditional', code: 'cut' },
			{ language: 'Croatian', name: 'Croatian', code: 'croatia' },
			{ language: 'Danish', name: 'Danish', code: 'danish' },
			{ language: 'Dutch', name: 'Dutch Staten Vertaling', code: 'statenvertaling' },
			{ language: 'English', name: 'American Standard Version', code: 'asv' },
			{ language: 'English', name: 'Amplified Version', code: 'amp' },
			{ language: 'English', name: 'Basic English Bible', code: 'basicenglish' },
			{ language: 'English', name: 'Darby', code: 'darby' },
			{ language: 'English', name: 'King James Version', code: 'kjv' },
			{ language: 'English', name: 'KJV Easy Read', code: 'akjv' },
			{ language: 'English', name: 'New American Standard', code: 'nasb' },
			{ language: 'English', name: 'Recovery Version', code: 'rcv' },
			{ language: 'English', name: 'Young\'s Literal Translation', code: 'ylt' },
			{ language: 'English', name: 'World English Bible', code: 'web' },
			{ language: 'English', name: 'Webster\'s Bible', code: 'wb' },
			{ language: 'Esperanto', name: 'Esperanto', code: 'esperanto' },
			{ language: 'Estonian', name: 'Estonian', code: 'estonian' },
			{ language: 'Finnish', name: 'Finnish Bible (1776)', code: 'finnish1776' },
			{ language: 'French', name: 'Martin (1744)', code: 'martin' },
			{ language: 'German', name: 'Luther (1912)', code: 'luther1912' },
			{ language: 'Greek', name: 'Greek Modern', code: 'moderngreek' },
			{ language: 'Greek', name: 'Textus Receptus', code: 'text' },
			{ language: 'Hebrew', name: 'Aleppo Codex', code: 'aleppo' },
			{ language: 'Hungarian', name: 'Hungarian Karoli', code: 'karoli' },
			{ language: 'Italian', name: 'Giovanni Diodati Bible (1649)', code: 'giovanni' },
			{ language: 'Korean', name: 'Korean', code: 'korean' },
			{ language: 'Norwegian', name: 'Bibelselskap (1930)', code: 'bibelselskap' },
			{ language: 'Portuguese', name: 'Almeida Atualizada', code: 'almeida' },
			{ language: 'Russian', name: 'Synodal Translation (1876)', code: 'synodal' },
			{ language: 'Spanish', name: 'Reina Valera (1909)', code: 'valera' },
			{ language: 'Swahili', name: 'Swahili', code: 'swahili' },
			{ language: 'Swedish', name: 'Swedish (1917)', code: 'swedish' },
			{ language: 'Turkish', name: 'Turkish', code: 'turkish' },
			{ language: 'Vietnamese', name: 'Vietnamese (1934)', code: 'vietnamese' },
			{ language: 'Xhosa', name: 'Xhosa', code: 'xhosa' }
		];
		
				// Initialize controller
		$scope.init = function() {
			if (!$scope.authentication.user) return;
			
			$scope.user = new Users(Authentication.user);
			$scope.bibleTextStyle = {'font-size': 100 + ($scope.user.preferences.fontSize * 15) + '%'};
			
			Plans.query({ 
				user: $scope.authentication.user._id
			}, function(plans) {
				ReadingPlan.setPlans(plans, 0);
				if(plans[0])
					$scope.beginPlanPortion();
			});
			$scope.find();
		};

		$scope.beginPlanPortion = function() {
			$scope.completed = false;
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				if (response === 'completed') {
					$scope.completed = true;
				} 
				$scope.chapterText = response;
				$scope.find();
			});
		};

		$scope.incrementPlan = function(chapterId) {
				// advance the reading plan
			$scope.textPromise = ReadingPlan.incrementPlan(chapterId).then( function(response) {
					// the current plan's daily portion is completed
				if (response === 'completed') {
					$scope.completed = true;
				}
					// a just-finished Plan is returned
				if (response.created) {
					$scope.openBadgesModal();
					for (var i = 0; i < $scope.plans.length; i++) {
						if ($scope.plans[i]._id === response._id)
							$scope.plans.splice(i, 1);
					}

				}

				$scope.chapterText = response;
				$scope.plansTabs[ReadingPlan.getPlanSegment()] = true;
				$scope.find();
			});					
		};

		$scope.changePlan = function(index) {
			$scope.completed = false;
			ReadingPlan.setPlanSegment(index);
			$scope.plansTabs[index] = true;
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
			});
		};

		// Create new Chapter
		$scope.create = function(params) {
			$scope.textPromise = $q(function(resolve) {
				if(!params) params = {name: ReadingPlan.getCurrentChapter()};
					// Create new Chapter object
				var chapter = new Chapters(params);
				chapter.plan = ReadingPlan.getCurrentPlan()._id;
				
				$scope.alerts = [];
				
				chapter.$save(function(response) {
					$scope.incrementPlan(response._id);

					$scope.alerts.push({type: 'success', msg: 'Chapter entered', icon: 'check-square-o'});
					resolve();
				}, function(errorResponse) {
					$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed', icon: 'times'});
					resolve();
				});
			});
			return $scope.textPromise;
		};

		// Find a list of Chapters
		$scope.find = function(userId) {
			if(!userId) userId = $scope.authentication.user._id;
			Plans.query({ 
				user: userId
			}, function(plans) {
				if (!$scope.loaded) 
					$scope.loadingDefer.resolve();
				$scope.loaded = true;
				$scope.plans = plans;
			}, function(error) {
				if (!$scope.loaded) 
					$scope.loadingDefer.resolve();
				$scope.loaded = true;
			});
			
		};

		$scope.moveChapter = function(increment) {
			$scope.chapterText = null;
			$scope.create({name: ReadingPlan.getCurrentChapter()});
		};

		$scope.sceTrust = function(input) {
			return $sce.trustAsHtml(input);
		};

		$scope.share = function(input) {
			/*var params = {
				message: input,
				accessToken: $scope.user.additionalProvidersData.facebook.accessToken,
			};*/
			/*$http.post('https://graph.facebook.com/v2.4/me/feed', params).then(function(response) {
				console.log(response);
			});*/
		};

		$scope.openMessagesModal = function (inputstring, verse) {
			var modalInstance = $uibModal.open({
			  animation: true,
			  templateUrl: 'modules/messages/views/message-modal.client.view.html',
			  controller: 'MessagesModalController',
			  size: 'md',
			  resolve: {
			    verse: function () {
			    	verse.inputstring = inputstring;
			    	return verse;
			    }
			  }
			});
		};

		$scope.openBadgesModal = function (size) {
			var modalInstance = $uibModal.open({
			  animation: true,
			  templateUrl: 'modules/badges/views/badge-modal.html',
			  controller: 'BadgesModalController',
			  size: 'md',
			});
		};

		$scope.textResize = function(direction) {
			var sizes = [0, 1, 2];
			var size = $scope.user.preferences.fontSize;
			if((direction === 1 && size < 2) || (direction === -1 && size > 0)) {
				$scope.user.preferences.fontSize += direction;
				$scope.bibleTextStyle = {'font-size': 100 + ($scope.user.preferences.fontSize * 15) + '%'};
				$scope.user.$update();
			console.log('here');
			}
		};

		$scope.updateVersion = function() {
			$scope.user.$update().then(function() {
				$scope.init();
				$scope.optionsCollapsed = true;
			});
			
		};
	}

]);