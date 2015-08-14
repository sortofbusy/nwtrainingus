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