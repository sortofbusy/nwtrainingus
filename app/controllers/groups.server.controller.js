'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Group = mongoose.model('Group'),
	User = mongoose.model('User'),
	Application = mongoose.model('Application'),
	_ = require('lodash');

/**
 * Create a Group
 */
exports.create = function(req, res) {
	var group = new Group(req.body);
	group.user = req.user;

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
exports.read = function(req, res) {
	res.jsonp(req.group);
};

/**
 * Update a Group
 */
exports.update = function(req, res) {
	var group = req.group ;

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
	Group.find().sort('created').populate('users', 'displayName locality').exec(function(err, groups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(groups);
		}
	});
};


// TODO - move this to Users module? 
exports.compareUsers = function(arrVal, othVal) {
	return _.isEqual(arrVal._id, othVal._id);
};


/**
 * List of ungrouped Users in a locality
 */
exports.unassigned = function(req, res) { 
	var assignedUsers = [];
	var params = {};
	// if the approver is from Oregon or Eastern Washington, search the area
	if (req.user.locality.area !== '') params = {'locality.area': req.user.locality.area};
	else params = {'locality.name': req.user.locality.name};

	// get all Users from req.user's locality that are in a study group
	Group.find(params).populate('users', 'displayName').exec(function(err, groups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			for (var i = 0; i < groups.length; i++) {
				assignedUsers = assignedUsers.concat(groups[i].users);
			}
				// find all users from that locality
			Application.find({appStatus: 'Approved'}).populate('applicant', 'displayName locality').select('-signature').exec(function(err, users) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var unassignedUsers = [];
					var isAssigned = false;
						// loop through users, check if they are assigned
					for (var u = 0; u < users.length; u++) {
							// because MongoDB can't join, manually skip users that don't match either
							// the locality (name) or area of the requesting user
						if (req.user.locality.area !== '') {
							if (users[u].applicant.locality.area !== req.user.locality.area) continue;
						} else {
							if (users[u].applicant.locality.name !== req.user.locality.name) continue;
						}

						isAssigned = false;
						for (var a = 0; a < assignedUsers.length; a++) {
							if (String(users[u].applicant._id) === String(assignedUsers[a]._id)) isAssigned = true;
						}
						if (!isAssigned) unassignedUsers.push(users[u].applicant);
					}
					console.log(users);
					console.log(assignedUsers);
					console.log(unassignedUsers);
					res.jsonp(unassignedUsers);
				}
			});
			
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
	if (req.group.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
