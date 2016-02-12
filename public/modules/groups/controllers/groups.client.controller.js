'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$window', '$http', '$filter', '$q', '$stateParams', '$location', 'Authentication', 'Groups',
	function($scope, $window, $http, $filter, $q, $stateParams, $location, Authentication, Groups) {
		$scope.user = Authentication.user;
		$scope.newLocality = $scope.user.locality;
			
		if ($scope.user.locality.area === 'Oregon Area') {
			$scope.localities = [
				{ name: 'Eugene', area: 'Oregon Area' },
				{ name: 'Corvallis',  area: 'Oregon Area' },
				{ name: 'Medford', area: 'Oregon Area' },
				{ name: 'Portland', area: 'Oregon Area' },
				{ name: 'Roseburg', area: 'Oregon Area' },
				{ name: 'Salem', area: 'Oregon Area' },
				{ name: 'Vancouver, WA', area: 'Oregon Area' },
				{ name: 'Other (Oregon)', area: 'Oregon Area' }
			];
		}

		if ($scope.user.locality.area === 'Eastern Washington') {
			$scope.localities = [
				{ name: 'Cheney', area: 'Eastern Washington' },
				{ name: 'Ephrata', area: 'Eastern Washington' },
				{ name: 'Prosser', area: 'Eastern Washington' },
				{ name: 'Pullman', area: 'Eastern Washington' },
				{ name: 'Spokane', area: 'Eastern Washington' },
				{ name: 'West Richland', area: 'Eastern Washington' },
				{ name: 'Other (Eastern WA)', area: 'Eastern Washington' }
			];
		}

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
			group.locality = $scope.newLocality;

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
			Groups.query().$promise.then( function(response) {
				var locality;
				if($scope.user.roles.indexOf('admin') < 0) {
					locality = {};
						// if the approver is from Oregon or Eastern Washington
					if ($scope.user.locality.area !== '') {
						locality.area = $scope.user.locality.area;
						$scope.localityId = locality.area;
					}
					else {
						locality.name = $scope.user.locality.name;
						$scope.localityId = locality.name;
					}
				} else $scope.localityId = 'All';
					// for display in the template
				$scope.locality = locality;

				$scope.groups = $filter('filter')(response, {locality: locality});

			});
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