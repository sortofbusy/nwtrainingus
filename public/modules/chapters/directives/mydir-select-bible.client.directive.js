'use strict';

angular.module('chapters').directive('mydirSelectBible', [
	function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				refBook: '=refBook',
				refChapter: '=refChapter'
			},
			templateUrl: 'modules/chapters/views/select-bible.html'
		};
	}
]);