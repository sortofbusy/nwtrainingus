'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Plan = mongoose.model('Plan'),
	Chapter = mongoose.model('Chapter'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, plan;

/**
 * Plan routes tests
 */
describe('Plan CRUD tests', function() {
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

		// Save a user to the test db and create new Plan
		user.save(function(err, newUser) {
			plan = {
				name: 'Plan Name',
				startChapter: 'Matthew 1',
				endChapter: 'Matthew 9',
				cursor: 'Matthew 1',
				pace: 1,
				user: newUser.id
			};

			done();
		});
	});

	it('should be able to save Plan instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						// Get a list of Plans
						agent.get('/plans')
							.end(function(plansGetErr, plansGetRes) {
								// Handle Plan save error
								if (plansGetErr) done(plansGetErr);

								// Get Plans list
								var plans = plansGetRes.body;
								// Set assertions
								(plans[0].user).should.equal(userId);
								(plans[0].name).should.match('Plan Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Plan instance if not logged in', function(done) {
		agent.post('/plans')
			.send(plan)
			.expect(401)
			.end(function(planSaveErr, planSaveRes) {
				// Call the assertion callback
				done(planSaveErr);
			});
	});

	it('should not be able to save Plan instance if no name is provided', function(done) {
		// Invalidate name field
		plan.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(400)
					.end(function(planSaveErr, planSaveRes) {
						// Set message assertion
						(planSaveRes.body.message).should.match('Please fill Plan name');
						
						// Handle Plan save error
						done(planSaveErr);
					});
			});
	});

	it('should not be able to save Plan instance if invalid chapters entered', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;
				plan.cursor = 1; // this value is before plan.startChapter
				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(400)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						done(planSaveErr);
					});
			});
	});

	it('should be able to update Plan instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						// Update Plan name
						plan.name = 'WHY YOU GOTTA BE SO MEAN?';
						plan.endChapter = 'Matthew 21';
						// Update existing Plan
						agent.put('/plans/' + planSaveRes.body._id)
							.send(plan)
							.expect(200)
							.end(function(planUpdateErr, planUpdateRes) {
								// Handle Plan update error
								if (planUpdateErr) done(planUpdateErr);

								// Set assertions
								(planUpdateRes.body._id).should.equal(planSaveRes.body._id);
								(planUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');
								(planUpdateRes.body.endChapter).should.equal(950);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to update Plan instance if invalid chapters entered', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						// Update Plan name
						plan.name = 'WHY YOU GOTTA BE SO MEAN?';
						plan.endChapter = 'Genesis 1';
						// Update existing Plan
						agent.put('/plans/' + planSaveRes.body._id)
							.send(plan)
							.expect(400)
							.end(function(planUpdateErr, planUpdateRes) {
								// Handle Plan update error
								done(planUpdateErr);
							});
					});
			});
	});

	it('should not be able to get a list of Plans if not signed in', function(done) {
		// Create new Plan model instance
		var planObj = new Plan(plan);

		// Save the Plan
		planObj.save(function() {
			// Request Plans
			agent.get('/plans')
				.expect(401)
				.end(function(err, res) {
					done(err);
				});

		});
	});

	it('should be able to get a single Plan if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						agent.get('/plans/' + planSaveRes.body._id)
							.expect(200)
							.end(function(planGetErr, planGetRes) {
								// Handle Plan Get error
								if (planGetErr) done(planGetErr);

								// Set assertions
								(planGetRes.body._id).should.equal(planSaveRes.body._id);
								(planGetRes.body.name).should.match('Plan Name');
								(planGetRes.body.endChapter).should.equal(938);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to get a single Plan if not signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						agent.get('/auth/signout')
							.expect(200)
							.end(function() {
								agent.get('/plans/' + planSaveRes.body._id)
									.expect(401)
									.end(function(err, res) {
										done(err);
									});
							});
					});
			});
	});

	it('should be able to delete Plan instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						// Delete existing Plan
						agent.delete('/plans/' + planSaveRes.body._id)
							.send(plan)
							.expect(200)
							.end(function(planDeleteErr, planDeleteRes) {
								// Handle Plan error error
								if (planDeleteErr) done(planDeleteErr);

								// Set assertions
								(planDeleteRes.body._id).should.equal(planSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});

	});

	it('should not be able to delete Plan instance if not signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						agent.get('/auth/signout')
							.expect(200)
							.end(function() {
						
								// Delete existing Plan
								agent.delete('/plans/' + planSaveRes.body._id)
									.send(plan)
									.expect(401)
									.end(function(planDeleteErr, planDeleteRes) {
										// Handle Plan error error
										done(planDeleteErr);
									});
							});
					});
			});
	});

	it.only('should be able to add a chapter to a plan', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Plan
				agent.post('/plans')
					.send(plan)
					.expect(200)
					.end(function(planSaveErr, planSaveRes) {
						// Handle Plan save error
						if (planSaveErr) done(planSaveErr);

						// Post a chapter
						agent.post('/plans/' + planSaveRes.body._id + '/advance')
							.expect(200)
							.end(function(plansGetErr, plansGetRes) {
								// Handle Plan save error
								if (plansGetErr) {
									done(plansGetErr);
									return;
								}

								agent.get('/plans')//' + planSaveRes.body._id + '/today')
									.expect(200)
									.end(function(todayErr, todayRes) {
										if (todayErr) {
											done(todayErr);
											return;
										}
										var today = todayRes.body;
										
										// Set assertions
										console.log(today);
										today.should.be.an.Array.with.lengthOf(1);

										// Call the assertion callback
										done();
									});
							});
					});
			});
	});

	afterEach(function(done) {
		User.remove().exec();
		Plan.remove().exec();
		Chapter.remove().exec();
		done();
	});
});