'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var trainings = require('../../app/controllers/trainings.server.controller');

	// Trainings Routes
	app.route('/trainings')
		.get(trainings.list)
		.post(users.isAdmin, trainings.create);

	app.route('/trainings/:trainingId')
		.get(trainings.read)
		.put(users.isAdmin, trainings.update)
		.delete(users.isAdmin, trainings.delete);

	// Finish by binding the Training middleware
	app.param('trainingId', trainings.trainingByID);
};
