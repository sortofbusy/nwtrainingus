'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll',
	function($scope, Authentication, $http, $q, $sce, $location, $anchorScroll) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		if ($scope.authentication.user) {
			if (!$scope.authentication.user.registered) $location.path('/register');
			else if (!$scope.authentication.user.consecrated) $location.path('/consecration');
		}

		
	}


]);