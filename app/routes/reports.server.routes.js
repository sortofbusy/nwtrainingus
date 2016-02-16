'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var reports = require('../../app/controllers/reports.server.controller');

	// Reports Routes
	app.route('/reports')
		.get(users.isReporter, reports.list)
		.post(users.isReporter, reports.create);

	app.route('/reports/:reportId')
		.get(users.isReporter, reports.read)
		.put(users.isReporter, reports.update)
		.delete(users.isReporter, reports.delete);

	// Finish by binding the Report middleware
	app.param('reportId', reports.reportByID);
};
