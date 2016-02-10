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
	Application = mongoose.model('Application');

var adminFindApplications = q.nbind(Application.find, Application);

/**
 * Get list of applications
 */
exports.getApplications = function(req, res) {
	var params = {signature: {$exists: true}};
	// if the user is not an admin, show only the applications for their locality
	// if(_.indexOf(req.user.roles, 'admin') < 0) params.locality = req.user.locality;

	adminFindApplications(params, '-password -salt -roles', {sort: {created: -1}})
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