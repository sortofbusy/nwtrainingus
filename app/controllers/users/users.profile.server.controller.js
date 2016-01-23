'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message');

/**
 * Send an email to users at different steps of the registration process
 */
var sendEmail = function(user, res, emailInfo) {
	res.render('templates/' + emailInfo.view, {
		name: user.firstName,
		appName: config.app.title
	}, function(err, emailHTML) {
		if (err) return;
		var smtpTransport = nodemailer.createTransport(config.mailer.options);
		var mailOptions = {
			to: user.email,
			from: config.mailer.from,
			subject: emailInfo.subject,
			html: emailHTML
		};
		smtpTransport.sendMail(mailOptions);
	});
};

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;
	var emailInfo = {};

	// if the user is completing the registration
	if (!user.consecrated && req.body.consecrated) {
		emailInfo.view = 'applied';
		emailInfo.subject = 'Application Completed';
	}
	// if the user is completing the registration
	if (!user.approved && req.body.approved) {
		emailInfo.view = 'approved';
		emailInfo.subject = 'Application Approved';
	}

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;
	delete req.body.approved;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if(emailInfo.view) {
					sendEmail(user, res, emailInfo);
				}
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

exports.getMessages = function(req, res) {
	if(!req.user) return res.status(400).send({	message: 'User is not signed in'});
	Message.find({user: req.user}).populate('group', 'name').sort('-created').limit(10).exec(function(err, messages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messages);
		}
	});
};