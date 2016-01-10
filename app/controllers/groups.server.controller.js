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


/**
 * Adds recent messages
 */
exports.addMessages = function(req, res) {
	try {
		var params = {group: req.group._id, verse: {$exists: true}};
		
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

	Group.findOneAndUpdate({_id: group._id}, {name: req.body.name, open: req.body.open, modified: req.body.modified}, {upsert: true}, function(err, newGroup) {
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
	Group.find({users: req.user}).sort('-created').exec(function(err, groups) {
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

/**
 * Adds recent messages
 */
exports.getComments = function(req, res) {
	try {
		var params = {group: req.group._id, verse: {$exists: false}};
		
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

/**
 * Return the number of chapters each group member has read
 */
exports.getReadingStats = function(req, res) {
	try {
		// begin query, aggregate Chapters		
		Chapter.aggregate()
			.match({ // only find chapters created by users in this Group in the last week
				user: {$in: req.group.users.map(function(user){ return new mongoose.Types.ObjectId(user._id); })},
				created: {$gt: new Date(Date.now() - 7*24*60*60*1000)}
			}) 
			.group({ // group by user, add the count 
				_id: '$user', 
				count: {$sum: 1}
			})
			.exec(function(err, chapters) {
				if (err) throw err;
				
				// find users in the Group who have read 0 chapters, add entries for them
				var foundIds = _.map(_.pluck(chapters, '_id'),function(i){return String(i);} );
				var groupIds = _.map(_.pluck(req.group.users, '_id'),function(i){return String(i);} );
				var diff = _.difference(groupIds, foundIds);
				for(var i=0; i<diff.length; i++) {
					chapters.push({
						_id: diff[i],
						count: 0
					});
				}

				// populate the result with displayName
				User.populate(chapters, {
					'path': '_id',
					'select': 'displayName'
				}, function(e, results) {
					if (e) throw e;
					res.jsonp(results);
				});			
			});
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
};

exports.addUser = function(req, res) {
	Group.findOne({accessToken: req.body.token}).exec(function(err, group) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if (!group) return res.status(400).send({
				message: 'Token not found'
			});

			// check if this user is already in this group (because mongoDB doesn't handle
			// indexes on subdocuments apparently)
			for(var i=0; i < group.users.length; i++) {
				if (String(group.users[i]) === String(req.user._id)) {
					return res.status(400).send({
						message: 'User already a member of this group'
					});
				}
			}

			group.users.push(req.user._id);
			group.save(function (err, savedGroup) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(savedGroup);
				}
			});
		}
	});
};

exports.removeUser = function(req, res) {
	if(String(req.user.id) === String(req.group.creator)) return res.status(400).send({
				message: 'Cannot remove creator from group'
			});
	for(var i=0; i < req.group.users.length; i++) {
		if (req.group.users[i].id === req.user.id) {
			req.group.users.splice(i, 1);
			break;
		}
	}

	req.group.save(function (err, savedGroup) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(savedGroup);
		}
	});
};

/**
 * Group middleware
 */
exports.groupByID = function(req, res, next, id) { 
	Group.findById(id).populate('users', 'displayName').exec(function(err, group) {
		if (err) return res.status(401).send('User is not authorized'); //return next(err);
		if (! group) return res.status(401).send('User is not authorized'); //next(new Error('Failed to load Group ' + id));
		req.group = group ;
		next();
	});
};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	var authorized = false;
	for(var i=0; i < req.group.users.length; i++) {
		if (req.group.users[i].id === req.user.id) authorized = true;
	}

	if (!authorized) return res.status(403).send('User is not authorized');

	next();
};

exports.creatorAuthorization = function(req, res, next) {
	if (!req.user || (String(req.group.creator) !== String(req.user.id))) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
