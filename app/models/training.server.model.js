'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Training Schema
 */
var TrainingSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Training name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},
	begin: {
		type: Date
	},
	end: {
		type: Date
	}
});

mongoose.model('Training', TrainingSchema);