'use strict';

//Trainings service used to communicate Trainings REST endpoints
angular.module('trainings').factory('Trainings', ['$resource',
	function($resource) {
		return $resource('trainings/:trainingId', { trainingId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);