'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Chapter = mongoose.model('Chapter');

/**
 * Globals
 */
var user, chapter;

/**
 * Unit tests
 */
describe('Chapter Model Unit Tests:', function() {

	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			chapter = new Chapter({
				name: 'Genesis 5',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return chapter.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			chapter.name = '';

			return chapter.save(function(err) {
				should.exist(err);
				done();
			});
		});

	});

	afterEach(function(done) { 
		Chapter.remove().exec();
		User.remove().exec();

		done();
	});
	
});