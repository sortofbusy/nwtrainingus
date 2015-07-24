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
	}
});

mongoose.model('Plan', PlanSchema);