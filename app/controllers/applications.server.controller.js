'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Application = mongoose.model('Application'),
	User = mongoose.model('User'),
	_ = require('lodash');

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
