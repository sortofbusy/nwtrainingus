'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Badge = mongoose.model('Badge'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, badge;

/**
 * Badge routes tests
 */
describe('Badge CRUD tests', function() {
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

		// Save a user to the test db and create new Badge
		user.save(function() {
			badge = {
				name: 'Badge Name'
			};

			done();
		});
	});

	it('should be able to save Badge instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Badge
				agent.post('/badges')
					.send(badge)
					.expect(200)
					.end(function(badgeSaveErr, badgeSaveRes) {
						// Handle Badge save error
						if (badgeSaveErr) done(badgeSaveErr);

						// Get a list of Badges
						agent.get('/badges')
							.end(function(badgesGetErr, badgesGetRes) {
								// Handle Badge save error
								if (badgesGetErr) done(badgesGetErr);

								// Get Badges list
								var badges = badgesGetRes.body;

								// Set assertions
								(badges[0].user._id).should.equal(userId);
								(badges[0].name).should.match('Badge Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Badge instance if not logged in', function(done) {
		agent.post('/badges')
			.send(badge)
			.expect(401)
			.end(function(badgeSaveErr, badgeSaveRes) {
				// Call the assertion callback
				done(badgeSaveErr);
			});
	});

	it('should not be able to save Badge instance if no name is provided', function(done) {
		// Invalidate name field
		badge.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Badge
				agent.post('/badges')
					.send(badge)
					.expect(400)
					.end(function(badgeSaveErr, badgeSaveRes) {
						// Set message assertion
						(badgeSaveRes.body.message).should.match('Please fill Badge name');
						
						// Handle Badge save error
						done(badgeSaveErr);
					});
			});
	});

	it('should be able to update Badge instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Badge
				agent.post('/badges')
					.send(badge)
					.expect(200)
					.end(function(badgeSaveErr, badgeSaveRes) {
						// Handle Badge save error
						if (badgeSaveErr) done(badgeSaveErr);

						// Update Badge name
						badge.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Badge
						agent.put('/badges/' + badgeSaveRes.body._id)
							.send(badge)
							.expect(200)
							.end(function(badgeUpdateErr, badgeUpdateRes) {
								// Handle Badge update error
								if (badgeUpdateErr) done(badgeUpdateErr);

								// Set assertions
								(badgeUpdateRes.body._id).should.equal(badgeSaveRes.body._id);
								(badgeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Badges if not signed in', function(done) {
		// Create new Badge model instance
		var badgeObj = new Badge(badge);

		// Save the Badge
		badgeObj.save(function() {
			// Request Badges
			request(app).get('/badges')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Badge if not signed in', function(done) {
		// Create new Badge model instance
		var badgeObj = new Badge(badge);

		// Save the Badge
		badgeObj.save(function() {
			request(app).get('/badges/' + badgeObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', badge.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Badge instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Badge
				agent.post('/badges')
					.send(badge)
					.expect(200)
					.end(function(badgeSaveErr, badgeSaveRes) {
						// Handle Badge save error
						if (badgeSaveErr) done(badgeSaveErr);

						// Delete existing Badge
						agent.delete('/badges/' + badgeSaveRes.body._id)
							.send(badge)
							.expect(200)
							.end(function(badgeDeleteErr, badgeDeleteRes) {
								// Handle Badge error error
								if (badgeDeleteErr) done(badgeDeleteErr);

								// Set assertions
								(badgeDeleteRes.body._id).should.equal(badgeSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Badge instance if not signed in', function(done) {
		// Set Badge user 
		badge.user = user;

		// Create new Badge model instance
		var badgeObj = new Badge(badge);

		// Save the Badge
		badgeObj.save(function() {
			// Try deleting Badge
			request(app).delete('/badges/' + badgeObj._id)
			.expect(401)
			.end(function(badgeDeleteErr, badgeDeleteRes) {
				// Set message assertion
				(badgeDeleteRes.body.message).should.match('User is not logged in');

				// Handle Badge error error
				done(badgeDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Badge.remove().exec();
		done();
	});
});