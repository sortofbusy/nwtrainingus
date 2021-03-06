'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$window', '$http', '$filter', '$q', '$stateParams', '$location', 'Authentication', 'Groups', 'Users', 'Reports',
	function($scope, $window, $http, $filter, $q, $stateParams, $location, Authentication, Groups, Users, Reports) {
		$scope.user = Authentication.user;
		$scope.newLocality = $scope.user.locality;
		
		$scope.allLocalities = [
			{ name: 'Bellevue', area: 'Puget Sound' },
			{ name: 'Bellingham',  area: 'Puget Sound' },
			{ name: 'Everett', area: 'Puget Sound' },
			{ name: 'Olympia', area: 'Puget Sound' },
			{ name: 'Renton', area: 'Puget Sound' },
			{ name: 'Seattle', area: 'Puget Sound' },
			{ name: 'Shoreline', area: 'Puget Sound' },
			{ name: 'Tacoma', area: 'Puget Sound' },
			{ name: 'Eugene', area: 'Oregon Area' },
			{ name: 'Corvallis',  area: 'Oregon Area' },
			{ name: 'Medford', area: 'Oregon Area' },
			{ name: 'Portland', area: 'Oregon Area' },
			{ name: 'Roseburg', area: 'Oregon Area' },
			{ name: 'Salem', area: 'Oregon Area' },
			{ name: 'Vancouver, WA', area: 'Oregon Area' },
			{ name: 'Other (Oregon)', area: 'Oregon Area' },
			{ name: 'Cheney', area: 'Eastern Washington' },
			{ name: 'Ephrata', area: 'Eastern Washington' },
			{ name: 'Prosser', area: 'Eastern Washington' },
			{ name: 'Pullman', area: 'Eastern Washington' },
			{ name: 'Spokane', area: 'Eastern Washington' },
			{ name: 'West Richland', area: 'Eastern Washington' },
			{ name: 'Other (Eastern WA)', area: 'Eastern Washington' },
			{ name: 'Boise', area: 'Idaho' },
			{ name: 'Other (Idaho)', area: 'Idaho' }
		];

		$scope.localities = $filter('filter')($scope.allLocalities, {area: $scope.user.locality.area});

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

		//  (fallback if drag and drop doesn't work)
		$scope.assignUserFallback = function(userIndex, groupId) {
			for (var i = 0; i < $scope.groups.length; i++) {
				if($scope.groups[i]._id === groupId) {
					$scope.groups[i].users.push($scope.unassigned[userIndex]);
					$scope.unassigned.splice(userIndex, 1);
					break;
				}
			}
		};

		//  (fallback if drag and drop doesn't work)
		$scope.unassignUserFallback = function(userIndex, groupIndex) {
			$scope.unassigned.push($scope.groups[groupIndex].users[userIndex]);
			$scope.groups[groupIndex].users.splice(userIndex, 1);
		};

		// Find a list of Groups
		$scope.find = function() {
			Groups.query().$promise.then( function(response) {
				var locality;
				if($scope.user.roles.indexOf('admin') < 0) {
					locality = {};
					locality.area = $scope.user.locality.area;
					$scope.localityId = locality.area;
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
			$scope.roleButtons = [];
		};

		$scope.makeReporter = function(index) {
			$scope.currentUser = index;
			$http.post('/users/' + $scope.group.users[$scope.currentUser]._id + '/reporter').success( function(response) {
				$scope.group.users[$scope.currentUser].roles = response.roles;
			});
		};

		$scope.removeReporter = function(index) {
			if(!$window.confirm('Are you sure?')) return;
			$scope.currentUser = index;
			$http.delete('/users/' + $scope.group.users[$scope.currentUser]._id + '/reporter').success( function(response) {
				$scope.group.users[$scope.currentUser].roles = response.roles;
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