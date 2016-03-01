'use strict';

angular.module('users').controller('AdminController', ['$scope', '$http', '$window', '$filter', '$location', 'Users', 'Authentication',
	function($scope, $http, $window, $filter, $location, Users, Authentication) {
		$scope.user = Authentication.user;
		//$scope.showGroupDetails = [];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.loading = false;
		
		$scope.roles = [ 
			'user',
			'trainee',
			'reporter', 
			'approver',
			'admin'
		];

		$scope.localities = [
			{ name: 'Bellevue', area: '' },
			{ name: 'Bellingham',  area: '' },
			{ name: 'Everett', area: '' },
			{ name: 'Olympia', area: '' },
			{ name: 'Renton', area: '' },
			{ name: 'Seattle', area: '' },
			{ name: 'Shoreline', area: '' },
			{ name: 'Tacoma', area: '' },
			{ name: 'Eugene', area: 'Oregon Area' },
			{ name: 'Corvallis',  area: 'Oregon Area' },
			{ name: 'Medford', area: 'Oregon Area' },
			{ name: 'Portland', area: 'Oregon Area' },
			{ name: 'Roseburg', area: 'Oregon Area' },
			{ name: 'Salem', area: 'Oregon Area' },
			{ name: 'Vancouver, WA', area: 'Oregon Area' },
			{ name: 'Other (Oregon)', area: 'Oregon Area' },
			{ name: 'Cheney', area: 'Eastern Washington' },
			{ name: 'Ephrata', area: 'Eastern Washington' },
			{ name: 'Prosser', area: 'Eastern Washington' },
			{ name: 'Pullman', area: 'Eastern Washington' },
			{ name: 'Spokane', area: 'Eastern Washington' },
			{ name: 'West Richland', area: 'Eastern Washington' },
			{ name: 'Other (Eastern WA)', area: 'Eastern Washington' }
		];

		// Find a list of User Messages
		$scope.getActivity = function() {
			$scope.loading = true;
			
			$http.get('/admin').success(function(response) {
				if (!response.length) return;
				
				$scope.users = response[0];
				
				$scope.userList = $scope.users;
				$scope.PugetSoundApplied = $filter('filter')($scope.users, {locality: {area: ''}}, true);
				$scope.PugetSoundAccepted = $filter('filter')($scope.PugetSoundApplied, {consecrated: '!!'});
				$scope.OregonApplied = $filter('filter')($scope.users, {locality: {area: 'Oregon Area'}});
				$scope.OregonAccepted = $filter('filter')($scope.users, {locality: {area: 'Oregon Area'}, consecrated: '!!'});
				$scope.EWApplied = $filter('filter')($scope.users, {locality: {area: 'Eastern Washington'}});
				$scope.EWAccepted = $filter('filter')($scope.users, {locality: {area: 'Eastern Washington'}, consecrated: '!!'});
				$scope.loading = false;
			
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