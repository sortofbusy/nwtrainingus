'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message'),
	Group = mongoose.model('Group');

/**
 * Globals
 */
var user, group, newGroup;

/**
 * Unit tests
 */
describe.only('Group Model Unit Tests:', function() {
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
			group = new Group({
				name: 'Group Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return group.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			group.name = '';

			return group.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to cascade delete associated Messages', function(done) {
			
			return group.save(function(err, nGroup) {
				newGroup = nGroup;
				var msgs = [
					{
						text: 'group comment',
						group: group._id
					}, 
					{
						text: 'group note',
						group: group._id,
						verse: '1 Corinthians 5:13'
					}
				];

				Message.create(msgs, function(msgErr, result, result2) {
				    if (msgErr) done(msgErr);
				    Group.findOneAndRemove({_id: group._id}, function(err3, delGroup) {
				    	delGroup.remove();
				    	Message.find({}, function(err4, allMessages) {
				    		console.log(allMessages);
				    		done();
				    	});
				    });
				    
				});

			});
		});
	});

	afterEach(function(done) { 
		Group.remove().exec();
		User.remove().exec();
		Message.remove().exec();
		done();
	});
});