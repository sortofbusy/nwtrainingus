'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	q = require('q'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	User = mongoose.model('User'),
	Group = mongoose.model('Group'),
	Message = mongoose.model('Message');

var adminFindUsers = q.nbind(User.find, User);
var adminFindGroups = q.nbind(Group.find, Group);
var adminFindMessages = q.nbind(Message.find, Message);

/**
 * Update user details
 */
exports.getApplications = function(req, res) {
	adminFindUsers({signature: {$exists: true}, approved: {$exists: false}}, '-password -salt', {sort: {created: -1}})
	.then(function(result) {
		res.jsonp(result);
	}).catch(function(e){
        return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	});
};

exports.isApprover = function(req, res, next) {
	if(!req.user) return res.status(401).send({	message: 'User is not signed in'});
	if(_.indexOf(req.user.roles, 'admin') < 0 && _.indexOf(req.user.roles, 'approver') < 0) return res.status(401).send({	message: 'User is not authorized'});
	next();
};