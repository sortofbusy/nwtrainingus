'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	config = require('../../config/config'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	Training = mongoose.model('Training'),
	Application = mongoose.model('Application'),
	_ = require('lodash');


/**
 * Send an email to users at different steps of the registration process
 */
var sendEmails = function(users, res, emailInfo) {
	res.render('templates/' + emailInfo.view, {
		appName: config.app.title,
		emailBody: emailInfo.body
	}, function(err, emailHTML) {
		if (err) return;
		var smtpTransport = nodemailer.createTransport(config.mailer.options);
		var bccEmails = users.join(';');
		var mailOptions = {
			bcc: bccEmails,
			from: config.mailer.from,
			subject: emailInfo.subject,
			html: emailHTML
		};
		
		smtpTransport.sendMail(mailOptions, function(err, response) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(response);
			}
		});
	});
};

/**
 * Create a Training
 */
exports.create = function(req, res) {
	var training = new Training(req.body);
	
	training.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(training);
		}
	});
};

/**
 * Show the current Training
 */
exports.read = function(req, res) {
	res.jsonp(req.training);
};

/**
 * Update a Training
 */
exports.update = function(req, res) {
	var training = req.training ;

	training = _.extend(training , req.body);

	training.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(training);
		}
	});
};

/**
 * Delete an Training
 */
exports.delete = function(req, res) {
	var training = req.training ;

	training.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(training);
		}
	});
};

/**
 * List of Trainings
 */
exports.list = function(req, res) { 
	Training.find().sort('-created').exec(function(err, trainings) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(trainings);
		}
	});
};

/**
 * List of Trainings
 * params: @mailBy: role | appStatus | selected
 * 			@mailByData: contains the data for mailBy
 */
exports.emails = function(req, res) { 
	if (!req.body.mailBy || !req.body.email.subject || !req.body.email.body) {
		return res.status(400).send({
			message: 'Please enter all information'
		});
	}
		// send email
	var emailInfo = {
		view: 'default',
		subject: req.body.email.subject,
		body: req.body.email.body
	};

	if (req.body.mailBy === 'role') {
		Application.find({training: req.training._id}).populate('applicant', 'roles email').exec(function(err, applications) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var mailByData = req.body.mailByData;
				var emails = [];
					// if a single parameter was passed, convert to array
				if(typeof mailByData === 'string')
					mailByData = [mailByData];

				for (var i = 0; i < applications.length; i++) {
					if(_.intersection(applications[i].applicant.roles, mailByData).length > 0)
						emails.push(applications[i].applicant.email);
				}
				
				sendEmails(emails, res, emailInfo);
			}
		});
	} else if (req.body.mailBy === 'appStatus') {
		Application.find({training: req.training._id, appStatus: req.body.mailByData}).populate('applicant', 'email').exec(function(err, applications) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var emails = [];

				for (var i = 0; i < applications.length; i++) {
					emails.push(applications[i].applicant.email);
				}
				
				sendEmails(emails, res, emailInfo);
			}
		});
	} else if (req.body.mailBy === 'selected') {
		sendEmails(req.body.mailByData, res, emailInfo);
	}
};

/**
 * Training middleware
 */
exports.trainingByID = function(req, res, next, id) { 
	Training.findById(id).exec(function(err, training) {
		if (err) return next(err);
		if (! training) return next(new Error('Failed to load Training ' + id));
		req.training = training ;
		next();
	});
};

/**
 * Training authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.training.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
