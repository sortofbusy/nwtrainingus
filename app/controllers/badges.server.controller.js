'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Badge = mongoose.model('Badge'),
	_ = require('lodash');

/**
 * Create a Badge
 */
exports.create = function(req, res) {
	var badge = new Badge(req.body);
	badge.user = req.user;

	badge.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(badge);
		}
	});
};

/**
 * Show the current Badge
 */
exports.read = function(req, res) {
	res.jsonp(req.badge);
};

/**
 * Update a Badge
 */
exports.update = function(req, res) {
	var badge = req.badge ;

	badge = _.extend(badge , req.body);

	badge.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(badge);
		}
	});
};

/**
 * Delete an Badge
 */
exports.delete = function(req, res) {
	var badge = req.badge ;

	badge.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(badge);
		}
	});
};

/**
 * List of Badges
 */
exports.list = function(req, res) { 
	Badge.find().sort('-created').populate('user', 'displayName').exec(function(err, badges) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(badges);
		}
	});
};

/**
 * Badge middleware
 */
exports.badgeByID = function(req, res, next, id) { 
	Badge.findById(id).populate('user', 'displayName').exec(function(err, badge) {
		if (err) return next(err);
		if (! badge) return next(new Error('Failed to load Badge ' + id));
		req.badge = badge ;
		next();
	});
};

/**
 * Badge authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.badge.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
