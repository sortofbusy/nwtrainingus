'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');
		
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


		$scope.register = function() {
			if(!$scope.user.hasOwnProperty('age') || !$scope.user.hasOwnProperty('phone') || $scope.user.phone === '' || 
				!$scope.user.hasOwnProperty('locality') || !$scope.user.hasOwnProperty('occupation') || 
				!$scope.user.hasOwnProperty('serviceAreas')) {
					$scope.error = 'Please fill every field';
			}
			else {
				$scope.user.registered = Date.now();
				var user = new Users($scope.user);
				

				user.$update($scope.user, function(response) {
					$location.path('/consecration');
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

		// Find a list of User Messages
		$scope.getActivity = function() {
			var listLength = 3;
			$http.get('/users/messages').success(function(response) {
				if (!response.length) return;
				
				if(response.length > listLength) {
					$scope.messages = response.slice(0, listLength);
					$scope.allmessages = response;
				} else $scope.messages = response;

			});
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
			});
		};

		$scope.showAll = function(list) {
			var all = 'all' + list;
			$scope[list] = $scope[all];
			$scope[all] = [];
		};
	}
]);