'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
	locality: {
		name: {
			type: String
		},
		area: {
			type: String
		}
	},
	language: {
		type: String
	},
	meeting: {
		place: {
			type: String
		},
		day: {
			type: String
		},
		time: {
			type: String
		}
	},
	created: {
		type: Date,
		default: Date.now
	},
	users: [{
		type: Schema.ObjectId,
		ref: 'User'
	}]
});

mongoose.model('Group', GroupSchema);