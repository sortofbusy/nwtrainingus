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
			{ name: 'Bellevue', area: 'Puget Sound' },
			{ name: 'Bellingham',  area: 'Puget Sound' },
			{ name: 'Everett', area: 'Puget Sound' },
			{ name: 'Olympia', area: 'Puget Sound' },
			{ name: 'Renton', area: 'Puget Sound' },
			{ name: 'Seattle', area: 'Puget Sound' },
			{ name: 'Shoreline', area: 'Puget Sound' },
			{ name: 'Tacoma', area: 'Puget Sound' },
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
			{ name: 'Other (Eastern WA)', area: 'Eastern Washington' },
			{ name: 'Boise', area: 'Idaho' },
			{ name: 'Other (Idaho)', area: 'Idaho' }
		];

		$scope.labels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
		$scope.data = [300, 500, 100];

		// Find a list of User Messages
		$scope.getActivity = function() {
			$scope.loading = true;
			
			$http.get('/admin').success(function(response) {
				if (!response.length) return;
				
				$scope.users = response[0];
				
				$scope.userList = $scope.users;
				
			});

			$http.get('/applications').success(function(response) {
				if (!response.length) return;
				
				$scope.applied = response;
				
				$scope.PugetSoundApplied = $filter('filter')(response, {applicant: {locality: {area: 'Puget Sound'}}}, true);
				$scope.PugetSoundAccepted = $filter('filter')($scope.PugetSoundApplied, {appStatus: 'Approved'});
				$scope.OregonApplied = $filter('filter')(response, {applicant: {locality: {area: 'Oregon Area'}}});
				$scope.OregonAccepted = $filter('filter')(response, {applicant: {locality: {area: 'Oregon Area'}}, appStatus: 'Approved'});
				$scope.EWApplied = $filter('filter')(response, {applicant: {locality: {area: 'Eastern Washington'}}});
				$scope.EWAccepted = $filter('filter')(response, {applicant: {locality: {area: 'Eastern Washington'}}, appStatus: 'Approved'});
				$scope.IDApplied = $filter('filter')(response, {applicant: {locality: {area: 'Idaho'}}});
				$scope.IDAccepted = $filter('filter')(response, {applicant: {locality: {area: 'Idaho'}}, appStatus: 'Approved'});
				$scope.loading = false;

				$scope.languagesData = [
					$filter('filter')(response, {applicant: {language: 'English'}}).length, 
					$filter('filter')(response, {applicant: {language: 'Chinese'}}).length,
					$filter('filter')(response, {applicant: {language: 'Spanish'}}).length
				];

				$scope.languagesLabels = ['English', 'Chinese', 'Spanish'];
				
				var minAge;
				var maxAge;
				$scope.ageLabels = [];
				$scope.ageData = [];

				for (var i = 2; i < 9; i++) {
					minAge = i*10;
					maxAge = minAge + 9;
					$scope.ageLabels.push(minAge + '-' + maxAge);
					$scope.ageData.push($filter('agerange')(response, minAge, maxAge).length);
				}
				$scope.ageData = [$scope.ageData];

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