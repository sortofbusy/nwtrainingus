'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Messages',
	function($scope, $http, $stateParams, $location, Authentication, Messages) {
		$scope.authentication = Authentication;
		
		// If user is not signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/');

		// Create new Message
		$scope.create = function() {
			// Create new Message object
			var message = new Messages ({
				name: this.name
			});

			// Redirect after save
			message.$save(function(response) {
				$location.path('messages/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Message
		$scope.remove = function(message) {
			if ( message ) { 
				message.$remove();

				for (var i in $scope.messages) {
					if ($scope.messages [i] === message) {
						$scope.messages.splice(i, 1);
					}
				}
			} else {
				// if the group is not set, return to user profile. Otherwise, return
				// to view-group
				$scope.newPath = '/settings/profile';
				if ($scope.message.group) $scope.newPath = '/groups/' + $scope.message.group;

				$scope.message.$remove(function() {
					$location.path($scope.newPath);
				});
			}
		};

		// Update existing Message
		$scope.update = function() {
			var message = $scope.message;

			message.$update(function() {
				$location.path('messages/' + message._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Messages
		$scope.find = function() {
			$http.get('/users/messages').success(function(response) {
				$scope.messages = response;
			});
			//$scope.messages = Messages.query();
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			});
		};
	}
]);

angular.module('messages').controller('MessagesModalController', function ($scope, $http, $sce, $uibModalInstance, Messages, Groups, Authentication, $window, verse) {
	$http.get('/groups').success(function(response) {
		$scope.groups = response;
	});
	
	$scope.verse = verse;
	$scope.personalNote = {};

	$scope.authentication = Authentication;
	$scope.selected = {
		item: null
	};
	$scope.alerts = [];
	$scope.updateAlerts = [];
	$scope.status = {
	isopen: false
	};

	$scope.ok = function () {
		$uibModalInstance.close($scope.plans);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.closeAlert = function(index){
	    $scope.alerts.splice(index, 1);
	};

	$scope.closeUpdateAlert = function(index){
	    $scope.updateAlerts.splice(index, 1);
	};

	$scope.sceTrust = function(input) {
		return $sce.trustAsHtml(input);
	};

	$scope.create = function() {
		$scope.resultIcon = 'fa-check';
	};

	// Create new Message
	$scope.create = function(index) {
		// Create new Message object
		var message = new Messages ({
			text: $scope.comment,
			verse: $scope.verse,
			user: $scope.authentication.user._id
		});
		
		var group;
		// if an index is passed, save to a group, otherwise save as a personal note (no group id)
		if (index < 0) {
			group = $scope.personalNote;
		}
		else {
			group = $scope.groups[index];
			message.group = group._id;
		}
		
		group.loading = true;
		// Redirect after save
		message.$save(function(response) {
			//$location.path('messages/' + response._id);

			// Clear form fields
			group.loading = false;
			group.resultIcon = 'fa-check';
			group.disabled = true;
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
			group.loading = false;
			group.resultIcon = 'fa-times';
		});
	};

});