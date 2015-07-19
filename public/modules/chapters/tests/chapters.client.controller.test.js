'use strict';

(function() {
	// Chapters Controller Spec
	describe('Chapters Controller Tests', function() {
		// Initialize global variables
		var ChaptersController,
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

			// Initialize the Chapters controller.
			ChaptersController = $controller('ChaptersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Chapter object fetched from XHR', inject(function(Chapters) {
			// Create sample Chapter using the Chapters service
			var sampleChapter = new Chapters({
				name: 'New Chapter'
			});

			// Create a sample Chapters array that includes the new Chapter
			var sampleChapters = [sampleChapter];

			// Set GET response
			$httpBackend.expectGET('chapters').respond(sampleChapters);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.chapters).toEqualData(sampleChapters);
		}));

		it('$scope.findOne() should create an array with one Chapter object fetched from XHR using a chapterId URL parameter', inject(function(Chapters) {
			// Define a sample Chapter object
			var sampleChapter = new Chapters({
				name: 'New Chapter'
			});

			// Set the URL parameter
			$stateParams.chapterId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/chapters\/([0-9a-fA-F]{24})$/).respond(sampleChapter);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.chapter).toEqualData(sampleChapter);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Chapters) {
			// Create a sample Chapter object
			var sampleChapterPostData = new Chapters({
				name: 'New Chapter'
			});

			// Create a sample Chapter response
			var sampleChapterResponse = new Chapters({
				_id: '525cf20451979dea2c000001',
				name: 'New Chapter'
			});

			// Fixture mock form input values
			scope.name = 'New Chapter';

			// Set POST response
			$httpBackend.expectPOST('chapters', sampleChapterPostData).respond(sampleChapterResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Chapter was created
			expect($location.path()).toBe('/chapters/' + sampleChapterResponse._id);
		}));

		it('$scope.update() should update a valid Chapter', inject(function(Chapters) {
			// Define a sample Chapter put data
			var sampleChapterPutData = new Chapters({
				_id: '525cf20451979dea2c000001',
				name: 'New Chapter'
			});

			// Mock Chapter in scope
			scope.chapter = sampleChapterPutData;

			// Set PUT response
			$httpBackend.expectPUT(/chapters\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/chapters/' + sampleChapterPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid chapterId and remove the Chapter from the scope', inject(function(Chapters) {
			// Create new Chapter object
			var sampleChapter = new Chapters({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Chapters array and include the Chapter
			scope.chapters = [sampleChapter];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/chapters\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleChapter);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.chapters.length).toBe(0);
		}));
	});
}());