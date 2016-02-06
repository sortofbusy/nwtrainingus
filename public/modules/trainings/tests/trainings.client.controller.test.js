'use strict';

(function() {
	// Trainings Controller Spec
	describe('Trainings Controller Tests', function() {
		// Initialize global variables
		var TrainingsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Trainings controller.
			TrainingsController = $controller('TrainingsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Training object fetched from XHR', inject(function(Trainings) {
			// Create sample Training using the Trainings service
			var sampleTraining = new Trainings({
				name: 'New Training'
			});

			// Create a sample Trainings array that includes the new Training
			var sampleTrainings = [sampleTraining];

			// Set GET response
			$httpBackend.expectGET('trainings').respond(sampleTrainings);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.trainings).toEqualData(sampleTrainings);
		}));

		it('$scope.findOne() should create an array with one Training object fetched from XHR using a trainingId URL parameter', inject(function(Trainings) {
			// Define a sample Training object
			var sampleTraining = new Trainings({
				name: 'New Training'
			});

			// Set the URL parameter
			$stateParams.trainingId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/trainings\/([0-9a-fA-F]{24})$/).respond(sampleTraining);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.training).toEqualData(sampleTraining);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Trainings) {
			// Create a sample Training object
			var sampleTrainingPostData = new Trainings({
				name: 'New Training'
			});

			// Create a sample Training response
			var sampleTrainingResponse = new Trainings({
				_id: '525cf20451979dea2c000001',
				name: 'New Training'
			});

			// Fixture mock form input values
			scope.name = 'New Training';

			// Set POST response
			$httpBackend.expectPOST('trainings', sampleTrainingPostData).respond(sampleTrainingResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Training was created
			expect($location.path()).toBe('/trainings/' + sampleTrainingResponse._id);
		}));

		it('$scope.update() should update a valid Training', inject(function(Trainings) {
			// Define a sample Training put data
			var sampleTrainingPutData = new Trainings({
				_id: '525cf20451979dea2c000001',
				name: 'New Training'
			});

			// Mock Training in scope
			scope.training = sampleTrainingPutData;

			// Set PUT response
			$httpBackend.expectPUT(/trainings\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/trainings/' + sampleTrainingPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid trainingId and remove the Training from the scope', inject(function(Trainings) {
			// Create new Training object
			var sampleTraining = new Trainings({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Trainings array and include the Training
			scope.trainings = [sampleTraining];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/trainings\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTraining);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.trainings.length).toBe(0);
		}));
	});
}());