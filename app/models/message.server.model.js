'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
	text: {
		type: String,
		default: '',
		required: 'Please enter text',
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
	group: {
		type: Schema.ObjectId,
		ref: 'Group'
	},
	verse: Schema.Types.Mixed
});

mongoose.model('Message', MessageSchema);