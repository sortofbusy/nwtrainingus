'use strict';

angular.module('users').controller('AdminController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;
		//$scope.showGroupDetails = [];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Find a list of User Messages
		$scope.getActivity = function() {
			var listLength = 20;
			$http.get('/admin').success(function(response) {
				if (!response.length) return;
				
				if(response[0].length > listLength) {
					$scope.users = response[0].slice(0, listLength);
					$scope.allusers = response[0];
				} else $scope.users = response[0];

				$scope.chapters = response[1];
				$scope.groups = response[2];
			});

			/*
			$http.get('/badges').success(function(response) {
				if (!response.length) return;
				
				if(response.length > listLength) {
					$scope.badges = response.slice(0, listLength);
					$scope.allbadges = response;
				} else $scope.badges = response;

			});
			$http.get('/groups').success(function(response) {
				$scope.groups = response;
			});
			$http.get('/messages?group=null').success(function(response) {
				if (!response.length) return;
				
				if(response.length > listLength) {
					$scope.notes = response.slice(0, listLength);
					$scope.allnotes = response;
				} else $scope.notes = response;
			});*/
		};

		$scope.showAll = function(list) {
			var all = 'all' + list;
			$scope[list] = $scope[all];
			$scope[all] = [];
		};
	}
]);