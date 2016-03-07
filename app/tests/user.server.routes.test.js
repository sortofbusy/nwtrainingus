'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message'),
	Training = mongoose.model('Training'),
	Application = mongoose.model('Application'),
	Group = mongoose.model('Group'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, message, group, training, application;

/**
 * Message routes tests
 */
describe('User route tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'test@test.com',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Message
		user.save(function() {
			message = {
				text: 'Message Name'
			};

			done();
		});
	});

	it('should be able to send a welcome email after signup', function(done) {
		agent.post('/auth/signup')
			.send({firstName: 'Josiah', lastName: 'Vinson', email: 'test@test.com', password: 'password'})
			.expect(200)
			.end(function(signinErr, signinRes) {
				done(signinErr);
			});
	});

	it('should be able to send a password reset email', function(done) {
		agent.post('/auth/forgot')
			.send({username: 'test@test.com'})
			.expect(200)
			.end(function(signinErr, signinRes) {
				done(signinErr);
			});
	});

	

	afterEach(function(done) {
		User.remove().exec();
		Message.remove().exec();
		Group.remove().exec();
		Training.remove().exec();
		Application.remove().exec();
		done();
	});
});

/**
 * Message routes tests
 */
describe('Admin route tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'test@test.com',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local',
			roles: ['user', 'admin'],
			consecrated: Date.now(),
			signature: 'test'
		});
		
		training = new Training({
			name: 'My Training'
		});
		
		// Save a user to the test db and create new Message
		user.save(function() {
			message = {
				text: 'Message Name',
				user: user._id
			};
			training.save(function() {
				done();
			});
			
		});

		
		

	});

	it('should be able to get admin view for a user if admin', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				agent.get('/admin')
					.expect(200)
					.end(function(messagesGetErr, messagesGetRes) {
						// Handle Message save error
						if (messagesGetErr) {
							done(messagesGetErr);
							return;
						}
						// Get Messages list
						var messages = messagesGetRes.body;
						// Set assertions
						//messages.should.be.an.Array;

						// Call the assertion callback
						done();
					});
			});
	});

	it('should not be able to get admin view if not admin', function(done) {
		agent.get('/admin')
			.expect(401)
			.end(function(messagesGetErr, messagesGetRes) {
				// Handle Message save error
				done(messagesGetErr);
			});
	});

	it('should be able to bulk create applications for users with signature', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				agent.post('/admin/createapplications')
					.send({trainingId: training.id})
					.expect(200)
					.end(function(err, result) {
						User.find({}).exec(function(err2, users) {
							// Set assertions
							
							(users[0].applications).should.be.an.Array.with.lengthOf(1);
							done();
						});
						
						
					});

			});
	});

	afterEach(function(done) {
		User.remove().exec();
		Message.remove().exec();
		Group.remove().exec();
		Training.remove().exec();
		Application.remove().exec();
		done();
	});
});