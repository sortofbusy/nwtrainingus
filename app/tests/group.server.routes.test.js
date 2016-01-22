'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Group = mongoose.model('Group'),
	Message = mongoose.model('Message'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, credentials2, user, user2, group, chapter, message;

/**
 * Group routes tests
 */
describe('Group CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
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

		// Save a user to the test db and create new Group
		user.save(function() {
			group = {
				name: 'Group Name',
				creator: user.id,
				users: [ user.id ]
			};

			chapter = {
				name: 'Genesis 5',
				user: user.id
			};

			done();
		});
	});

	it('should be able to save Group instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle Group save error
						if (groupSaveErr) done(groupSaveErr);

						// Get a list of Groups
						agent.get('/groups')
							.end(function(groupsGetErr, groupsGetRes) {
								// Handle Group save error
								if (groupsGetErr) done(groupsGetErr);

								// Get Groups list
								var groups = groupsGetRes.body;

								// Set assertions
								(groups[0].creator).should.equal(userId);
								(groups[0].name).should.match('Group Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Group instance if not logged in', function(done) {
		agent.post('/groups')
			.send(group)
			.expect(401)
			.end(function(groupSaveErr, groupSaveRes) {
				// Call the assertion callback
				done(groupSaveErr);
			});
	});

	it('should not be able to save Group instance if no name is provided', function(done) {
		// Invalidate name field
		group.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Group
				agent.post('/groups')
					.send(group)
					.expect(400)
					.end(function(groupSaveErr, groupSaveRes) {
						// Set message assertion
						(groupSaveRes.body.message).should.match('Please fill Group name');
						
						// Handle Group save error
						done(groupSaveErr);
					});
			});
	});

	it('should be able to update Group instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle Group save error
						if (groupSaveErr) done(groupSaveErr);

						// Update Group name
						groupSaveRes.body.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Group
						agent.put('/groups/' + groupSaveRes.body._id)
							.send(groupSaveRes.body)
							.expect(200)
							.end(function(groupUpdateErr, groupUpdateRes) {
								// Handle Group update error
								if (groupUpdateErr) done(groupUpdateErr);

								// Set assertions
								(groupUpdateRes.body._id).should.equal(groupSaveRes.body._id);
								(groupUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Groups if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Create new Group model instance
				var groupObj = new Group(group);

				// Save the Group
				groupObj.save(function() {
					// Request Groups
					agent.get('/groups')
						.end(function(req, res) {
							// Set assertion
							res.body.should.be.an.Array.with.lengthOf(1);
							
							// Call the assertion callback
							done();
						});

				});
			});
	});


	it('should be able to get a single Group if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Create new Group model instance
				var groupObj = new Group(group);

				// Save the Group
				groupObj.save(function() {
					agent.get('/groups/' + groupObj._id)
						.expect(200)
						.end(function(err, res) {

							if (err) done(err);
							// Set assertion
							res.body.should.be.an.Object.with.property('name', group.name);
							// Call the assertion callback
							done();
						});
				});
		});
	});

	it('should be able to delete Group instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle Group save error
						if (groupSaveErr) done(groupSaveErr);

						// Delete existing Group
						agent.delete('/groups/' + groupSaveRes.body._id)
							.send(group)
							.expect(200)
							.end(function(groupDeleteErr, groupDeleteRes) {
								// Handle Group error error
								if (groupDeleteErr) done(groupDeleteErr);

								// Set assertions
								(groupDeleteRes.body._id).should.equal(groupSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Group instance if not signed in', function(done) {
		// Set Group user 
		group.user = user;

		// Create new Group model instance
		var groupObj = new Group(group);

		// Save the Group
		groupObj.save(function() {
			// Try deleting Group
			request(app).delete('/groups/' + groupObj._id)
			.expect(401)
			.end(function(groupDeleteErr, groupDeleteRes) {
				// Set message assertion
				(groupDeleteRes.body.message).should.match('User is not logged in');

				// Handle Group error error
				done(groupDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Group.remove().exec();
		Message.remove().exec();
		done();
	});
});

describe('Group detail tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
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

		// Create user credentials
		credentials2 = {
			username: 'username2',
			password: 'password2'
		};

		// Create a new user
		user2 = new User({
			firstName: 'Full2',
			lastName: 'Name2',
			displayName: 'Full2 Name2',
			email: 'test2222@test.com',
			username: credentials2.username,
			password: credentials2.password,
			provider: 'local'
		});

		// Save a user to the test db
		user.save(function() {
			user2.save(function() {
				// login
				agent.post('/auth/signin')
				.send(credentials)
				.expect(200)
				.end(function(signinErr, signinRes) {
					// Handle signin error
					if (signinErr) done(signinErr);	
					//create group
					
					agent.post('/groups')
					.send(new Group({
						name: 'Group Name'}))
					.expect(200)
					.end(function(groupErr, groupRes) {
						
						group = groupRes.body;
						
						agent.post('/messages')
							.send(new Message({
								text: 'I enjoyed this.', 
								group: group._id
							}))
							.expect(200)
							.end(function(messageErr, messageRes) {
								done();
							});
					});
				});
			});
		});
	});

	it('should be able to get a single Group', function(done) {
		agent.get('/groups/' + group._id)
			.end(function(err, res) {
				if (err) done(err);	
					
				// Set assertion
				(res.body.creator).should.equal(user.id);
				(res.body.name).should.match('Group Name');

				// Call the assertion callback
				done();
			});
	});

	it('should be able to get the messages from a single Group', function(done) {
		agent.get('/groups/' + group._id + '/messages')
			.end(function(err, res) {
				if (err) done(err);
				// Set assertion
				res.body.should.be.an.Array.with.lengthOf(1);
				res.body[0].text.should.match('I enjoyed this.');

				// Call the assertion callback
				done();
			});
	});

	it('should be able to get the comments from a single Group', function(done) {
		agent.get('/groups/' + group._id + '/comments')
			.end(function(err, res) {
				if (err) done(err);
				// Set assertion
				res.body.should.be.an.Array.with.lengthOf(1);
				//res.body[0].text.should.match('I enjoyed this.');

				// Call the assertion callback
				done();
			});
	});

	it('should not be able to get the messages from a single Group if the wrong user is signed in', function(done) {
		Message.find().exec(function(err, messages) {
			//console.log(messages);
		});

		agent.get('/auth/signout')
			.end(function() {
				agent.post('/auth/signin')
					.send(credentials2)
					.expect(200)
					.end(function(signinErr, signinRes) {
						// Handle signin error
						if (signinErr) done(signinErr);	
						
						agent.get('/groups/' + group._id + '/messages')
							.expect(403)
							.end(function(msgErr, msgRes) {
								// Set message assertion
								(msgRes.error.text).should.match('User is not authorized');

								// Handle error
								done(msgErr);
							});
					});
			});
	});

	it('should be able to add a user to a Group', function(done) {
		agent.get('/auth/signout')
			.end(function() {
				agent.post('/auth/signin')
					.send(credentials2)
					.expect(200)
					.end(function(signinErr, signinRes) {
						// Handle signin error
						if (signinErr) done(signinErr);	
						agent.post('/groups/enroll')
							.send({ token: group.accessToken })
							.expect(200)
							.end(function(err, res) {
								if (err) done(err);
								
								agent.get('/groups/' + group._id)
								.end(function(groupErr, groupRes) {

									if (groupErr) done(groupErr);	
									
									(groupRes.body.users).should.be.an.Array.with.lengthOf(2);
									// Call the assertion callback
									done();
								});
							});
					});
			});
	});

	it('should not be able to add a user to a Group with a wrong token', function(done) {
		agent.post('/groups/enroll')
			.send({ token: 'asvn24n2m1134452m3453' })
			.expect(400)
			.end(function(err, res) {
				done(err);

			});
	});

	it('should not be able to add a user to a Group twice', function(done) {
		agent.post('/groups/enroll')
			.send({ token: group.accessToken })
			.expect(400)
			.end(function(err, res) {
				done(err);
			});
	});

	it('should be able to unenroll a user from a Group', function(done) {
		agent.get('/auth/signout')
			.end(function() {
				agent.post('/auth/signin')
					.send(credentials2)
					.expect(200)
					.end(function(signinErr, signinRes) {
						// Handle signin error
						if (signinErr) done(signinErr);	
						
						agent.post('/groups/enroll')
							.send({ token: group.accessToken })
							.expect(200)
							.end(function(enrollErr, enrollRes) {
								if (enrollErr) done(enrollErr);
								
								agent.post('/groups/' + group._id + '/unenroll')
									.send()
									.expect(200)
									.end(function(err, res) {
										if (err) done(err);
										else {
											agent.get('/groups/' + group._id)
											.expect(403)
											.end(function(groupErr, groupRes) {
												done(groupErr);	
											});
										}
									});
							});
					});
			});
	});

	it('should not be able to unenroll the creator from a Group', function(done) {
		agent.post('/groups/' + group._id + '/unenroll')
			.send()
			.expect(400)
			.end(function(err, res) {
				done(err);
			});
	});

	afterEach(function(done) {
		User.remove().exec();
		Group.remove().exec();
		Message.remove().exec();
		done();
	});
});