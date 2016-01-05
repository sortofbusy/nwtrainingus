'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Plan Schema
 */

 // plans.server UPDATES PLAN FIELDS MANUALLY! Schema changes need to be reflected there
		
var PlanSchema = new Schema({
	name: {
		type: String,
		required: 'Please fill Plan name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	startChapter: {
		type: Number,
		min: 1,
		max: 1189
	},
	endChapter: {
		type: Number,
		min: 1,
		max: 1189
	},
	cursor: {
		type: Number,
		min: 1,
		max: 1189
	},
	pace: {
		type: Number,
		min: 1
	},
	chapters: [{
		type: Schema.ObjectId,
		ref: 'Chapter'
	}],
	active: {
		type: Boolean,
		default: true
	},
	parent: {
		type: Schema.ObjectId,
		ref: 'Plan'
	},
	isParent: {
		type: Boolean,
		default: false
	}
});

mongoose.model('Plan', PlanSchema);