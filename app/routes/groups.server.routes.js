'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var groups = require('../../app/controllers/groups.server.controller');

	// Groups Routes
	app.route('/groups')
		.get(users.requiresLogin, groups.list)
		.post(users.requiresLogin, groups.create);

	app.route('/groups/:groupId')
		.get(groups.hasAuthorization, groups.read, groups.addMessages)
		.put(users.requiresLogin, groups.creatorAuthorization, groups.update)
		.delete(users.requiresLogin, groups.creatorAuthorization, groups.delete);

	app.route('/groups/:groupId/chapters')
		.get(groups.hasAuthorization, groups.getChapters);

	app.route('/groups/:groupId/messages')
		.get(groups.hasAuthorization, groups.getMessages);

	app.route('/groups/enroll')
		.post(users.requiresLogin, groups.addUser);

	app.route('/groups/:groupId/unenroll')
		.post(groups.hasAuthorization, groups.removeUser);
		
	// Finish by binding the Group middleware
	app.param('groupId', groups.groupByID);
};
