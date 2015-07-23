'use strict';

angular.module('chapters').directive('stateLoadingIndicator', ['$rootScope',
	function($rootScope) {
		return {
		    restrict: 'E',
		    template: '<div data-ng-show="isStateLoading" class="loading-indicator">' +
		    '<div class="loading-indicator-body">' +
		    '<h3 class="loading-title">Loading...</h3>' +
		    '<div class="spinner"><i class="fa fa-spin fa-spinner"></i></div>' +
		    '</div>' +
		    '</div>',
		    replace: true,
		    link: function(scope, elem, attrs) {
		      scope.isStateLoading = false;
		 
		      $rootScope.$on('$stateChangeStart', function() {
		        scope.isStateLoading = true;
		      });
		      $rootScope.$on('$stateChangeSuccess', function() {
		        scope.isStateLoading = false;
		      });
		    }
		};
	}
]);