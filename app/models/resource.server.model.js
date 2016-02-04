'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Resource Schema
 */
var ResourceSchema = new Schema({
	fileType: {
		type: String
	},
	url: {
		type: String,
		required: 'Please provide a link'
	},
	language: {
		type: String,
		default: 'English'
	},
	session: {
		type: Number
	},
	subsession: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	training: {
		type: Schema.ObjectId,
		ref: 'Training'
	}
});

mongoose.model('Resource', ResourceSchema);