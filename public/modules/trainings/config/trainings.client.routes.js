'use strict';

//Setting up route
angular.module('trainings').config(['$stateProvider',
	function($stateProvider) {
		// Trainings state routing
		$stateProvider.
		state('listTrainings', {
			url: '/trainings',
			templateUrl: 'modules/trainings/views/list-trainings.client.view.html'
		}).
		state('createTraining', {
			url: '/trainings/create',
			templateUrl: 'modules/trainings/views/create-training.client.view.html'
		}).
		state('viewTraining', {
			url: '/trainings/:trainingId',
			templateUrl: 'modules/trainings/views/view-training.client.view.html'
		}).
		state('editTraining', {
			url: '/trainings/:trainingId/edit',
			templateUrl: 'modules/trainings/views/edit-training.client.view.html'
		});
	}
]);