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
	Application = mongoose.model('Application'),
	Training = mongoose.model('Training'),
	Message = mongoose.model('Message');

var adminFindUsers = q.nbind(User.find, User);
var adminUpdateUsers = q.nbind(User.findByIdAndUpdate, User);
var adminFindMessages = q.nbind(Message.find, Message);

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
exports.getAdminView = function(req, res) {
	q.all([
		adminFindUsers({}, '-password -salt -signature', {sort: {created: -1}})
		])
	.then(function(result) {
		res.jsonp(result);
	}).catch(function(e){
        return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	});
};

/**
 * Remove a user
 */
exports.removeUser = function(req, res) {
	var userId = req.param('userId');

	User.findByIdAndRemove(userId, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
				// cascade delete - delete all of this user's applications
			Application.remove({applicant: user.id}, function(err){
				res.jsonp(user);
			});
		}
	});
};

/**
 * Edit a user's roles
 */
exports.editRoles = function(req, res) {
	
	User.findByIdAndUpdate(req.body.userId, {roles: req.body.roles}, {new: true}, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};

exports.createTraining = function(req, res) {
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

exports.listTrainings = function(req, res) {
	Training.find({}).sort('-created').exec(function(err, trainings) {
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
 * Mass creates applications for a certain training (converts from old data)
 * This should only be needed once.
 */
exports.createApplications = function(req, res) {
		// find Users who have signed
	User.find({signature: {$exists: true}}).exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			Application.find({training: req.body.trainingId}).exec(function(err2, applied) {
				if (err2) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err2)
					});
				} else {
					var applications = [];
					for (var i = 0; i < users.length; i++) {
						
						var appliedAlready = false;
						for (var j = 0; j < applied.length; j++) {
								// if this user has already created an application
							if (applied[j].applicant.equals(users[i].id)) {
								appliedAlready = true;
							}
						}
							// push a new Application with this user
						if(!appliedAlready) {
							applications.push({
								applicant: users[i].id,
								training: req.body.trainingId,
								signature: users[i].signature
							});
						}
					}
					Application.create(applications, function(err3) {
						if (err3) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err3)
							});
						} else {
							var userUpdates = [];
							if (arguments) {	
								for (var i = 0; i < arguments.length; i++) {
									if(arguments[i] !== null) {
										userUpdates.push(adminUpdateUsers(arguments[i].applicant, {$push: {'applications': arguments[i].id}}));
									}
								}
							}
								// call all updates
							q.all(userUpdates)
							.then(function(result) {
								res.jsonp(result);
							}).catch(function(e){
						        return res.status(400).send({
									message: errorHandler.getErrorMessage(e)
								});
							});
						}
					});
				}
				
			});
		}
	});
};

exports.addReporterRole = function(req, res) {
		// if not already there, add 'reporter' role
	if (req.profile.roles.indexOf('reporter') < 0) {
		req.profile.roles.push('reporter');
	}
	User.findByIdAndUpdate(req.profile._id, {roles: req.profile.roles}, {new: true}, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			delete user.salt;
			delete user.password;

				// send email
			var emailInfo = {
				view: 'reporter',
				subject: 'Study Group Reports'
			};
			sendEmail(req.user, res, emailInfo);

			res.jsonp(user);
		}
	});
};

exports.removeReporterRole = function(req, res) {
		// if it exists, remove the 'reporter' role
	if (req.profile.roles.indexOf('reporter') > -1) {
		req.profile.roles.splice(req.profile.roles.indexOf('reporter'));
	}
	User.findByIdAndUpdate(req.profile._id, {roles: req.profile.roles}, {new: true}, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			delete user.salt;
			delete user.password;
			res.jsonp(user);
		}
	});
};

exports.isAdmin = function(req, res, next) {
	if(!req.user) return res.status(401).send({	message: 'User is not signed in'});
	if(_.indexOf(req.user.roles, 'admin') < 0) return res.status(401).send({	message: 'User is not authorized'});
	next();
};

exports.isReporter = function(req, res, next) {
	if(!req.user) return res.status(401).send({	message: 'User is not signed in'});
	if(_.indexOf(req.user.roles, 'admin') < 0 && _.indexOf(req.user.roles, 'approver') < 0 && _.indexOf(req.user.roles, 'reporter') < 0) return res.status(401).send({	message: 'User is not authorized'});
	next();
};