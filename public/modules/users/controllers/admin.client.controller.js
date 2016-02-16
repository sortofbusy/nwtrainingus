'use strict';

angular.module('users').controller('AdminController', ['$scope', '$http', '$window', '$filter', '$location', 'Users', 'Authentication',
	function($scope, $http, $window, $filter, $location, Users, Authentication) {
		$scope.user = Authentication.user;
		//$scope.showGroupDetails = [];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.roles = [ 
			'user',
			'trainee',
			'reporter', 
			'approver',
			'admin'
		];

		// Find a list of User Messages
		$scope.getActivity = function() {
			var listLength = 20;
			$http.get('/admin').success(function(response) {
				if (!response.length) return;
				
				if(response[0].length > listLength) {
					$scope.users = response[0].slice(0, listLength);
					$scope.allusers = response[0];
				} else $scope.users = response[0];
				
				if ($scope.allusers) $scope.userList = $scope.allusers;
				else $scope.userList = $scope.users;
			});
			$scope.listTrainings();
			
		};

		$scope.editRoles = function(user) {
			if ($window.confirm('Are you absolutely sure you want to save these roles?')) {
				$http.post('/admin/users/roles', {userId: user._id, roles: user.roles}).success(function(response) {
				});
			}
		};

		$scope.removeUser = function(userId) {
			if ($window.confirm('Are you absolutely sure you want to delete this user?')) {
				$http.delete('/admin/users/remove', {params: {userId: userId}}).success(function(response) {
					$scope.getActivity();
				});
			}
		};

		$scope.createTraining = function() {
			if ($window.confirm('Are you sure you want to create a new training?')) {
				$http.post('/admin/trainings', $scope.training).success(function(response) {
					$scope.listTrainings();
				});
			}
		};

		$scope.listTrainings = function() {
			$http.get('/trainings').success(function(response) {
				$scope.trainings = response;
			});
		};

		$scope.createApplications = function(trainingId) {
			var data = {trainingId: trainingId};
			$http.post('/admin/createapplications', data).success(function(response) {
				$window.alert(response.length + ' applications created successfully');
			});
		};

		$scope.showAll = function(list) {
			var all = 'all' + list;
			$scope[list] = $scope[all];
			$scope[all] = [];
		};
	}
]);