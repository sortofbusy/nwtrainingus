'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var groups = require('../../app/controllers/groups.server.controller');

	// Groups Routes
	app.route('/groups')
		.get(users.isApprover, groups.list)
		.post(users.isApprover, groups.create);

	app.route('/groups/unassigned')
		.get(users.isApprover, groups.unassigned);

	app.route('/groups/:groupId')
		.get(groups.read)
		.put(users.isApprover, groups.update)
		.delete(users.isApprover, groups.delete);

	// Finish by binding the Group middleware
	app.param('groupId', groups.groupByID);
};
