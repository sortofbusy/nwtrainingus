'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Group = mongoose.model('Group'),
	Chapter = mongoose.model('Chapter'),
	Message = mongoose.model('Message'),
	User = mongoose.model('User'),
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
	}
};

/**
 * Show the current Group
 */
exports.read = function(req, res, next) {
	try {
		var users = [];
		for (var i = 0; i < req.group.users.length; i++){
			users.push('ObjectId(\"' + req.group.users[i]._id + '\")');
		}
	
		var params = '{user: { $in: [' + users.join(', ') + ']}}';
		
		Chapter.find(params).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, chapters) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				req.group.recentChapters = chapters;
				next();
			}
		});
	} catch (e) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
};

/**
 * Adds recent messages
 */
exports.addMessages = function(req, res) {
	try {
		var params = {group: req.group._id};
		
		Message.find(params).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, messages) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				console.log(messages);
				req.group.recentMessages = messages;
				res.jsonp(req.group);
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
	var group = req.group;
	
	var now = new Date();
	group.modified = now;
	
	if (req.body.users) {
		for (var i = 0; i < req.body.users.length; i++) {
			if (req.body.users[i]._id) 
				req.body.users[i] = req.body.users[i]._id;
		}
		group.users = [];
	}

	if (req.body.creator) {
		req.body.creator = req.body.creator._id;
	} 

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
	//req.query.users = mongoose.Types.ObjectId(String(req.query.users));
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
		//return res.status(403).send('User is not authorized');
	}
	next();
};

exports.creatorAuthorization = function(req, res, next) {
	if (String(req.group.creator) !== String(req.user.id)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
