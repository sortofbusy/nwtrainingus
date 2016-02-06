'use strict';

// Resources controller
angular.module('resources').controller('ResourcesController', ['$scope', '$http', '$window', '$sce', '$stateParams', '$location', 'Authentication', 'Resources',
	function($scope, $http, $window, $sce, $stateParams, $location, Authentication, Resources) {
		$scope.authentication = Authentication;

		//$scope.fileType;

		$scope.sessions = [1,2,3,4,5,6,7,8,9,10,11,12];
		// Create new Resource
		$scope.create = function() {
			// Create new Resource object
			var resource = new Resources ({
				name: this.name,
				training: this.training,
				session: this.session,
				language: this.language,
				url: this.url,
				fileType: this.fileType,
				subsession: this.fileSession
			});

			// Redirect after save
			resource.$save(function(response) {
				$location.path('resources/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Resource
		$scope.remove = function(resource) {
			if(!$window.confirm('Are you sure?')) return;
			if ( resource ) { 
				resource.$remove();

				for (var i in $scope.resources) {
					if ($scope.resources [i] === resource) {
						$scope.resources.splice(i, 1);
					}
				}
			} else {
				$scope.resource.$remove(function() {
					$location.path('resources');
				});
			}
		};

		// Update existing Resource
		$scope.update = function() {
			var resource = $scope.resource;

			resource.$update(function() {
				$location.path('resources/' + resource._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Resources
		$scope.find = function() {
			$scope.resources = Resources.query();
		};

		// Find existing Resource
		$scope.findOne = function() {
			$scope.resource = Resources.get({ 
				resourceId: $stateParams.resourceId
			}, function() {
				$scope.trustedUrl = $sce.trustAsResourceUrl($scope.resource.url);
			});
			
		};

		$scope.listTrainings = function() {
			$http.get('/trainings').success(function(response) {
				$scope.trainings = response;
			});
		};
	}
]);