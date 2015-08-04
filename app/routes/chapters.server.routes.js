'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var chapters = require('../../app/controllers/chapters.server.controller');

	// Chapters Routes
	app.route('/chapters')
		.get(chapters.list)
		.post(users.requiresLogin, chapters.create);

	app.route('/reference')
		.get(chapters.reference);

	app.route('/range')
		.get(chapters.range);

	app.route('/chapters/user')
		.get(chapters.listUserChapters);

	app.route('/chapters/:chapterId/next')
		.get(chapters.getNextChapter);

	app.route('/chapters/:chapterId')
		.get(chapters.read)
		.put(users.requiresLogin, chapters.hasAuthorization, chapters.update)
		.delete(users.requiresLogin, chapters.hasAuthorization, chapters.delete);

	// Finish by binding the Chapter middleware
	app.param('chapterId', chapters.chapterByID);
};
