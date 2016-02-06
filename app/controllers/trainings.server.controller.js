'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Training = mongoose.model('Training'),
	_ = require('lodash');

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
