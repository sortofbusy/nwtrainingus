'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var plans = require('../../app/controllers/plans.server.controller');

	// Plans Routes
	app.route('/plans')
		.get(users.requiresLogin, plans.list)
		.post(users.requiresLogin, plans.create);

	

	app.route('/plans/:planId')
		.get(users.requiresLogin, plans.hasAuthorization, plans.read)
		.put(users.requiresLogin, plans.hasAuthorization, plans.update)
		.delete(users.requiresLogin, plans.hasAuthorization, plans.delete);
	
	app.route('/plans/:planId/advance')
		.post(users.requiresLogin, plans.hasAuthorization, plans.advance);
	
	app.route('/plans/:planId/today')
		.get(users.requiresLogin, plans.hasAuthorization, plans.readToday);

	

	// Finish by binding the Plan middleware
	app.param('planId', plans.planByID);
};
