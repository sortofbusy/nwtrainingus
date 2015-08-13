'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Badge Schema
 */
var BadgeSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	completed: {
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
	}
});

mongoose.model('Badge', BadgeSchema);