'use strict';

angular.module('chapters').directive('mydirShowChapterText', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'modules/chapters/views/show-chapter-text.html',
			
		};
	}
]);