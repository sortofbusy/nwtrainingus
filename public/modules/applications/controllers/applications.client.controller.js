'use strict';

// Groups controller
angular.module('applications').controller('ApplicationsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Groups', '$window', 'Messages', '$filter', 'Applications',
	function($scope, $http, $stateParams, $location, Authentication, Groups, $window, Messages, $filter, Applications) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.optionsCollapsed = true;
		$scope.addCollapsed = true;
		$scope.open = false;
		$scope.toggleHidden = false;
		$scope.toggleClass = 'off';

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
			$http.get('/applications').success( function(response) {
				var locality = '';
				if($scope.user.roles.indexOf('admin') < 0) locality = $scope.user.locality;

				$scope.pendingApplications = $filter('filter')(response, {appStatus: 'Pending', applicant: {locality: locality}});
				$scope.approvedApplications = $filter('filter')(response, {appStatus: 'Approved'});
				$scope.deniedApplications = $filter('filter')(response, {appStatus: 'Denied'});
			});
		};

		$scope.approveApplication = function(application) {
			application = new Applications(application);
			application.appStatus = 'Approved';
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
	}
]);