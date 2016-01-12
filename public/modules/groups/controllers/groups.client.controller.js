'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Groups', 'Chapters', '$window', 'Messages',
	function($scope, $http, $stateParams, $location, Authentication, Groups, Chapters, $window, Messages) {
		$scope.authentication = Authentication;
		$scope.optionsCollapsed = true;
		$scope.addCollapsed = true;
		$scope.open = false;
		$scope.toggleHidden = false;
		$scope.toggleClass = 'off';

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

						$scope.getComments();

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

		// expands a list to show all
		$scope.showAll = function(list) {
			var all = 'all' + list;
			$scope[list] = $scope[all];
			$scope[all] = [];
		};

		$scope.getComments = function() {
			$http.get('groups/' + $scope.group._id + '/comments')
					.then(function(response) {
						var comments = response.data;
						var listLength = 4;
			
						if(comments.length > listLength) {
							$scope.comments = comments.slice(0, listLength);
							$scope.allcomments = comments;
						} else $scope.comments = comments;
					});
		};

		// add a comment
		$scope.createComment = function() {
			if (!$scope.comment || $scope.comment === '') {
				return;
			}
			var comment = new Messages({
				text: $scope.comment,
				user: $scope.authentication.user._id,
				group: $scope.group._id
			});

			// Redirect after save
			comment.$save(function(response) {
				$scope.getComments();

				// Clear form fields
				$scope.comment = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.toggle = function() {
			$scope.toggleHidden = !$scope.toggleHidden;
			if ($scope.toggleClass === 'on') $scope.toggleClass = 'off';
			else $scope.toggleClass = 'on';
		};
	}
]);