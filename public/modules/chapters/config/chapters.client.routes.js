'use strict';

//Setting up route
angular.module('chapters').config(['$stateProvider',
	function($stateProvider) {
		// Chapters state routing
		$stateProvider.
		state('listChapters', {
			url: '/chapters',
			templateUrl: 'modules/chapters/views/list-chapters.client.view.html'
		}).
		state('createChapter', {
			url: '/chapters/create',
			templateUrl: 'modules/chapters/views/create-chapter.client.view.html'
		}).
		state('viewChapter', {
			url: '/chapters/:chapterId',
			templateUrl: 'modules/chapters/views/view-chapter.client.view.html'
		}).
		state('editChapter', {
			url: '/chapters/:chapterId/edit',
			templateUrl: 'modules/chapters/views/edit-chapter.client.view.html'
		});
	}
]);