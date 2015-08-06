'use strict';

//Setting up route
angular.module('badges').config(['$stateProvider',
	function($stateProvider) {
		// Badges state routing
		$stateProvider.
		state('listBadges', {
			url: '/badges',
			templateUrl: 'modules/badges/views/list-badges.client.view.html'
		}).
		state('createBadge', {
			url: '/badges/create',
			templateUrl: 'modules/badges/views/create-badge.client.view.html'
		}).
		state('viewBadge', {
			url: '/badges/:badgeId',
			templateUrl: 'modules/badges/views/view-badge.client.view.html'
		}).
		state('editBadge', {
			url: '/badges/:badgeId/edit',
			templateUrl: 'modules/badges/views/edit-badge.client.view.html'
		});
	}
]);