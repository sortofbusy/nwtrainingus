'use strict';

angular.module('chapters').directive('mydirNavChapter', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'modules/chapters/views/nav-chapter.html'
		};
	}
]);