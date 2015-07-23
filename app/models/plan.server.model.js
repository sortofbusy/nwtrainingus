'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Plan Schema
 */
var PlanSchema = new Schema({
	name: {
		type: String,
		default: '',
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
	startChapterNumber: Number,
	startChapterName: String,
	endChapterNumber: Number,
	endChapterName: String,
	pace: Number
});

mongoose.model('Plan', PlanSchema);

/**
 * Plan Template Schema
 */
var PlanTemplateSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Plan Template name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	startChapterNumber: Number,
	startChapterName: String,
	endChapterNumber: Number,
	endChapterName: String,
	planTemplates: [{ 
		type: Schema.ObjectId,
		ref: 'PlanTemplate'
	}]
});

mongoose.model('Plan', PlanSchema);