'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var groups = require('../../app/controllers/groups.server.controller');
	var reports = require('../../app/controllers/reports.server.controller');

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

	app.route('/groups/:groupId/reports')
		.get(users.isReporter, reports.list)
		.post(users.isReporter, reports.create);
	
	app.route('/groups/:groupId/reports/:reportId')
		.get(users.isReporter, reports.read)
		.put(users.isReporter, reports.update)
		.delete(users.isReporter, reports.delete);

	// Finish by binding the Group middleware
	app.param('groupId', groups.groupByID);
};
