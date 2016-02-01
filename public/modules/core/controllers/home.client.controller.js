'use strict';


angular.module('core').controller('HomeController', ['$scope', '$window', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll', 'Users', '$uibModal', 'Applications',
	function($scope, $window, Authentication, $http, $q, $sce, $location, $anchorScroll, Users, $uibModal, Applications) {
		// This provides Authentication context.
		$scope.user = Authentication.user;
		$scope.windowWidth = $window.innerWidth;
		$http.get('/trainings').success( function(response) {
			$scope.trainings = response;
		});

		$scope.localities = [
			'Bellevue',
			'Bellingham', 
			'Everett', 
			'Olympia',
			'Portland',
			'Renton', 
			'Seattle',
			'Shoreline', 
			'Tacoma', 
			'Vancouver' 
		];

		$scope.checkRegistration = function() {
			if(!$scope.user.hasOwnProperty('age') || !$scope.user.hasOwnProperty('phone') || $scope.user.phone === '' || 
				!$scope.user.hasOwnProperty('locality') || !$scope.user.hasOwnProperty('occupation') || 
				!$scope.user.hasOwnProperty('serviceAreas')) {
					$scope.error = 'Please fill every field';
			}
			else {
				$scope.user.registered = Date.now();
				var user = new Users($scope.user);

				user.$update($scope.user, function(response) {
					$location.path('/');
					$anchorScroll();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.consecrate = function() {
			
			if(!$scope.signature || $scope.signature.isEmpty) {
				$scope.error = 'Please sign the form to continue';
			} else {
				$scope.user.consecrated = Date.now();
				var user = new Users($scope.user);
				var application = new Applications({
					training: $scope.trainings[0]._id,
					signature: $scope.signature.dataUrl	
				});

				application.$save(function(response) {
					user.applications.push(response._id);
					user.$update(user, function(response) {
						$location.path('/');
						
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
				
			}
		};

		$scope.signModal = function() {
			var modal = $uibModal.open({
				  animation: true,
				  templateUrl: 'modules/core/views/sign-modal.html',
				  controller: 'SignModalCtrl',
				  size: 'md'
				});
			modal.result.then(function(signature) {
				$scope.signature = {dataUrl: signature};
				$scope.consecrate();
			}, function() {
				$scope.error = 'Please sign the form to continue';
			});
		};



		$scope.showApplications = function() {
			$http.get('/users/applications').success( function(response) {
				$scope.applications = response;
			});
		};

		
	}


]);

angular.module('core').controller('SignModalCtrl', [
  '$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.done = function () {
      var signature = $scope.accept();

      if (signature.isEmpty) {
        $uibModalInstance.dismiss();
      } else {
        $uibModalInstance.close(signature.dataUrl);
      }
    };
  }
]);