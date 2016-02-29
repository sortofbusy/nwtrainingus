'use strict';

// Groups controller
angular.module('applications').controller('ApplicationsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Groups', '$window', 'Messages', '$filter', 'Applications', 'ngProgressFactory',
	function($scope, $http, $stateParams, $location, Authentication, Groups, $window, Messages, $filter, Applications, ngProgressFactory) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');
		$scope.loading = false;
			
		$scope.optionsCollapsed = true;
		$scope.addCollapsed = true;
		$scope.open = false;
		$scope.toggleHidden = false;
		$scope.toggleClass = 'off';

		$scope.progressbar = ngProgressFactory.createInstance();
		$scope.progressbar.setColor('#CEF6F5');
		$scope.progressbar.setHeight('5px');

		// Enroll in existing Group
		$scope.enroll = function() {
			var params = {
				token: this.token
			};
			
			$http.post('/groups/enroll', params).then(function(success) {
				if(success.data){
					$location.path('groups/' + success.data._id);
					$scope.token = '';
				}
			}, function(err) {
				$scope.error = err.data.message;
				$scope.token = '';
			});
		};

		// Remove existing Group
		$scope.remove = function() {
			var areYouSure = $window.confirm('Are you absolutely sure you want to delete this group? All information will be permanently lost.');
			
			if (areYouSure) {
				$scope.group.$remove(function() {
					$location.path('groups');
				});
			}
		};

		$scope.showApplications = function() {
			$scope.loading = true;
			$scope.progressbar.start();
			$scope.textPromise = $http.get('/applications');
			$scope.textPromise.success( function(response) {
				var locality;
				if($scope.user.roles.indexOf('admin') < 0) {
					locality = {};
						// if the approver is from Oregon or Eastern Washington
					if ($scope.user.locality.area !== '') locality.area = $scope.user.locality.area;
					else locality.name = $scope.user.locality.name;
				}
					// for display in the template
				$scope.locality = locality;

				$scope.pendingApplications = $filter('filter')(response, {appStatus: 'Pending', applicant: {locality: locality}});
				$scope.approvedApplications = $filter('filter')(response, {appStatus: 'Approved', applicant: {locality: locality}});
				$scope.deniedApplications = $filter('filter')(response, {appStatus: 'Denied', applicant: {locality: locality}});
				$scope.loading = false;
				$scope.progressbar.complete();
			});
		};

		$scope.approveApplication = function(application) {
			application = new Applications(application);
			application.appStatus = 'Approved';
			application.modified = Date.now();
			
			application.$update(function(response) {
				$scope.showApplications();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.denyApplication = function(application) {
			if($window.confirm('Are you sure you want to deny this application?')) {
					application = new Applications(application);
				application.appStatus = 'Denied';
				application.modified = Date.now();
				
				application.$update(function(response) {
					$scope.showApplications();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.resetApplication = function(application) {
			if($window.confirm('Are you sure you want to reset the status of this application to pending?')) {
				application = new Applications(application);
				application.appStatus = 'Pending';
				application.modified = Date.now();
			
				application.$update(function(response) {
					$scope.showApplications();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.toggle = function() {
			$scope.toggleHidden = !$scope.toggleHidden;
			if ($scope.toggleClass === 'on') $scope.toggleClass = 'off';
			else $scope.toggleClass = 'on';
		};

		$scope.showRoster = function() {
			if ($scope.user.roles.indexOf('admin') < 0 && $scope.user.roles.indexOf('approver') < 0) return;
			$scope.loading = true;
			$scope.progressbar.start();
			$scope.textPromise = $http.get('/roster');
			$scope.textPromise.success( function(response) {
				var locality;
				if($scope.user.roles.indexOf('admin') < 0) {
					locality = {};
						// if the approver is from Oregon or Eastern Washington
					if ($scope.user.locality.area !== '') locality.area = $scope.user.locality.area;
					else locality.name = $scope.user.locality.name;
				}
					// for display in the template
				$scope.locality = locality;
				$scope.users = $filter('filter')(response, {appStatus: 'Approved', applicant: {locality: locality}});
				$scope.loading = false;
				$scope.progressbar.complete();
			});
		};
	}
]);