'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
	applicant: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Please provide applicant'
	},
	modifiedBy: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},
	training: {
		type: Schema.ObjectId,
		ref: 'Training'
	},
	signature: {
		type: String
	},
	appStatus: {
		type: String,
		enum: ['Pending', 'Approved', 'Denied'],
		default: 'Pending'
	}
});

mongoose.model('Application', ApplicationSchema);