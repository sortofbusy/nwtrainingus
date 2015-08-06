'use strict';

(function() {
	// Badges Controller Spec
	describe('Badges Controller Tests', function() {
		// Initialize global variables
		var BadgesController,
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

			// Initialize the Badges controller.
			BadgesController = $controller('BadgesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Badge object fetched from XHR', inject(function(Badges) {
			// Create sample Badge using the Badges service
			var sampleBadge = new Badges({
				name: 'New Badge'
			});

			// Create a sample Badges array that includes the new Badge
			var sampleBadges = [sampleBadge];

			// Set GET response
			$httpBackend.expectGET('badges').respond(sampleBadges);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.badges).toEqualData(sampleBadges);
		}));

		it('$scope.findOne() should create an array with one Badge object fetched from XHR using a badgeId URL parameter', inject(function(Badges) {
			// Define a sample Badge object
			var sampleBadge = new Badges({
				name: 'New Badge'
			});

			// Set the URL parameter
			$stateParams.badgeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/badges\/([0-9a-fA-F]{24})$/).respond(sampleBadge);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.badge).toEqualData(sampleBadge);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Badges) {
			// Create a sample Badge object
			var sampleBadgePostData = new Badges({
				name: 'New Badge'
			});

			// Create a sample Badge response
			var sampleBadgeResponse = new Badges({
				_id: '525cf20451979dea2c000001',
				name: 'New Badge'
			});

			// Fixture mock form input values
			scope.name = 'New Badge';

			// Set POST response
			$httpBackend.expectPOST('badges', sampleBadgePostData).respond(sampleBadgeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Badge was created
			expect($location.path()).toBe('/badges/' + sampleBadgeResponse._id);
		}));

		it('$scope.update() should update a valid Badge', inject(function(Badges) {
			// Define a sample Badge put data
			var sampleBadgePutData = new Badges({
				_id: '525cf20451979dea2c000001',
				name: 'New Badge'
			});

			// Mock Badge in scope
			scope.badge = sampleBadgePutData;

			// Set PUT response
			$httpBackend.expectPUT(/badges\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/badges/' + sampleBadgePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid badgeId and remove the Badge from the scope', inject(function(Badges) {
			// Create new Badge object
			var sampleBadge = new Badges({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Badges array and include the Badge
			scope.badges = [sampleBadge];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/badges\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBadge);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.badges.length).toBe(0);
		}));
	});
}());