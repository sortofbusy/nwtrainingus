'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$window', '$http', '$q', '$stateParams', '$location', 'Authentication', 'Groups',
	function($scope, $window, $http, $q, $stateParams, $location, Authentication, Groups) {
		$scope.user = Authentication.user;

		$scope.newTime = new Date('October 1, 2016 18:00:00');

		// object to update ladda button
		$scope.laddaButton = {};

      	// Create new Group
		$scope.create = function() {
			// Create new Group object
			var group = new Groups (this);
			if (!group.meeting) {
				$scope.error = 'Please fill form fields';
				return;
			}
			group.meeting.time = $scope.newTime;
			group.locality = $scope.user.locality;

			// Redirect after save
			group.$save(function(response) {
				$location.path('groups');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Group
		$scope.remove = function(group) {
			if(!$window.confirm('Are you sure?')) return;
			if ( group ) { 
				group.$remove();

				for (var i in $scope.groups) {
					if ($scope.groups [i] === group) {
						$scope.groups.splice(i, 1);
					}
				}
			} else {
				$scope.group.$remove(function() {
					$location.path('groups');
				});
			}
		};

		// Update existing Group
		$scope.update = function() {
			var group = $scope.group;

			group.$update(function() {
				$location.path('groups/' + group._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Update Groups
		$scope.updateAll = function() {
			var updateCalls = [];
			// start ladda button
			$scope.laddaButton.loading = true;
			$scope.laddaButton.resultIcon = '';
				
			for (var i = 0; i < $scope.groups.length; i++) {
				updateCalls.push($scope.groups[i].$update().$promise);
			}
			$q.all(updateCalls)
				.then( function(result) {
					// resolve ladda button
					$scope.laddaButton.loading = false;
					$scope.laddaButton.resultIcon = 'fa-check';
				}, function(err) {
					$scope.error = 'Study group changes not saved';
					// resolve ladda button
					$scope.laddaButton.loading = false;
					$scope.laddaButton.resultIcon = 'fa-times';
				});
		};

		// Find a list of Groups
		$scope.find = function() {
			$scope.groups = Groups.query();
			$http.get('/groups/unassigned').success( function(response) {
				$scope.unassigned = response;
			});
		};

		// Find existing Group
		$scope.findOne = function() {
			$scope.group = Groups.get({ 
				groupId: $stateParams.groupId
			});
		};

		$scope.getWeekday = function (dayIndex) {
		  return ['Lord\'s Day', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];
		};


		$scope.dropSuccessHandler = function($event,index,array){
		  	array.splice(index,1);
		};

		$scope.onDrop = function($event,$data,array){
		  	array.push($data);
		};
	}
]);