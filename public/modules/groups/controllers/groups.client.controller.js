'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Groups', 'Chapters', '$window',
	function($scope, $http, $stateParams, $location, Authentication, Groups, Chapters, $window) {
		$scope.authentication = Authentication;
		$scope.optionsCollapsed = true;
		$scope.addCollapsed = true;
		$scope.open = false;

		// Create new Group
		$scope.create = function() {
			// Create new Group object
			var group = new Groups ({
				name: this.name,
				open: $scope.open,
				users: [$scope.authentication.user._id]
			});
			
			// Redirect after save
			group.$save(function(response) {
				$location.path('groups/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Enroll in existing Group
		$scope.enroll = function() {
			var params = {
				token: this.token
			};
			
			$http.post('/groups/enroll', params).then(function(success) {
				if(success.data){
					$location.path('groups/' + success.data._id);
					$scope.token = '';
				}
			}, function(err) {
				$scope.error = err.data.message;
				$scope.token = '';
			});
		};

		// Remove existing Group
		$scope.remove = function() {
			var areYouSure = $window.confirm('Are you absolutely sure you want to delete this group? All information will be permanently lost.');
			
			if (areYouSure) {
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

		// Find a list of Groups
		$scope.find = function() {
			Groups.query({users: $scope.authentication.user._id}, function(groups) {
				var userGroups = [];
				for (var i = 0; i < groups.length; i++) {
					for (var u = 0; u < groups[i].users.length; u++) {
						if (String(groups[i].users[u]) === String($scope.authentication.user._id))
							userGroups.push(groups[i]);
					}
				}
				$scope.groups = groups;
			});
		};

		// Find existing Group
		$scope.findOne = function() {
			var listLength = 5;
			Groups.get({ 
				groupId: $stateParams.groupId
			}, function(group) {
				$http.get('groups/' + group._id + '/reading')
					.then(function(stats) {
						group.users = stats.data;
						$scope.group = group;

						if(group.recentMessages.length > listLength) {
							$scope.messages = group.recentMessages.slice(0, listLength);
							$scope.allmessages = group.recentMessages;
						} else $scope.messages = group.recentMessages;

						if(group.recentChapters.length > listLength) {
							$scope.chapters = group.recentChapters.slice(0, listLength);
							$scope.allchapters = group.recentChapters;
						} else $scope.chapters = group.recentChapters;
					});
				
			});
		};

		$scope.showAll = function(list) {
			var all = 'all' + list;
			$scope[list] = $scope[all];
			$scope[all] = [];
		};
	}
]);


/*
// Find existing Group
		$scope.findOne = function() {
			var listLength = 5;
			
			Groups.get({ 
				groupId: $stateParams.groupId
			}, function(group) {
				$http.get('groups/' + group._id + '/reading')
					.then(function(stats) {
						group.users = stats.data;
						$scope.group = group;

						if(group.recentMessages.length > listLength) {
							$scope.messages = group.recentMessages.slice(0, listLength);
							$scope.allmessages = group.recentMessages;
						} else $scope.messages = group.recentMessages;

						if(group.recentBadges.length > listLength) {
							$scope.badges = group.recentBadges.slice(0, listLength);
							$scope.allbadges = group.recentBadges;
						} else $scope.badges = group.recentBadges;
					});
				
			});
		};

*/