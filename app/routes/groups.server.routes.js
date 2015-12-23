'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var groups = require('../../app/controllers/groups.server.controller');

	// Groups Routes
	app.route('/groups')
		.get(groups.list)
		.post(users.requiresLogin, groups.create);

	app.route('/groups/:groupId')
		.get(groups.read, groups.addMessages)
		.put(users.requiresLogin, groups.creatorAuthorization, groups.update)
		.delete(users.requiresLogin, groups.creatorAuthorization, groups.delete);

	// Finish by binding the Group middleware
	app.param('groupId', groups.groupByID);
};
