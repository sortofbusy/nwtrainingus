'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Chapter = mongoose.model('Chapter'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, chapter;

/**
 * Chapter routes tests
 */
describe('Chapter CRUD tests', function() {
	
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

		// Save a user to the test db and create new Chapter
		user.save(function() {
			chapter = {
				name: 'Genesis 5'
			};

			done();
		});
	});

	it('should be able to save Chapter instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Chapter
				agent.post('/chapters')
					.send(chapter)
					.expect(200)
					.end(function(chapterSaveErr, chapterSaveRes) {
						// Handle Chapter save error
						if (chapterSaveErr) done(chapterSaveErr);

						// Get a list of Chapters
						agent.get('/chapters')
							.end(function(chaptersGetErr, chaptersGetRes) {
								// Handle Chapter save error
								if (chaptersGetErr) done(chaptersGetErr);

								// Get Chapters list
								var chapters = chaptersGetRes.body;

								// Set assertions
								(chapters[0].user._id).should.equal(userId);
								(chapters[0].name).should.match('Genesis 5');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Chapter instance if not logged in', function(done) {
		agent.post('/chapters')
			.send(chapter)
			.expect(401)
			.end(function(chapterSaveErr, chapterSaveRes) {
				// Call the assertion callback
				done(chapterSaveErr);
			});
	});

	it('should not be able to save Chapter instance if no name is provided', function(done) {
		// Invalidate name field
		chapter.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Chapter
				agent.post('/chapters')
					.send(chapter)
					.expect(400)
					.end(function(chapterSaveErr, chapterSaveRes) {
						// Set message assertion
						(chapterSaveRes.body.message).should.match('');
						
						// Handle Chapter save error
						done(chapterSaveErr);
					});
			});
	});

	it('should be able to update Chapter instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Chapter
				agent.post('/chapters')
					.send(chapter)
					.expect(200)
					.end(function(chapterSaveErr, chapterSaveRes) {
						// Handle Chapter save error
						if (chapterSaveErr) done(chapterSaveErr);

						// Update Chapter name
						chapter.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Chapter
						agent.put('/chapters/' + chapterSaveRes.body._id)
							.send(chapter)
							.expect(200)
							.end(function(chapterUpdateErr, chapterUpdateRes) {
								// Handle Chapter update error
								if (chapterUpdateErr) done(chapterUpdateErr);

								// Set assertions
								(chapterUpdateRes.body._id).should.equal(chapterSaveRes.body._id);
								(chapterUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Chapters if not signed in', function(done) {
		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			// Request Chapters
			request(app).get('/chapters')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Chapter if not signed in', function(done) {
		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			request(app).get('/chapters/' + chapterObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', chapter.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Chapter instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Chapter
				agent.post('/chapters')
					.send(chapter)
					.expect(200)
					.end(function(chapterSaveErr, chapterSaveRes) {
						// Handle Chapter save error
						if (chapterSaveErr) done(chapterSaveErr);

						// Delete existing Chapter
						agent.delete('/chapters/' + chapterSaveRes.body._id)
							.send(chapter)
							.expect(200)
							.end(function(chapterDeleteErr, chapterDeleteRes) {
								// Handle Chapter error error
								if (chapterDeleteErr) done(chapterDeleteErr);

								// Set assertions
								(chapterDeleteRes.body._id).should.equal(chapterSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Chapter instance if not signed in', function(done) {
		// Set Chapter user 
		chapter.user = user;

		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			// Try deleting Chapter
			request(app).delete('/chapters/' + chapterObj._id)
			.expect(401)
			.end(function(chapterDeleteErr, chapterDeleteRes) {
				// Set message assertion
				(chapterDeleteRes.body.message).should.match('User is not logged in');

				// Handle Chapter error error
				done(chapterDeleteErr);
			});

		});
	});

	it('should be able to return a chapter name from chapter number if not signed in', function(done) {
		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			// Request reference
			request(app).get('/reference?chapterNumber=5')
				.expect(200)
				.end(function(req, res) {
					
					// Set assertion
					res.body.should.match('Genesis 5');

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to return a chapter number from chapter name if not signed in', function(done) {
		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			// Request reference
			request(app).get('/reference?chapterName=Genesis%201&increment=1')
				.expect(200)
				.end(function(req, res) {

					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should not be able to return an array of reference strings for the chapter after a given one', function(done) {
		// Set Chapter user 
		chapter.user = user;

		// Create new Chapter model instance
		var chapterObj = new Chapter(chapter);

		// Save the Chapter
		chapterObj.save(function() {
			// Call next
			request(app).get('/chapters/' + chapterObj._id + '/next')
			.expect(200)
			.end(function(req, res) {
				// Set assertion
				res.body.should.be.an.Array.with.lengthOf(1);

				// Handle Chapter error error
				done();
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Chapter.remove().exec();
		done();
	});
	
});