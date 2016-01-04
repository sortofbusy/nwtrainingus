'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var groups = require('../../app/controllers/groups.server.controller');
	var chapters = require('../../app/controllers/chapters.server.controller');

	// Chapters Routes
	app.route('/chapters')
		.get(users.requiresLogin, chapters.list)
		.post(users.requiresLogin, chapters.create);

	app.route('/reference')
		.get(chapters.reference);

	app.route('/read')
		.post(chapters.readChapter);

	app.route('/chapters/:chapterId')
		.get(chapters.read)
		.put(users.requiresLogin, chapters.hasAuthorization, chapters.update)
		.delete(users.requiresLogin, chapters.hasAuthorization, chapters.delete);

	// Finish by binding middleware
	app.param('chapterId', chapters.chapterByID);
	app.param('userId', users.userByID);
	app.param('groupId', groups.groupByID);
};
