'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Reference = require('biblejs').Reference,
	errorHandler = require('./errors.server.controller'),
	Plan = mongoose.model('Plan'),
	Chapter = mongoose.model('Chapter'),
	_ = require('lodash');

/**
 * Create a Plan
 */
exports.create = function(req, res) {
	try {
		var plan = new Plan(req.body);
		plan.user = req.user;	

		// Handle both numerical and string types of chapter input
		if (typeof req.body.startChapter === 'string' || req.body.startChapter instanceof String) 
			plan.startChapter = new Reference(req.body.startChapter).toChapterId();
		if (typeof req.body.endChapter === 'string' || req.body.endChapter instanceof String) 
			plan.endChapter = new Reference(req.body.endChapter).toChapterId();
		if (typeof req.body.cursor === 'string' || req.body.cursor instanceof String) 
			plan.cursor = new Reference(req.body.cursor).toChapterId();
		
		//ensure plan parameters are valid
		if(plan.cursor < plan.startChapter || plan.cursor > plan.endChapter || plan.startChapter > plan.endChapter) {
			throw new Error('Invalid plan parameters');
		}

		var newPlan = new Plan(plan);
		
		newPlan.save(function(err, planRes) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(newPlan);
			}
		});
	} catch (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	}
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
	try {
		var plan = req.plan;
		plan = _.extend(plan , req.body);

		// Handle both numerical and string types of chapter input
		var startChapter, endChapter, cursor;
		startChapter = req.body.startChapter;
		endChapter = req.body.endChapter;
		cursor = req.body.cursor;
		
		if (typeof startChapter === 'string' || startChapter instanceof String) 
			startChapter = new Reference(startChapter).toChapterId();
		if (typeof endChapter === 'string' || endChapter instanceof String) 
			endChapter = new Reference(endChapter).toChapterId();
		if (typeof cursor === 'string' || cursor instanceof String) 
			cursor = new Reference(cursor).toChapterId();

		//ensure plan parameters are valid
		if(cursor < startChapter || cursor > endChapter || startChapter > endChapter) {
			throw new Error('Invalid plan parameters');
		}

		Plan.findByIdAndUpdate(plan._id, {pace: plan.pace, startChapter: startChapter, endChapter: endChapter,
			cursor: cursor, active: plan.active, name: plan.name}, function(err, newPlan) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(newPlan);
			}
		});
	} catch (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	}
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
	var params = {user: req.user.id}; // return only the plans of the signed in user
	
	Plan.find(params).sort('-created').populate({
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
	if (!req.user || (req.plan.user.id !== req.user.id)) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
