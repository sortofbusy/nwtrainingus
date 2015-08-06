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
			$scope.badges = Badges.query();
		};

		// Find existing Badge
		$scope.findOne = function() {
			$scope.badge = Badges.get({ 
				badgeId: $stateParams.badgeId
			});
		};
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
angular.module('chapters').controller('ChaptersController', ['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans', 'BibleText', 'ReadingPlan', '$sce',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans, BibleText, ReadingPlan, $sce) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.plansTabs = [];

				// Initialize controller
		$scope.init = function() {
			var userId = $scope.authentication.user._id;
			Plans.query({ 
				user: userId
			}, function(plans) {
				ReadingPlan.setPlans(plans, 0);
				if(plans.length)
					$scope.beginPlanPortion();
			});
		};

		$scope.beginPlanPortion = function() {
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
				$scope.find();
			});
			
		};

		$scope.incrementPlan = function() {
				// advance the reading plan
			$scope.textPromise = ReadingPlan.incrementPlan().then( function(response) {
				$scope.chapterText = response;
				$scope.find();
			});
			
				// set active plan tab to reflect current tab
			$scope.plansTabs[ReadingPlan.getPlanSegment()] = true;					
		};

		$scope.changePlan = function(index) {
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
					ReadingPlan.addChapter(response._id);
					$scope.incrementPlan();

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
				$scope.plans = plans;
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

angular.module('chapters').factory('BibleText', [ '$q', '$http',
	function($q, $http) {
		var getRCVText = function(chapterName, increment) {
			return $q(function(resolve) {
				$http.get('/reference', {params: { chapterName: chapterName, increment: increment}})
					.then(					
							// create an array of calls since the RcV API only returns 30 verses / call
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
							resolve($q.all(calls));
						});
				
			});
		};

		// Public API - eventually this will call other providers
		return {
			getChapterText: function(chapterName, increment) {
				return $q(function(resolve) {
					getRCVText(chapterName, increment).then(function (result) {
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
				    	}
				    	
				    	combined.copyright = result[0].data.copyright;
				    	
				    	resolve(combined);
					}, function(error) {
						resolve(error);
					});
				});
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

angular.module('plans').controller('PlansController', ["$scope", "$modalInstance", "plans", "authentication", "Plans", "$window", "$timeout", function ($scope, $modalInstance, plans, authentication, Plans, $window, $timeout) {
	$scope.plans = plans;
	$scope.authentication = authentication;
	$scope.selected = {
		item: null
	};
	$scope.alerts = [];
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
		console.log($scope.plans);
		$modalInstance.close($scope.plans);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.closeAlert = function(index){
	    $scope.alerts.splice(index, 1);
	};

	$scope.myCreate = function(passedPlan) {
		var plan = new Plans(passedPlan);
		plan.$save(function(response) {
			$scope.alerts.push({msg: 'Plan saved!', type: 'success'});
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
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