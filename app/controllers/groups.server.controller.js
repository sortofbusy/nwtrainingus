'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Group = mongoose.model('Group'),
	Chapter = mongoose.model('Chapter'),
	_ = require('lodash');

/**
 * Create a Group
 */
exports.create = function(req, res) {
	var group = new Group(req.body);
	
	group.creator = req.user._id;
	try {
		group.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(group);
			}
		});
	} catch (e) {
		console.log(e);
	}
};

/**
 * Show the current Group
 */
exports.read = function(req, res) {
	var resGroup = req.group;
	try {
		var users = [];
		for (var i = 0; i < req.group.users.length; i++){
			users.push('ObjectId(\"' + req.group.users[i]._id + '\")');
		}
	
		var params = '{user: { $in: [' + users.join(', ') + ']}}';
		
		Chapter.find(params).sort('-created').limit(5).populate('user', 'displayName').exec(function(err, chapters) {
			if (err) {
				throw new Error(err);
			} else {
				resGroup.recentChapters = chapters;
				res.jsonp(resGroup);
			}
		});
	} catch (e) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
};

/**
 * Update a Group
 */
exports.update = function(req, res) {
	var group = req.group ;
	
	var now = new Date();
	group.modified = now;
	
	group = _.extend(group , req.body);

	group.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(group);
		}
	});
};

/**
 * Delete an Group
 */
exports.delete = function(req, res) {
	var group = req.group ;

	group.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(group);
		}
	});
};

/**
 * List of Groups
 */
exports.list = function(req, res) { 
	Group.find().sort('-created').populate('creator', 'displayName').exec(function(err, groups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(groups);
		}
	});
};

/**
 * Group middleware
 */
exports.groupByID = function(req, res, next, id) { 
	Group.findById(id).populate('users', 'displayName').exec(function(err, group) {
		if (err) return next(err);
		if (! group) return next(new Error('Failed to load Group ' + id));
		req.group = group ;
		next();
	});
};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.group.users.indexOf(req.user.id) === -1) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.creatorAuthorization = function(req, res, next) {
	if (String(req.group.creator) !== String(req.user.id)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
