'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	hat = require('hat'),
	rack = hat.rack();

/**
 * Group Schema
 */
var GroupSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Group name',
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
	users: [{
		type: Schema.ObjectId,
		ref: 'User',
		unique: true
	}],
	creator: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	accessToken: {
		type: String,
		default: rack()
	},
	open: {
		type: Boolean,
		default: false
	},
	recentChapters: [{
		type: Schema.Types.Mixed
	}],
	recentMessages: [{
		type: Schema.Types.Mixed
	}]
});

mongoose.model('Group', GroupSchema);