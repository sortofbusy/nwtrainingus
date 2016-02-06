'use strict';

// Trainings controller
angular.module('trainings').controller('TrainingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Trainings',
	function($scope, $stateParams, $location, Authentication, Trainings) {
		$scope.authentication = Authentication;

		// Create new Training
		$scope.create = function() {
			// Create new Training object
			var training = new Trainings (this);

			// Redirect after save
			training.$save(function(response) {
				$location.path('admin');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Training
		$scope.remove = function(training) {
			// require this to be done manually
			/*
			if ( training ) { 
				training.$remove();

				for (var i in $scope.trainings) {
					if ($scope.trainings [i] === training) {
						$scope.trainings.splice(i, 1);
					}
				}
			} else {
				$scope.training.$remove(function() {
					$location.path('trainings');
				});
			}*/
		};

		// Update existing Training
		$scope.update = function() {
			var training = $scope.training;

			training.$update(function() {
				$location.path('trainings/' + training._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Trainings
		$scope.find = function() {
			$scope.trainings = Trainings.query();
		};

		// Find existing Training
		$scope.findOne = function() {
			$scope.training = Trainings.get({ 
				trainingId: $stateParams.trainingId
			});
		};
	}
]);