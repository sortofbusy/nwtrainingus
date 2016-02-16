'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
	comment: {
		type: String,
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
	sessionDate: {
		type: Date
	},
	lesson: {
		type: Number,
		required: 'Please enter lesson number'
	},
	present: [{
		type: Schema.ObjectId,
		ref: 'User'
	}],
	absent: [{
		userId: {
			type: Schema.ObjectId,
			ref: 'User'
		},
		excused: {
			type: Boolean
		}
	}]
});

mongoose.model('Report', ReportSchema);