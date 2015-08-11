'use strict';

// Plans controller
angular.module('plans').controller('PlansControllerCrud', ['$scope', '$modal', '$stateParams', '$location', 'Authentication', 'Plans', '$window',
	function($scope, $modal, $stateParams, $location, Authentication, Plans, $window) {
		$scope.authentication = Authentication;
		Plans.query({ 
				user: $scope.authentication.user._id
		}).$promise.then( function(response) {
			$scope.plans = response;
		});
		
		
		// Create new Plan
		$scope.create = function() {
			// Create new Plan object
			var plan = new Plans ({
				name: this.name
			});

			plan.$save(function(response) {
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Update existing Plan
		$scope.update = function() {
			var plan = $scope.plan;

			plan.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Plans
		$scope.find = function() {
			$scope.plans = Plans.query({ 
				user: $scope.authentication.user._id
			});
		};

		// Find existing Plan
		$scope.findOne = function() {
			$scope.plan = Plans.get({ 
				planId: $stateParams.planId
			});
		};
	}
]);

angular.module('plans').controller('PlansController', function ($scope, $modalInstance, plans, authentication, Plans, $window, BibleRef) {
	$scope.plans = plans;
	$scope.authentication = authentication;
	$scope.selected = {
		item: null
	};
	$scope.alerts = [];
	$scope.updateAlerts = [];
	$scope.items = [
			{	name: 'Whole Bible (1 year)',
				plans: [{
					name: 'Old Testament (1 year)',
					startChapter: 1,
					endChapter: 929,
					cursor: 1,
					pace: 3
				},
				{
					name: 'New Testament (1 year)',
					startChapter: 930,
					endChapter: 1189,
					cursor: 930,
					pace: 1
				}]
			},
			{	name: 'New Testament (6 months)',
				plans: [{
					name: 'New Testament (6 months)',
					startChapter: 930,
					endChapter: 1189,
					cursor: 930,
					pace: 2
				}]
			} 
		];

	$scope.ok = function () {
		$modalInstance.close($scope.plans);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.closeAlert = function(index){
	    $scope.alerts.splice(index, 1);
	};

	$scope.closeUpdateAlert = function(index){
	    $scope.updateAlerts.splice(index, 1);
	};

	$scope.myCreate = function(passedPlan) {
		var plan = new Plans(passedPlan);
		plan.$save(function(response) {
			$scope.alerts.push({msg: 'Plan saved!', type: 'success'});
		}, function(errorResponse) {
			$scope.alerts.push({msg: errorResponse.data.message, type: 'danger'});
		});
	};

	$scope.createMultiple = function(item) {
		for(var i = 0; i < item.plans.length; i++) {
			var exists = false;
			for(var j = 0; j < $scope.plans.length; j++) {
				if ($scope.plans[j].name === item.plans[i].name) {
					exists = true;
				}
			}
			if (exists) {
				$scope.alerts.push({msg: 'You\'re already using this plan.', type: 'danger'});
			} else {
				$scope.myCreate(item.plans[i]);
			}
		}
		$scope.selected = null;
		$scope.find();
	};

	$scope.setPlan = function(plan) {
		$scope.startChapter = BibleRef.chapterNameFromId(plan.startChapter);
		$scope.endChapter = BibleRef.chapterNameFromId(plan.endChapter);
		$scope.cursor = BibleRef.chapterNameFromId(plan.cursor);
	}

	$scope.updatePlan = function(planIndex) {
		var plan = $scope.plans[planIndex];
		
		var cursorId = BibleRef.chapterIdFromName(this.cursor);
		var startChapterId = BibleRef.chapterIdFromName(this.startChapter);
		var endChapterId = BibleRef.chapterIdFromName(this.endChapter);
		
			// if the new value is a valid chapter
		if (angular.isNumber(cursorId) && angular.isNumber(startChapterId) 
			&& angular.isNumber(endChapterId) && cursorId >= startChapterId 
			&& cursorId <= endChapterId) {
				// update all fields
			plan.cursor = cursorId;
			plan.startChapter = startChapterId;
			plan.endChapter = endChapterId;
			
			plan.$update(function(response) {
				$scope.plans[planIndex] = response;
				$scope.updateAlerts.push({msg: 'Plan updated.', type: 'success'});
			}, function(errorResponse) {
				$scope.updateAlerts.push({msg: errorResponse.data.message, type: 'danger'});
			});
		} else {
			$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
				// reset form data
			this.cursor = $scope.cursor;
			this.startChapter = $scope.startChapter;
			this.endChapter = $scope.endChapter;
		}
	}

	// Remove existing Plan
	$scope.remove = function(plan) {
		
		var areYouSure = $window.confirm('Are you absolutely sure you want to delete this plan? All progress will be permanently lost.');
		if ( plan && areYouSure) { 
			plan.$remove();

			for (var i in $scope.plans) {
				if ($scope.plans [i] === plan) {
					$scope.plans.splice(i, 1);
				}
			}
		}
	};

	// Find a list of Plans
	$scope.find = function() {
		$scope.plans = Plans.query({ 
			user: $scope.authentication.user._id
		});
	};
});