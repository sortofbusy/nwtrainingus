'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, message;

/**
 * Message routes tests
 */
describe('User route tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'josiahvinson@gmail.com',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'josiahvinson@gmail.com',
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

	it('should be able to get messages for a user if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;
				message.user = userId;
				// Save a new Message
				agent.post('/messages')
					.send(message)
					.expect(200)
					.end(function(messageSaveErr, messageSaveRes) {
						// Handle Message save error
						if (messageSaveErr) done(messageSaveErr);

						// Get a list of Messages
						agent.get('/users/messages')
							.expect(200)
							.end(function(messagesGetErr, messagesGetRes) {
								// Handle Message save error
								if (messagesGetErr) done(messagesGetErr);
								console.log(messagesGetRes.body);
								// Get Messages list
								var messages = messagesGetRes.body;
								// Set assertions
								(messages[0].user).should.equal(userId);
								(messages[0].text).should.match('Message Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to get messages for a user if not logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;
				message.user = userId;
				// Save a new Message
				agent.post('/messages')
					.send(message)
					.expect(200)
					.end(function(messageSaveErr, messageSaveRes) {
						// Handle Message save error
						if (messageSaveErr) done(messageSaveErr);


						agent.get('/auth/signout')
							.expect(200)
							.end(function() {
								// Get a list of Messages
								agent.get('/users/messages')
									.expect(400)
									.end(function(messagesGetErr, messagesGetRes) {
										// Handle Message save error
										done(messagesGetErr);
									});
							});
					});
			});
	});

	it.only('should be able to send a password reset email', function(done) {
		agent.post('/auth/forgot')
			.send({username: 'josiahvinson@gmail.com'})
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				done(signinRes);
			});
	});

	afterEach(function(done) {
		User.remove().exec();
		Message.remove().exec();
		done();
	});
});