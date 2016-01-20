'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Reference = require('biblejs').Reference,
	errorHandler = require('./errors.server.controller'),
	Plan = mongoose.model('Plan'),
	Chapter = mongoose.model('Chapter'),
	momentTZ = require('moment-timezone'),
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
		// UPDATING PLAN FIELDS MANUALLY! Schema changes need to be reflected here
		Plan.findByIdAndUpdate(plan._id, {pace: plan.pace, startChapter: startChapter, endChapter: endChapter,
			cursor: cursor, active: plan.active, name: plan.name, chapters: plan.chapters, 
			parent: plan.parent, isParent: plan.isParent}, function(err, newPlan) {
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
	var timezone = 'America/Los_Angeles';
	if (req.user.timezone) timezone = req.user.timezone;
	
	var params = {user: req.user.id}; // return only the plans of the signed in user
	/////////////////
	///////// TODO - change -created to a custom sort field
	/////////////////
	Plan.find(params).sort('-created').populate({
			path: 'chapters',
			match:  {created: {'$gte': momentTZ.tz(timezone).startOf('day')}}
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
	var timezone = 'America/Los_Angeles';
	if (req.user.timezone) timezone = req.user.timezone;
	
	var chapters = Chapter.find({plan: req.plan._id, created: {'$gte': momentTZ.tz(timezone).startOf('day')}}).sort('-created').exec(function(err, chapters) {
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
 * Creates the next Chapter in this Plan
 */
exports.advance = function(req, res) { 
	try {
		

		// create a new chapter from the current position of the plan
		var chapter = new Chapter({
			name: Reference.fromChapterId(req.plan.cursor).toString(),
			user: req.user._id,
			plan: req.plan._id,
		});
		
		// save this new chapter
		chapter.save(function(err, chapterRes) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				// increment the plan's cursor
				var timezone = 'America/Los_Angeles';
				if (req.user.timezone) timezone = req.user.timezone;
				
				Plan.findByIdAndUpdate(req.plan._id, { $inc: {cursor: 1}, $push: {chapters: chapter._id}}, { 'new': true})
					.populate({
						path: 'chapters',
						match:  {created: {'$gte': momentTZ.tz(timezone).startOf('day')}}
					}).exec(function(planErr, plan) {
					if (planErr) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(planErr)
						});
					} else {
						res.jsonp(plan);
					}
				});
			}
		});
	} catch (e) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(e)
		});
	}
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
