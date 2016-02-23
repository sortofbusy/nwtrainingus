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
	Group = mongoose.model('Group'),
	Report = mongoose.model('Report');

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

exports.reportAttendance = function(req, res) {
	if (req.user.roles.indexOf('approver') < 0 && req.user.roles.indexOf('admin') < 0){
		res.jsonp([]);
	} else {
		var params = {};
		if (req.profile) {
			params = {
				$or: [
					{'absent.userId': req.profile._id},
					{'present': req.profile._id}
				]
			};
		}

		Report.find(params).lean().sort('-sessionDate').populate('user present absent.userId', 'displayName').populate('group').exec(function(err, reports) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var returnUser = req.profile;
				returnUser.password = '';
				returnUser.salt = '';
				
				reports = {
					user: returnUser,
					reports: reports
				};
				res.jsonp(reports);
			}
		});
	}
};