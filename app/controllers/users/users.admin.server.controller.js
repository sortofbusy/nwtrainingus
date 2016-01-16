'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	q = require('q'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Chapter = mongoose.model('Chapter'),
	Group = mongoose.model('Group'),
	Badge = mongoose.model('Badge'),
	Message = mongoose.model('Message');

var adminFindUsers = q.nbind(User.find, User);
var adminFindChapters = q.nbind(Chapter.find, Chapter);
var adminFindGroups = q.nbind(Group.find, Group);
var adminFindMessages = q.nbind(Message.find, Message);
var adminFindBadges = q.nbind(Badge.find, Badge);

/**
 * Update user details
 */
exports.getAdminView = function(req, res) {
	q.all([
		adminFindUsers({}, 'displayName email username provider preferences timezone plans roles created lastName firstName', {sort: {created: -1}}),
		adminFindChapters({}, 'user created', {sort: {created: -1}}),
		adminFindGroups({}, 'name users created', {sort: {created: -1}})
		])
	.then(function(result) {
		res.jsonp(result);
	}).catch(function(e){
        return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	});
};

exports.isAdmin = function(req, res, next) {
	if(!req.user) return res.status(401).send({	message: 'User is not signed in'});
	if(_.indexOf(req.user.roles, 'admin') < 0) return res.status(401).send({	message: 'User is not authorized'});
	next();
};