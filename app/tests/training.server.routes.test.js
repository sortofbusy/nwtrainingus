'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Training = mongoose.model('Training'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, training;

/**
 * Training routes tests
 */
describe('Training CRUD tests', function() {
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

		// Save a user to the test db and create new Training
		user.save(function() {
			training = {
				name: 'Training Name'
			};

			done();
		});
	});

	it('should be able to save Training instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Training
				agent.post('/trainings')
					.send(training)
					.expect(200)
					.end(function(trainingSaveErr, trainingSaveRes) {
						// Handle Training save error
						if (trainingSaveErr) done(trainingSaveErr);

						// Get a list of Trainings
						agent.get('/trainings')
							.end(function(trainingsGetErr, trainingsGetRes) {
								// Handle Training save error
								if (trainingsGetErr) done(trainingsGetErr);

								// Get Trainings list
								var trainings = trainingsGetRes.body;

								// Set assertions
								(trainings[0].user._id).should.equal(userId);
								(trainings[0].name).should.match('Training Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Training instance if not logged in', function(done) {
		agent.post('/trainings')
			.send(training)
			.expect(401)
			.end(function(trainingSaveErr, trainingSaveRes) {
				// Call the assertion callback
				done(trainingSaveErr);
			});
	});

	it('should not be able to save Training instance if no name is provided', function(done) {
		// Invalidate name field
		training.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Training
				agent.post('/trainings')
					.send(training)
					.expect(400)
					.end(function(trainingSaveErr, trainingSaveRes) {
						// Set message assertion
						(trainingSaveRes.body.message).should.match('Please fill Training name');
						
						// Handle Training save error
						done(trainingSaveErr);
					});
			});
	});

	it('should be able to update Training instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Training
				agent.post('/trainings')
					.send(training)
					.expect(200)
					.end(function(trainingSaveErr, trainingSaveRes) {
						// Handle Training save error
						if (trainingSaveErr) done(trainingSaveErr);

						// Update Training name
						training.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Training
						agent.put('/trainings/' + trainingSaveRes.body._id)
							.send(training)
							.expect(200)
							.end(function(trainingUpdateErr, trainingUpdateRes) {
								// Handle Training update error
								if (trainingUpdateErr) done(trainingUpdateErr);

								// Set assertions
								(trainingUpdateRes.body._id).should.equal(trainingSaveRes.body._id);
								(trainingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Trainings if not signed in', function(done) {
		// Create new Training model instance
		var trainingObj = new Training(training);

		// Save the Training
		trainingObj.save(function() {
			// Request Trainings
			request(app).get('/trainings')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Training if not signed in', function(done) {
		// Create new Training model instance
		var trainingObj = new Training(training);

		// Save the Training
		trainingObj.save(function() {
			request(app).get('/trainings/' + trainingObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', training.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Training instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Training
				agent.post('/trainings')
					.send(training)
					.expect(200)
					.end(function(trainingSaveErr, trainingSaveRes) {
						// Handle Training save error
						if (trainingSaveErr) done(trainingSaveErr);

						// Delete existing Training
						agent.delete('/trainings/' + trainingSaveRes.body._id)
							.send(training)
							.expect(200)
							.end(function(trainingDeleteErr, trainingDeleteRes) {
								// Handle Training error error
								if (trainingDeleteErr) done(trainingDeleteErr);

								// Set assertions
								(trainingDeleteRes.body._id).should.equal(trainingSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Training instance if not signed in', function(done) {
		// Set Training user 
		training.user = user;

		// Create new Training model instance
		var trainingObj = new Training(training);

		// Save the Training
		trainingObj.save(function() {
			// Try deleting Training
			request(app).delete('/trainings/' + trainingObj._id)
			.expect(401)
			.end(function(trainingDeleteErr, trainingDeleteRes) {
				// Set message assertion
				(trainingDeleteRes.body.message).should.match('User is not logged in');

				// Handle Training error error
				done(trainingDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Training.remove().exec();
		done();
	});
});