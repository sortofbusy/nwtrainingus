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
		required: 'Please fill Badge name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Badge', BadgeSchema);