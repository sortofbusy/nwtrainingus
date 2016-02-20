'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	config = require('../../config/config'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	Application = mongoose.model('Application'),
	User = mongoose.model('User'),
	Report = mongoose.model('Report'),
	_ = require('lodash');

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
 * Create an application
 */
exports.create = function(req, res) {
	var application = new Application(req.body);
	application.applicant = req.user._id;
	application.appStatus = 'Pending';
	application.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
				// send email
			var emailInfo = {
				view: 'applied',
				subject: 'Application Completed'
			};
			sendEmail(req.user, res, emailInfo);

			res.jsonp(application);
		}
	});
};

/**
 * Show the current Application
 */
exports.read = function(req, res) {
	try {
		
		res.jsonp(req.application);
	} catch (e) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
};


/**
 * Update an Application
 */
exports.update = function(req, res) {
	var application = req.application;
	
	var now = new Date();
	application.modified = now;

	Application.findOneAndUpdate(
		{_id: application._id}, 
		{
			name: req.body.name, 
			modifiedBy: req.user._id, 
			modified: req.body.modified, 
			appStatus: req.body.appStatus
		}, {upsert: true}, function(err, newapplication) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(newapplication.appStatus === 'Approved') {
					// send approval email
				var emailInfo = {
					view: 'approved',
					subject: 'Application Approved'
				};
				User.findById(newapplication.applicant).exec(function(err, applicant) {
					if (!err) sendEmail(applicant, res, emailInfo);
				});
			}
			
			res.jsonp(newapplication);
		}
	});
};

/**
 * Delete an Application
 */
exports.delete = function(req, res) {
	var application = req.application ;

	application.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(application);
		}
	});
};

/**
 * List of Applications
 */
exports.list = function(req, res) { 
	Application.find({}).populate('applicant modifiedBy', '-password -salt').populate('training').sort('-created').exec(function(err, applications) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else { 
			res.jsonp(applications);
		}
	});
};

/**
 * Roster with attendance info
 */
exports.roster = function(req, res) { 
	var applications;
	// lean() returns a plain JS object instead of a full model instance 
	Application.find({appStatus: 'Approved'}).lean().populate('applicant modifiedBy', '-password -salt').populate('training').sort('-created').exec(function(err, applicationResponse) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			applications = applicationResponse; 
			Report.find().select('absent').exec(function(err, reports) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else { 
					for (var k = 0; k < applications.length; k++) {
						applications[k].applicant.absences = 0;
						applications[k].applicant.unexcused = 0;
						for (var i = 0; i < reports.length; i++) {
							for (var j = 0; j < reports[i].absent.length; j++) {
									if (String(applications[k].applicant._id) === String(reports[i].absent[j].userId)) {
										applications[k].applicant.absences++;
										if(!reports[i].absent[j].excused)
											applications[k].applicant.unexcused++;
									}
							}
						}
					}
					res.jsonp(applications);
				}
			});
		}
	});
};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) { 
	Application.findById(id).populate('applicant modifiedBy', '-password -salt').populate('training').exec(function(err, application) {
		if (err) return res.status(401).send('User is not authorized'); //return next(err);
		if (! application) return res.status(401).send('User is not authorized'); //next(new Error('Failed to load Group ' + id));
		req.application = application;
		next();
	});
};

/**
 * Application authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if(!req.user) return res.status(401).send({	message: 'User is not signed in'});
	if(_.indexOf(req.user.roles, 'admin') < 0 && _.indexOf(req.user.roles, 'approver') < 0) return res.status(401).send({	message: 'User is not authorized'});
	next();
};
