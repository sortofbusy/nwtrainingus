'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var applications = require('../../app/controllers/applications.server.controller');

	// Applications Routes
	app.route('/applications')
		.get(users.requiresLogin, applications.list)
		.post(users.requiresLogin, applications.create);

	app.route('/applications/:applicationId')
		.get(applications.hasAuthorization, applications.read)
		.put(applications.hasAuthorization, applications.update)
		.delete(applications.hasAuthorization, applications.delete);
		
	// Finish by binding the application middleware
	app.param('applicationId', applications.applicationByID);
};
