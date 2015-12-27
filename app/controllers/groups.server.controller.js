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
	group.users = [req.user];
	
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
 * Show the current Group
 */
exports.read = function(req, res, next) {
	try {
	
		Chapter.find().where('user').in(req.group.users).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, chapters) {
			if (err) {
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
//{user: { $in: [ObjectId("55a75731b6e730ac00af9919")]}}


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

	Group.findOneAndUpdate({_id: group._id}, {name: req.body.name, modified: req.body.modified}, {upsert: true}, function(err, newGroup) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(newGroup);
		}
	});
};

/**
 * Delete a Group
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
	Group.find().sort('-created').exec(function(err, groups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else { 
			res.jsonp(groups);
		}
	});
};

exports.getChapters = function(req, res) {
	var group = req.group;
	try {
		var params = {user: req.group.creator};
		
		Chapter.find(params).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, chapters) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				res.jsonp(chapters);
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
exports.getMessages = function(req, res) {
	try {
		var params = {group: req.group._id};
		
		Message.find(params).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, messages) {
			if (err) {
				throw err;
			} else {
				console.log(messages);
				res.jsonp(messages);
			}
		});
	} catch (e) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
};

exports.addUser = function(req, res) {
	req.group.users.push(req.body.newUser._id);
	
	req.group.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(req.group);
		}
	});
};

/**
 * Group middleware
 */
exports.groupByID = function(req, res, next, id) { 
	Group.findById(id).exec(function(err, group) {
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
