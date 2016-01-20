'use strict';

// Some module dependencies in \chapters\chapters.client.module.js

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$rootScope', '$scope', '$uibModal', 
		'$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', 
		'$q', 'Plans', 'BibleText', 'ReadingPlan', '$sce', 'BibleRef', 'Badges',
		'$anchorScroll',
	
	function($rootScope, $scope, $uibModal, $http, $stateParams, $location, Authentication, 
		Chapters, Users, $q, Plans, BibleText, ReadingPlan, $sce, BibleRef, Badges, $anchorScroll) {
		
		$scope.loaded = false;
		$scope.optionsCollapsed = true;

		$scope.authentication = Authentication;
		
		// If user is not signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/');
		
		$scope.portionRead = false;
		$scope.keepReading = false;
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
			$scope.portionRead = false;
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
				$scope.find();
				$anchorScroll();
			}, function(err) {
				$scope.alerts.push({type: 'danger', msg: 'Error reading chapter', icon: 'times'});
			});
		};

		$scope.incrementPlan = function() {
				// advance the reading plan
			$scope.textPromise = ReadingPlan.incrementPlan().then( function(response) {
					// the current plan's daily portion is completed
				if (response === 'portionRead') {
					$scope.portionRead = true;
				}
					// a just-finished Plan is returned
				if (response.created) {
					
					// create a new Badge with the information from the finished Plan
					var badge = new Badges({
						name: response.name,
						began: response.created,
						user: response.user,
						startChapter: response.startChapter,
						endChapter: response.endChapter
					});
					// after saving the Badge, display it to the user
					badge.$save(function(newBadge){
						$scope.openBadgesModal(newBadge);

						// remove the finished plan
						response.$remove(function() {
							$scope.init();
						});
					});
				} else { // otherwise, display the text, set the active planTab
					$scope.chapterText = response;
					$scope.plansTabs[ReadingPlan.getPlanSegment()] = true;
					$scope.find();
					$anchorScroll();
				}
			}, function(err) {
				$scope.alerts.push({type: 'danger', msg: 'Error advancing plan', icon: 'times'});
			});					
		};

		$scope.keepReading = function() {
			ReadingPlan.keepReading();
			$scope.beginPlanPortion();
		};

		$scope.changePlan = function(index) {
			$scope.portionRead = false;
			ReadingPlan.setPlanSegment(index);
			$scope.plansTabs[index] = true;
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
				$anchorScroll();
			});
		};

		// Find a list of Chapters
		$scope.find = function(userId) {
			if(!userId) userId = $scope.authentication.user._id;
			Plans.query({ 
				user: userId
			}, function(plans) {
				$scope.loaded = true;
				$scope.plans = plans;
			}, function(error) {
				$scope.loaded = true;
			});
			
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

		$scope.openBadgesModal = function (badge) {
			var modalInstance = $uibModal.open({
			  animation: true,
			  templateUrl: 'modules/badges/views/badge-modal.html',
			  controller: 'BadgesModalController',
			  size: 'md',
			  resolve: {
			    badge: function () {
			    	return badge;
			    }
			  }
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

		$scope.closeAlert = function(index){
		    $scope.alerts.splice(index, 1);
		};
	}

]);