'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var badges = require('../../app/controllers/badges.server.controller');

	// Badges Routes
	app.route('/badges')
		.get(badges.list)
		.post(users.requiresLogin, badges.create);

	app.route('/badges/:badgeId')
		.get(badges.read)
		.put(users.requiresLogin, badges.hasAuthorization, badges.update)
		.delete(users.requiresLogin, badges.hasAuthorization, badges.delete);

	// Finish by binding the Badge middleware
	app.param('badgeId', badges.badgeByID);
};
