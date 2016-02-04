'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require('./config');
	
/**
 * Module init function.
 */
module.exports = function() {
	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		User.findOne({_id: id})
			.populate('applications', 'appStatus training')
			.populate('applications.training', 'name')
			.select('-salt -password')
			.exec(function(err, user) {
				User.populate(user, {
					path: 'applications.training',
					model: 'Training',
					select: 'name'
				}, function(err, user) {
					done(err, user);
				});
				
			});
	});

	// Initialize strategies
	config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};