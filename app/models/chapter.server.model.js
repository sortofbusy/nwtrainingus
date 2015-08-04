'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Chapter Schema
 */
var ChapterSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Chapter name',
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
	book: Number,
	chapter: Number,
	verse: Number,
	plan: {
		type: Schema.ObjectId,
		ref: 'Plan'
	},
	absoluteChapter: Number
});

mongoose.model('Chapter', ChapterSchema);