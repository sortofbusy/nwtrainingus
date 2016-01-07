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
	group: { // group will be empty if this message is a personal note
		type: Schema.ObjectId,
		ref: 'Group'
	},
	verse: Schema.Types.Mixed // verse will be empty if this message is a group comment
});

mongoose.model('Message', MessageSchema);