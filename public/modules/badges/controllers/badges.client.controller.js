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