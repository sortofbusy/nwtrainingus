'use strict';

//Setting up route
angular.module('applications').config(['$stateProvider',
	function($stateProvider) {
		// Groups state routing
		$stateProvider.
		state('listApplications', {
			url: '/applications?locality',
			templateUrl: 'modules/applications/views/list-applications.client.view.html'
		}).
		state('viewApplications', {
			url: '/applications/:applicationId',
			templateUrl: 'modules/applications/views/view-application.client.view.html'
		})
		.state('roster', {
			url: '/roster',
			templateUrl: 'modules/applications/views/roster.client.view.html'
		})
		.state('rostertest', {
			url: '/rostertest',
			templateUrl: 'modules/applications/views/rostertest.client.view.html'
		});
	}
]);