'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll', 'Users',
	function($scope, Authentication, $http, $q, $sce, $location, $anchorScroll, Users) {
		// This provides Authentication context.
		$scope.user = Authentication.user;

		$scope.localities = [
			'Bellevue',
			'Bellingham', 
			'Everett', 
			'Olympia',
			'Portland',
			'Renton', 
			'Seattle',
			'Shoreline', 
			'Tacoma', 
			'Vancouver' 
		];

		$scope.checkRegistration = function() {
			if(!$scope.user.hasOwnProperty('age') || !$scope.user.hasOwnProperty('phone') || $scope.user.phone === '' || 
				!$scope.user.hasOwnProperty('locality') || !$scope.user.hasOwnProperty('occupation') || 
				!$scope.user.hasOwnProperty('serviceAreas')) {
					$scope.error = 'Please fill every field';
			}
			else {
				$scope.user.registered = Date.now();
				var user = new Users($scope.user);

				user.$update($scope.user, function(response) {
					$location.path('/');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.consecrate = function() {
			if(!$scope.signature || $scope.signature.isEmpty) {
				$scope.error = 'Please sign the form to continue';
			} else {
				$scope.user.consecrated = Date.now();
				$scope.user.signature = $scope.signature.dataUrl;
				var user = new Users($scope.user);
				
				user.$update($scope.user, function(response) {
					$location.path('/');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}

		};

		$scope.showApplications = function() {
			$http.get('/users/applications').success( function(response) {
				$scope.applications = response;
			});
		};

		
	}


]);