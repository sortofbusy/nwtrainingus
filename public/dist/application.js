'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'lettheword';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngTouch',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('badges');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('chapters', ['cgBusy']);
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('plans');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('badges').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Badges', 'badges', 'dropdown', '/badges(/create)?');
		Menus.addSubMenuItem('topbar', 'badges', 'List Badges', 'badges');
		Menus.addSubMenuItem('topbar', 'badges', 'New Badge', 'badges/create');
	}
]);
'use strict';

//Setting up route
angular.module('badges').config(['$stateProvider',
	function($stateProvider) {
		// Badges state routing
		$stateProvider.
		state('listBadges', {
			url: '/badges',
			templateUrl: 'modules/badges/views/list-badges.client.view.html'
		}).
		state('createBadge', {
			url: '/badges/create',
			templateUrl: 'modules/badges/views/create-badge.client.view.html'
		}).
		state('viewBadge', {
			url: '/badges/:badgeId',
			templateUrl: 'modules/badges/views/view-badge.client.view.html'
		}).
		state('editBadge', {
			url: '/badges/:badgeId/edit',
			templateUrl: 'modules/badges/views/edit-badge.client.view.html'
		});
	}
]);
'use strict';

// Badges controller
angular.module('badges').controller('BadgesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Badges',
	function($scope, $stateParams, $location, Authentication, Badges) {
		$scope.authentication = Authentication;
		

		// Create new Badge
		$scope.create = function() {
			// Create new Badge object
			var badge = new Badges ({
				name: this.name
			});

			// Redirect after save
			badge.$save(function(response) {
				$location.path('badges/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Badge
		$scope.remove = function(badge) {
			if ( badge ) { 
				badge.$remove();

				for (var i in $scope.badges) {
					if ($scope.badges [i] === badge) {
						$scope.badges.splice(i, 1);
					}
				}
			} else {
				$scope.badge.$remove(function() {
					$location.path('badges');
				});
			}
		};

		// Update existing Badge
		$scope.update = function() {
			var badge = $scope.badge;

			badge.$update(function() {
				$location.path('badges/' + badge._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Badges
		$scope.find = function() {
			$scope.badges = Badges.query({user: $scope.authentication.user._id});
		};

		// Find existing Badge
		$scope.findOne = function() {
			$scope.badge = Badges.get({ 
				badgeId: $stateParams.badgeId
			});
		};

	}
]);

// Badges controller
angular.module('badges').controller('BadgesModalController', ['$scope', '$modalInstance', 'Authentication', 'Badges',
	function($scope, $modalInstance, Authentication, Badges) {
		$scope.authentication = Authentication;
		$scope.badges = [];

		// Find a list of Badges
		$scope.find = function() {
			Badges.query({user: $scope.authentication.user._id}, function(result) {
				$scope.badges.push(result[0]);
			});
		};

		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.find();
	}
]);
'use strict';

//Badges service used to communicate Badges REST endpoints
angular.module('badges').factory('Badges', ['$resource',
	function($resource) {
		return $resource('badges/:badgeId', { badgeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('chapters').config(['$stateProvider',
	function($stateProvider) {
		// Chapters state routing
		$stateProvider.
		state('listChapters', {
			url: '/chapters',
			templateUrl: 'modules/chapters/views/list-chapters.client.view.html'
		}).
		state('createChapter', {
			url: '/chapters/create',
			templateUrl: 'modules/chapters/views/create-chapter.client.view.html'
		}).
		state('viewChapter', {
			url: '/chapters/:chapterId',
			templateUrl: 'modules/chapters/views/view-chapter.client.view.html'
		}).
		state('editChapter', {
			url: '/chapters/:chapterId/edit',
			templateUrl: 'modules/chapters/views/edit-chapter.client.view.html'
		});
	}
]);
'use strict';

// Some module dependencies in \chapters\chapters.client.module.js

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans', 'BibleText', 'ReadingPlan', '$sce', 'BibleRef',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans, BibleText, ReadingPlan, $sce, BibleRef) {
		$scope.loadingDefer = $q.defer();
		$scope.loadingPromise = $scope.loadingDefer.promise;
		$scope.loaded = false;

		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.completed = false;
		$scope.plans = null;
		$scope.plansTabs = [];
		
				// Initialize controller
		$scope.init = function() {
			if (!$scope.authentication.user) return;
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

		// Create new range of Chapters
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
			var params = {
				message: input,
				accessToken: $scope.user.additionalProvidersData.facebook.accessToken,
			};
			/*$http.post('https://graph.facebook.com/v2.4/me/feed', params).then(function(response) {
				console.log(response);
			});*/
		};

		$scope.openPlansModal = function (size) {
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/plans/views/plan-modal.html',
			  controller: 'PlansController',
			  size: size,
			  resolve: {
			    plans: function () {
			    	return ReadingPlan.getPlans();
			    },
			    authentication: function () {
			    	return $scope.authentication;
			    }
			  }
			});

			modalInstance.result.then(function (plans) {
				ReadingPlan.setPlans(plans);
				if(plans) 
					$scope.beginPlanPortion();
			}, function () {

			});
		};

		$scope.openBadgesModal = function (size) {
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/badges/views/badge-modal.html',
			  controller: 'BadgesModalController',
			  size: 'md',
			});
		};
	}

]);
'use strict';

angular.module('chapters').directive('mydirNavChapter', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'modules/chapters/views/nav-chapter.html'
		};
	}
]);
'use strict';

angular.module('chapters').directive('mydirSelectBible', [
	function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				refBook: '=refBook',
				refChapter: '=refChapter'
			},
			templateUrl: 'modules/chapters/views/select-bible.html'
		};
	}
]);
'use strict';

angular.module('chapters').directive('mydirShowChapterText', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'modules/chapters/views/show-chapter-text.html',
			
		};
	}
]);
'use strict';

angular.module('chapters').directive('stateLoadingIndicator', ['$rootScope',
	function($rootScope) {
		return {
		    restrict: 'E',
		    template: '<div data-ng-show="isStateLoading" class="loading-indicator">' +
		    '<div class="loading-indicator-body">' +
		    '<h3 class="loading-title">Loading...</h3>' +
		    '<div class="spinner"><i class="fa fa-spin fa-spinner"></i></div>' +
		    '</div>' +
		    '</div>',
		    replace: true,
		    link: function(scope, elem, attrs) {
		      scope.isStateLoading = false;
		 
		      $rootScope.$on('$stateChangeStart', function() {
		        scope.isStateLoading = true;
		      });
		      $rootScope.$on('$stateChangeSuccess', function() {
		        scope.isStateLoading = false;
		      });
		    }
		};
	}
]);
'use strict';

angular.module('chapters').factory('BibleRef', [
	function() {
		// Bible ref service logic
		var service = {};

		service.books = [
		    { name: 'Genesis',
		    chapters: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26]},
		    { name: 'Exodus',
		    chapters: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38]},
		    { name: 'Leviticus',
		    chapters: [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34]},
		    { name: 'Numbers',
		    chapters: [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13]},
		    { name: 'Deuteronomy',
		    chapters: [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12]},
		    { name: 'Joshua',
		    chapters: [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33]},
		    { name: 'Judges',
		    chapters: [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25]},
		    { name: 'Ruth',
		    chapters: [22,23,18,22]},
		    { name: '1 Samuel',
		    chapters: [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13]},
		    { name: '2 Samuel',
		    chapters: [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25]},
		    { name: '1 Kings',
		    chapters: [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53]},
		    { name: '2 Kings',
		    chapters: [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30]},
		    { name: '1 Chronicles',
		    chapters: [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30]},
		    { name: '2 Chronicles',
		    chapters: [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23]},
		    { name: 'Ezra',
		    chapters: [11,70,13,24,17,22,28,36,15,44]},
		    { name: 'Nehemiah',
		    chapters: [11,20,32,23,19,19,73,18,38,39,36,47,31]},
		    { name: 'Esther',
		    chapters: [22,23,15,17,14,14,10,17,32,3]},
		    { name: 'Job',
		    chapters: [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17]},
		    { name: 'Psalm',
		    chapters: [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6]},
		    { name: 'Proverbs',
		    chapters: [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31]},
		    { name: 'Ecclesiastes',
		    chapters: [18,26,22,16,20,12,29,17,18,20,10,14]},
		    { name: 'Song of Solomon',
		    chapters: [17,17,11,16,16,13,13,14]},
		    { name: 'Isaiah',
		    chapters: [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24]},
		    { name: 'Jeremiah',
		    chapters: [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34]},
		    { name: 'Lamentations',
		    chapters: [22,22,66,22,22]},
		    { name: 'Ezekiel',
		    chapters: [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35]},
		    { name: 'Daniel',
		    chapters: [21,49,30,37,31,28,28,27,27,21,45,13]},
		    { name: 'Hosea',
		    chapters: [11,23,5,19,15,11,16,14,17,15,12,14,16,9]},
		    { name: 'Joel',
		    chapters: [20,32,21]},
		    { name: 'Amos',
		    chapters: [15,16,15,13,27,14,17,14,15]},
		    { name: 'Obadiah',
		    chapters: [21]},
		    { name: 'Jonah',
		    chapters: [17,10,10,11]},
		    { name: 'Micah',
		    chapters: [16,13,12,13,15,16,20]},
		    { name: 'Nahum',
		    chapters: [15,13,19]},
		    { name: 'Habakkuk',
		    chapters: [17,20,19]},
		    { name: 'Zephaniah',
		    chapters: [18,15,20]},
		    { name: 'Haggai',
		    chapters: [15,23]},
		    { name: 'Zechariah',
		    chapters: [21,13,10,14,11,15,14,23,17,12,17,14,9,21]},
		    { name: 'Malachi',
		    chapters: [14,17,18,6]},
		    { name: 'Matthew',
		    chapters: [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20]},
		    { name: 'Mark',
		    chapters: [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20]},
		    { name: 'Luke',
		    chapters: [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53]},
		    { name: 'John',
		    chapters: [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25]},
		    { name: 'Acts',
		    chapters: [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31]},
		    { name: 'Romans',
		    chapters: [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27]},
		    { name: '1 Corinthians',
		    chapters: [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24]},
		    { name: '2 Corinthians',
		    chapters: [24,17,18,18,21,18,16,24,15,18,33,21,14]},
		    { name: 'Galatians',
		    chapters: [24,21,29,31,26,18]},
		    { name: 'Ephesians',
		    chapters: [23,22,21,32,33,24]},
		    { name: 'Philippians',
		    chapters: [30,30,21,23]},
		    { name: 'Colossians',
		    chapters: [29,23,25,18]},
		    { name: '1 Thessalonians',
		    chapters: [10,20,13,18,28]},
		    { name: '2 Thessalonians',
		    chapters: [12,17,18]},
		    { name: '1 Timothy',
		    chapters: [20,15,16,16,25,21]},
		    { name: '2 Timothy',
		    chapters: [18,26,17,22]},
		    { name: 'Titus',
		    chapters: [16,15,15]},
		    { name: 'Philemon',
		    chapters: [25]},
		    { name: 'Hebrews',
		    chapters: [14,18,19,16,14,20,28,13,28,39,40,29,25]},
		    { name: 'James',
		    chapters: [27,26,18,17,20]},
		    { name: '1 Peter',
		    chapters: [25,25,22,19,14]},
		    { name: '2 Peter',
		    chapters: [21,22,18]},
		    { name: '1 John',
		    chapters: [10,29,24,21,21]},
		    { name: '2 John',
		    chapters: [13]},
		    { name: '3 John',
		    chapters: [14]},
		    { name: 'Jude',
		    chapters: [25]},
		    { name: 'Revelation',
		    chapters: [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21]}
		];

		service.chapterNameFromId = function(chapterId) {
			var chaptersRemaining = chapterId;
		    for (var i = 0; i < service.books.length; i++) {
			    var chaptersInNextBook = service.books[i].chapters.length;
		    	if (chaptersRemaining - chaptersInNextBook > 0)
		    		chaptersRemaining -= chaptersInNextBook;
		    	else {
		        	return service.books[i].name + ' ' + chaptersRemaining;
				}
			}
			return 'Chapter not recognized.';
		};

		service.chapterIdFromName = function(chapterName) {
			var chapterParts = chapterName.split(' ');
				// handle ordinals
			if (chapterParts.length > 2) {
				chapterParts[0] += ' ' + chapterParts[1];
				chapterParts[1] = chapterParts[2]; 
			}
			var chapters = 0;
		    for (var i = 0; i < service.books.length; i++) {
			    if (service.books[i].name === chapterParts[0]) {
		    		var returnValue = chapters + Number(chapterParts[1]);
		    		if (returnValue > 0 && returnValue <= 1189) {
		    			return returnValue;
		    		} else 
		    			break;
		    	} else 
		        	chapters += service.books[i].chapters.length;
			}
			return 'Chapter not recognized.';
		};

		// Public API
		return service;
	}
]);
'use strict';

angular.module('chapters').factory('BibleText', [ '$q', '$http', 'Authentication',
	function($q, $http, Authentication) {
		var bibleVersions = [
			{ language: 'Afrikaans', name: 'Ou Vertaling', code: 'aov'},
			{ language: 'Albanian', name: 'Albanian', code: 'albanian'},
			{ language: 'Amharic', name: 'Haile Selassie Amharic Bible', code: 'hsab'},
			{ language: 'Arabic', name: 'Smith and Van Dyke', code: 'arabicsv'},
			{ language: 'Chinese', name: 'NCV Traditional', code: 'cnt'},
			{ language: 'Chinese', name: 'Union Simplified', code: 'cus'},
			{ language: 'Chinese', name: 'NCV Simplified', code: 'cns'},
			{ language: 'Chinese', name: 'Union Traditional', code: 'cut'},
			{ language: 'Croatian', name: 'Croatian', code: 'croatia'},
			{ language: 'Danish', name: 'Danish', code: 'danish'},
			{ language: 'Dutch', name: 'Dutch Staten Vertaling', code: 'statenvertaling'},
			{ language: 'English', name: 'American Standard Version', code: 'asv'},
			{ language: 'English', name: 'Amplified Version', code: 'amp'},
			{ language: 'English', name: 'Basic English Bible', code: 'basicenglish'},
			{ language: 'English', name: 'Darby', code: 'darby'},
			{ language: 'English', name: 'King James Version', code: 'kjv'},
			{ language: 'English', name: 'KJV Easy Read', code: 'akjv'},
			{ language: 'English', name: 'New American Standard', code: 'nasb'},
			{ language: 'English', name: 'Recovery Version', code: 'rcv'},
			{ language: 'English', name: 'Young\'s Literal Translation', code: 'ylt'},
			{ language: 'English', name: 'World English Bible', code: 'web'},
			{ language: 'English', name: 'Webster\'s Bible', code: 'wb'},
			{ language: 'Esperanto', name: 'Esperanto', code: 'esperanto'},
			{ language: 'Estonian', name: 'Estonian', code: 'estonian'},
			{ language: 'Finnish', name: 'Finnish Bible (1776)', code: 'finnish1776'},
			{ language: 'French', name: 'Martin (1744)', code: 'martin'},
			{ language: 'German', name: 'Luther (1912)', code: 'luther1912'},
			{ language: 'Greek', name: 'Greek Modern', code: 'moderngreek'},
			{ language: 'Greek', name: 'Textus Receptus', code: 'text'},
			{ language: 'Hebrew', name: 'Aleppo Codex', code: 'aleppo'},
			{ language: 'Hungarian', name: 'Hungarian Karoli', code: 'karoli'},
			{ language: 'Italian', name: 'Giovanni Diodati Bible (1649)', code: 'giovanni'},
			{ language: 'Korean', name: 'Korean', code: 'korean'},
			{ language: 'Norwegian', name: 'Bibelselskap (1930)', code: 'bibelselskap'},
			{ language: 'Portuguese', name: 'Almeida Atualizada', code: 'almeida'},
			{ language: 'Russian', name: 'Synodal Translation (1876)', code: 'synodal'},
			{ language: 'Spanish', name: 'Reina Valera (1909)', code: 'valera'},
			{ language: 'Swahili', name: 'Swahili', code: 'swahili'},
			{ language: 'Swedish', name: 'Swedish (1917)', code: 'swedish'},
			{ language: 'Turkish', name: 'Turkish', code: 'turkish'},
			{ language: 'Vietnamese', name: 'Vietnamese (1934)', code: 'vietnamese'},
			{ language: 'Xhosa', name: 'Xhosa', code: 'xhosa'}
		];

		var getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment}})
					.then(					
							// get an array of calls since the RcV API only returns 30 verses / call
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
							$q.all(calls).then(function (result) {
						    		//combine all verses into one array
						    	var combined = {};
						    	combined.verses = [];
						    	combined.inputstring = result[0].data.inputstring.split(':')[0];
						    	for (var i = 0; i < result.length; i++) {
						    		combined.verses = combined.verses.concat(result[i].data.verses);
						    	}
						    	
						    		// replace chars for HTML output
						    	for (i = 0; i < combined.verses.length; i++) {
						    		combined.verses[i].text = combined.verses[i].text.split('[').join('<i>');
						    		combined.verses[i].text = combined.verses[i].text.split(']').join('</i>');
						    		combined.verses[i].ref = combined.verses[i].ref.split(':')[1];
						    	}
						    	
						    	combined.copyright = result[0].data.copyright;
						    	
						    	resolve(combined);
							}, function(error) {
								resolve(error);
							});
						});
				
			});
		};

		var getGetBibleText = function(chapterName, version) {
			return $q(function(resolve) {
				$http.jsonp('https://getbible.net/json', {params: { scripture: chapterName, v: version, callback: 'JSON_CALLBACK'}})
					.then(					
						function (response) {
							var json = response.data;
							
								// search for version in bibleVersions array
							var userVersion = {};
							userVersion.version = version;
							for (var b=0; b < bibleVersions.length; b++) {
						        if (bibleVersions[b].code === version) {
						            userVersion = bibleVersions[b];
						        }
						    }

							var combined = {};
							combined.verses = [];
							try {
							combined.inputstring = json.book_name + ' ' + json.chapter_nr;
								for (var i in json.chapter) {
									combined.verses.push({ref: json.chapter[i].verse_nr, text: json.chapter[i].verse});
								}
							} catch (e) {
								resolve(e);
								return;
							}
							combined.copyright = userVersion.name + ' [' + userVersion.language + '] text from getbible.net.';
							resolve(combined);
						}, function(error) {
							resolve(error);
						});
				
			});
		};

		// Public API - eventually this will call other providers
		return {
			getChapterText: function(chapterName, increment) {
				var version = Authentication.user.preferences.version;
				if (version === 'rcv') {
					return $q(function(resolve) {
						resolve(getRCVText(chapterName, increment));
					});
				} else {
					return $q(function(resolve) {
						resolve(getGetBibleText(chapterName, version));
					});
				}
			}
		};
	}
]);
'use strict';
		
//Chapters service used to communicate Chapters REST endpoints
angular.module('chapters').factory('Chapters', ['$resource', '$http', '$q',
	function($resource, $http, $q) {
		var chapterFactory = $resource('chapters/:chapterId', { chapterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});

		

		return chapterFactory;
	}
]);
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

		service.incrementPlan = function(chapterId) {
				return $q( function(resolve) {
					service.addChapter(chapterId).then( function() {
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
							
							console.log('done reading ' + plan.name + ' today, going to plan # ' + planSegment);
							
							
							if (incompletePlan === null) {

								console.log('all reading plans finished for today!');
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
					});
				}); 
			};

		service.addChapter = function(chapterId) {
			return $q( function(resolve) {
				var plan = plans[planSegment];
				plan.cursor += 1;
				plan.chapters.push(chapterId);
				plan.$update(function(response) {
					plans[planSegment] = response;
					resolve();
				});
			});
		};

		// Public API
		return service;
			
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';
/*
// Configuring the Articles module
angular.module('plans').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Plans', 'plans', 'dropdown', '/plans(/create)?');
		Menus.addSubMenuItem('topbar', 'plans', 'List Plans', 'plans');
		Menus.addSubMenuItem('topbar', 'plans', 'New Plan', 'plans/create');
	}
]);*/
'use strict';

//Setting up route
angular.module('plans').config(['$stateProvider',
	function($stateProvider) {
		// Plans state routing
		$stateProvider.
		state('listPlans', {
			url: '/plans',
			templateUrl: 'modules/plans/views/list-plans.client.view.html'
		}).
		state('createPlan', {
			url: '/plans/create',
			templateUrl: 'modules/plans/views/create-plan.client.view.html'
		}).
		state('viewPlan', {
			url: '/plans/:planId',
			templateUrl: 'modules/plans/views/view-plan.client.view.html'
		}).
		state('editPlan', {
			url: '/plans/:planId/edit',
			templateUrl: 'modules/plans/views/edit-plan.client.view.html'
		});
	}
]);
'use strict';

// Plans controller
angular.module('plans').controller('PlansControllerCrud', ['$scope', '$modal', '$stateParams', '$location', 'Authentication', 'Plans', '$window',
	function($scope, $modal, $stateParams, $location, Authentication, Plans, $window) {
		$scope.authentication = Authentication;
		Plans.query({ 
				user: $scope.authentication.user._id
		}).$promise.then( function(response) {
			$scope.plans = response;
		});
		
		
		// Create new Plan
		$scope.create = function() {
			// Create new Plan object
			var plan = new Plans ({
				name: this.name
			});

			plan.$save(function(response) {
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Update existing Plan
		$scope.update = function() {
			var plan = $scope.plan;

			plan.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Plans
		$scope.find = function() {
			$scope.plans = Plans.query({ 
				user: $scope.authentication.user._id
			});
		};

		// Find existing Plan
		$scope.findOne = function() {
			$scope.plan = Plans.get({ 
				planId: $stateParams.planId
			});
		};
	}
]);

angular.module('plans').controller('PlansController', ["$scope", "$http", "$modalInstance", "plans", "authentication", "Plans", "$window", "BibleRef", function ($scope, $http, $modalInstance, plans, authentication, Plans, $window, BibleRef) {
	$scope.plans = plans;
	$scope.authentication = authentication;
	$scope.selected = {
		item: null
	};
	$scope.alerts = [];
	$scope.updateAlerts = [];
	$scope.items = [
			{	name: 'Whole Bible (1 year)',
				plans: [{
					name: 'Old Testament (1 year)',
					startChapter: 1,
					endChapter: 929,
					cursor: 1,
					pace: 3
				},
				{
					name: 'New Testament (1 year)',
					startChapter: 930,
					endChapter: 1189,
					cursor: 930,
					pace: 1
				}]
			},
			{	name: 'New Testament (6 months)',
				plans: [{
					name: 'New Testament (6 months)',
					startChapter: 930,
					endChapter: 1189,
					cursor: 930,
					pace: 2
				}]
			} 
		];

	$scope.ok = function () {
		$modalInstance.close($scope.plans);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.closeAlert = function(index){
	    $scope.alerts.splice(index, 1);
	};

	$scope.closeUpdateAlert = function(index){
	    $scope.updateAlerts.splice(index, 1);
	};

	$scope.myCreate = function(passedPlan) {
		var plan = new Plans(passedPlan);
		plan.$save(function(response) {
			$scope.alerts.push({msg: 'Plan saved!', type: 'success'});
		}, function(errorResponse) {
			$scope.alerts.push({msg: errorResponse.data.message, type: 'danger'});
		});
	};

	$scope.createMultiple = function(item) {
		for(var i = 0; i < item.plans.length; i++) {
			var exists = false;
			for(var j = 0; j < $scope.plans.length; j++) {
				if ($scope.plans[j].name === item.plans[i].name) {
					exists = true;
				}
			}
			if (exists) {
				$scope.alerts.push({msg: 'You\'re already using this plan.', type: 'danger'});
			} else {
				$scope.myCreate(item.plans[i]);
			}
		}
		$scope.selected = null;
		$scope.find();
	};

	$scope.setPlan = function(plan) {
		$scope.startChapter = BibleRef.chapterNameFromId(plan.startChapter);
		$scope.endChapter = BibleRef.chapterNameFromId(plan.endChapter);
		$scope.cursor = BibleRef.chapterNameFromId(plan.cursor);
		$scope.pace = plan.pace;
	};

	$scope.updatePlan = function(planIndex) {
		
		$scope.pace = this.pace;
		$http.get('/reference', {params: {chapterInput: [this.cursor, this.startChapter, this.endChapter]}})
			.then(function(response) {
				var cursorId = response.data[0];
				var startChapterId = response.data[1];
				var endChapterId = response.data[2];
				
					// if the new value is a valid chapter
				if (angular.isNumber(cursorId) && angular.isNumber(startChapterId) && angular.isNumber(endChapterId) && cursorId >= startChapterId && cursorId <= endChapterId) {
						// update all fields
					var plan = $scope.plans[planIndex];
					plan.cursor = cursorId;
					plan.startChapter = startChapterId;
					plan.endChapter = endChapterId;
					plan.pace = $scope.pace;
					
					plan.$update(function(response) {
						$scope.plans[planIndex] = response;
						$scope.setPlan($scope.plans[planIndex]);
						$scope.updateAlerts.push({msg: 'Plan updated.', type: 'success'});
					}, function(errorResponse) {
						$scope.updateAlerts.push({msg: errorResponse.data.message, type: 'danger'});
					});
				} else {
					$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
						// reset form data
					this.cursor = $scope.cursor;
					this.startChapter = $scope.startChapter;
					this.endChapter = $scope.endChapter;
				}
			}, function(error) {
				$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
			});
	};

	// Remove existing Plan
	$scope.remove = function(plan) {
		
		var areYouSure = $window.confirm('Are you absolutely sure you want to delete this plan? All progress will be permanently lost.');
		if ( plan && areYouSure) { 
			plan.$remove();

			for (var i in $scope.plans) {
				if ($scope.plans [i] === plan) {
					$scope.plans.splice(i, 1);
				}
			}
		}
	};

	// Find a list of Plans
	$scope.find = function() {
		$scope.plans = Plans.query({ 
			user: $scope.authentication.user._id
		});
	};
}]);

angular.module('plans').controller('PlansMainController', ['$scope', '$http', 'Authentication', 'Plans', '$location', '$window', 'BibleRef', '$stateParams',
	function($scope, $http, Authentication, Plans, $location, $window, BibleRef, $stateParams) {
		$scope.authentication = Authentication;
		$scope.selected = {
			item: null
		};
		$scope.alerts = [];
		$scope.updateAlerts = [];
		$scope.items = [
				{	name: 'Whole Bible (1 year)',
					plans: [{
						name: 'Old Testament (1 year)',
						startChapter: 1,
						endChapter: 929,
						cursor: 1,
						pace: 3
					},
					{
						name: 'New Testament (1 year)',
						startChapter: 930,
						endChapter: 1189,
						cursor: 930,
						pace: 1
					}]
				},
				{	name: 'New Testament (6 months)',
					plans: [{
						name: 'New Testament (6 months)',
						startChapter: 930,
						endChapter: 1189,
						cursor: 930,
						pace: 2
					}]
				} 
			];

		$scope.closeAlert = function(index){
		    $scope.alerts.splice(index, 1);
		};

		$scope.closeUpdateAlert = function(index){
		    $scope.updateAlerts.splice(index, 1);
		};

		$scope.myCreate = function(passedPlan) {
			var plan = new Plans(passedPlan);
			plan.$save(function(response) {
				$scope.alerts.push({msg: 'Plan saved!', type: 'success'});
			}, function(errorResponse) {
				$scope.alerts.push({msg: errorResponse.data.message, type: 'danger'});
			});
		};

		$scope.createMultiple = function(item) {
			for(var i = 0; i < item.plans.length; i++) {
				var exists = false;
				for(var j = 0; j < $scope.plans.length; j++) {
					if ($scope.plans[j].name === item.plans[i].name) {
						exists = true;
					}
				}
				if (exists) {
					$scope.alerts.push({msg: 'You\'re already using this plan.', type: 'danger'});
				} else {
					$scope.myCreate(item.plans[i]);
				}
			}
			$scope.selected = null;
			$scope.find();
		};

		$scope.setPlan = function(plan) {
			var usePlan = plan;
			if($scope.plan) usePlan = $scope.plan;
			$scope.startChapter = BibleRef.chapterNameFromId(usePlan.startChapter);
			$scope.endChapter = BibleRef.chapterNameFromId(usePlan.endChapter);
			$scope.cursor = BibleRef.chapterNameFromId(usePlan.cursor);
			$scope.pace = usePlan.pace;

			var projectedDate = new Date();
			projectedDate.setDate(projectedDate.getDate() + (usePlan.endChapter - usePlan.cursor) / usePlan.pace);
			$scope.projected = projectedDate;
		};

		$scope.updatePlan = function() {
			
			$scope.pace = this.pace;
			$http.get('/reference', {params: {chapterInput: [this.cursor, this.startChapter, this.endChapter]}})
				.then(function(response) {
					var cursorId = response.data[0];
					var startChapterId = response.data[1];
					var endChapterId = response.data[2];
					
						// if the new value is a valid chapter
					if (angular.isNumber(cursorId) && angular.isNumber(startChapterId) && angular.isNumber(endChapterId) && cursorId >= startChapterId && cursorId <= endChapterId) {
							// update all fields
						var plan = $scope.plan;
						plan.cursor = cursorId;
						plan.startChapter = startChapterId;
						plan.endChapter = endChapterId;
						plan.pace = $scope.pace;
						
						plan.$update(function(response) {
							$scope.plan = response;
							$scope.setPlan();
							$scope.updateAlerts.push({msg: 'Plan updated.', type: 'success'});
						}, function(errorResponse) {
							$scope.updateAlerts.push({msg: errorResponse.data.message, type: 'danger'});
						});
					} else {
						$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
							// reset form data
						this.cursor = $scope.cursor;
						this.startChapter = $scope.startChapter;
						this.endChapter = $scope.endChapter;
					}
				}, function(error) {
					$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
				});
		};

		// Remove existing Plan
		$scope.remove = function(plan) {
			
			var areYouSure = $window.confirm('Are you absolutely sure you want to delete this plan? All progress will be permanently lost.');
			if ( plan && areYouSure) { 
				plan.$remove();

				for (var i in $scope.plans) {
					if ($scope.plans [i] === plan) {
						$scope.plans.splice(i, 1);
					}
				}
			}
		};

		$scope.activate = function(message) {
			$scope.plan.active = !$scope.plan.active;
			$scope.plan.$update(function(response) {
				$scope.updateAlerts.push({msg: message, type: 'success'});
			});
		};

		// Find a list of Plans
		$scope.find = function() {
			$scope.plans = Plans.query({ 
				user: $scope.authentication.user._id
			});
		};

		// Find existing Plan
		$scope.findOne = function() {
			$scope.plan = Plans.get({ 
				planId: $stateParams.planId
			}, function(response) {
				$scope.setPlan(response);
			});
		};
	}
]);
'use strict';

//Plans service used to communicate Plans REST endpoints
angular.module('plans').factory('Plans', ['$resource',
	function($resource) {
		return $resource('plans/:planId', { planId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			readToday: {
				method: 'GET',
				url: 'plans/:planId/today',
				isArray: true
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;
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

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);