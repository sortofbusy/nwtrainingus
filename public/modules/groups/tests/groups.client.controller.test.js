'use strict';

(function() {
	// Groups Controller Spec
	describe('Groups Controller Tests', function() {
		// Initialize global variables
		var GroupsController,
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

		// mock out Authentication with a fake one
		beforeEach(module(function ($provide) {

		   //create mock 
		     var mockAuthentication = {
		         user: {
								_id : '56b66b18dd3d5b6c16aaa1f5',
								username : 'happy@example.com',
								displayName : 'Happy Brother',
								provider: 'local',
								email: 'happy@example.com',
								applications: [],
								language: 'Chinese',
								timezone: 'America/Los_Angeles',
								registration: {
								    status: []
								},
								//created: ISODate('2016-02-06T21:52:24.016Z'),
								roles: [ 
								    'user'
								],
								lastName: 'Brother',
								firstName: 'Happy',
								age: 54,
								locality: {
								    name: 'Seattle',
								    area: ''
								},
								occupation: 'Anaja',
								phone: 4566446494.0000000000000000,
								//registered: ISODate('2016-02-06T21:52:43.037Z'),
								serviceAreas: 'Sjsjsjs'
							}
		              };

		$provide.value('Authentication', mockAuthentication); // use $provide to swap the real $location with our mock
		}));
		
		var Authentication;

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;
			
			// Initialize the Groups controller.
			GroupsController = $controller('GroupsController', {
				$scope: scope,
				Authentication: _Authentication_
			});
		}));

		it('$scope.find() should create an array with at least one Group object fetched from XHR', inject(function(Groups) {
			// Create sample Group using the Groups service
			var sampleGroup = new Groups({
				locality: {
					name: 'Seattle',
					area: ''
				},
				language: 'English',
				meeting: {
					place: 'Hall',
					day: 2,
					time: '2016-10-02T01:00:00.000Z'
				}
			});

			// Create a sample Groups array that includes the new Group
			var sampleGroups = [sampleGroup];

			// Set GET response
			$httpBackend.expectGET('groups').respond(sampleGroups);
			$httpBackend.expectGET('/groups/unassigned').respond([]);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.groups).toEqualData(sampleGroups);
		}));

		it('$scope.findOne() should create an array with one Group object fetched from XHR using a groupId URL parameter', inject(function(Groups) {
			// Define a sample Group object
			var sampleGroup = new Groups({
				locality: {
					name: 'Seattle',
					area: ''
				},
				language: 'English',
				meeting: {
					place: 'Hall',
					day: 2,
					time: '2016-10-02T01:00:00.000Z'
				}
			});

			// Set the URL parameter
			$stateParams.groupId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/groups\/([0-9a-fA-F]{24})$/).respond(sampleGroup);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.group).toEqualData(sampleGroup);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Groups) {
			// Create a sample Group object
			var sampleGroupPostData = new Groups({
				locality: {
					name: 'Seattle',
					area: ''
				},
				language: 'English',
				meeting: {
					place: 'Hall',
					day: 2,
					time: '2016-10-02T01:00:00.000Z'
				}
			});

			// Create a sample Group response
			var sampleGroupResponse = new Groups({
				_id: '525cf20451979dea2c000001',
				locality: {
					name: 'Seattle',
					area: ''
				},
				language: 'English',
				meeting: {
					place: 'Hall',
					day: 2,
					time: '2016-10-02T01:00:00.000Z'
				}
			});
			

			// Fixture mock form input values
			scope.locality = {
					name: 'Seattle',
					area: ''
				};
			scope.language = 'English';
			scope.meeting = {
					place: 'Hall',
					day: 2,
					time: '2016-10-02T01:00:00.000Z'
				};

			// Set POST response
			$httpBackend.expectPOST('groups', sampleGroupPostData).respond(sampleGroupResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			//expect(scope.name).toEqual('');

			// Test URL redirection after the Group was created
			expect($location.path()).toBe('/groups/' + sampleGroupResponse._id);
		}));

		it('$scope.update() should update a valid Group', inject(function(Groups) {
			// Define a sample Group put data
			var sampleGroupPutData = new Groups({
				_id: '525cf20451979dea2c000001',
				name: 'New Group'
			});

			// Mock Group in scope
			scope.group = sampleGroupPutData;

			// Set PUT response
			$httpBackend.expectPUT(/groups\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/groups/' + sampleGroupPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid groupId and remove the Group from the scope', inject(function(Groups) {
			// Create new Group object
			var sampleGroup = new Groups({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Groups array and include the Group
			scope.groups = [sampleGroup];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/groups\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleGroup);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.groups.length).toBe(0);
		}));
	});
}());