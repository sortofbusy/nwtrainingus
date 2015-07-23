'use strict';

angular.module('plan').directive('mydirPlanModal', [
	function() {
		return {
			templateUrl: 'modules/plan/views/mydir-plan-modal.html',
			restrict: 'E'
		};
	}
]);