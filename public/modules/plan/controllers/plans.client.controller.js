'use strict';

angular.module('plan').controller('PlansController', ['$scope', '$modal', 'Authentication',
	function($scope, $modal, Authentication) {
		$scope.items = ['Whole Bible (Genesis 1 - Revelation 22)', 'Old Testament (Genesis 1 - Malachi 4)'];
		$scope.authentication = Authentication;
		
		$scope.open = function (size) {

			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/plan/views/plan-modal.html',
			  controller: 'ModalInstanceCtrl',
			  size: size,
			  resolve: {
			    items: function () {
			      return $scope.items;
			    }
			  }
			});

			modalInstance.result.then(function (selectedItem) {
			  $scope.selected = selectedItem;
			  console.log($scope.authentication.user.displayName + ' selected ' + selectedItem);
			}, function () {

			});
		};

	}

]);

angular.module('plan').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: null
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});