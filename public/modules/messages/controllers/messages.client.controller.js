'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Messages',
	function($scope, $stateParams, $location, Authentication, Messages) {
		$scope.authentication = Authentication;

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
				$scope.message.$remove(function() {
					$location.path('messages');
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
			$scope.messages = Messages.query();
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			});
		};
	}
]);

angular.module('messages').controller('MessagesModalController', function ($scope, $sce, $modalInstance, Messages, Groups, Authentication, $window, verse) {
	$scope.groups = Groups.query();
	$scope.verse = verse;

	

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

	$scope.sceTrust = function(input) {
		return $sce.trustAsHtml(input);
	};

	$scope.create = function() {
		$scope.resultIcon = 'fa-check';
	};

	// Create new Message
	$scope.create = function(index) {
		// Create new Message object
		var group = $scope.groups[index];
		var message = new Messages ({
			text: $scope.comment,
			verse: $scope.verse,
			user: $scope.authentication.user._id,
			group: group._id
		});

		group.loading = true;
		// Redirect after save
		message.$save(function(response) {
			//$location.path('messages/' + response._id);

			// Clear form fields
			group.loading = false;
			group.resultIcon = 'fa-check';
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
			group.loading = false;
			group.resultIcon = 'fa-times';
		});
	};

});