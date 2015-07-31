'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Plan = mongoose.model('Plan'),
	Chapter = mongoose.model('Chapter'),
	_ = require('lodash');

/**
 * Create a Plan
 */
exports.create = function(req, res) {
	var plan = new Plan(req.body);
	plan.user = req.user;
	plan.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * Show the current Plan
 */
exports.read = function(req, res) {
	res.jsonp(req.plan);
};

/**
 * Update a Plan
 */
exports.update = function(req, res) {
	var plan = req.plan ;
		//replace populated chapters with only _ids
	if (req.body.chapters) {
		for (var i = 0; i < req.body.chapters.length - 1; i++) {
			if (req.body.chapters[i]._id) 
				req.body.chapters[i] = req.body.chapters[i]._id;
		}
		plan.chapters = [];
	}
	plan = _.extend(plan , req.body);
	plan.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * Delete an Plan
 */
exports.delete = function(req, res) {
	var plan = req.plan ;

	plan.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * List of Plans
 */
exports.list = function(req, res) { 
	var d = new Date(Date.now());
	var year = d.getFullYear(); 
	var month = d.getMonth(); // for reference, month is 0-11
	var date = d.getDate(); // date is the day of month 1-31
	
	Plan.find().sort('-created').populate({
			path: 'chapters',
			match:  {created: {'$gte': new Date(year, month, date)}}
		}).exec(function(err, plans) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(plans);
		}
	});
};

/**
 * List of Chapters read today in this Plan
 */
exports.readToday = function(req, res) { 
	
	var d = new Date(Date.now());
	var year = d.getFullYear(); 
	var month = d.getMonth(); // for reference, month is 0-11
	var date = d.getDate(); // date is the day of month 1-31
	
	var chapters = Chapter.find({plan: req.plan._id, created: {'$gte': new Date(year, month, date)}}).sort('-created').exec(function(err, chapters) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapters);
		}
	});
};

/**
 * Plan middleware
 */
exports.planByID = function(req, res, next, id) { 
	Plan.findById(id).populate('user', 'displayName').exec(function(err, plan) {
		if (err) return next(err);
		if (! plan) return next(new Error('Failed to load Plan ' + id));
		req.plan = plan ;
		next();
	});
};

/**
 * Plan authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.plan.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
