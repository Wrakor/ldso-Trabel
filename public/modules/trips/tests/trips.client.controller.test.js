'use strict';

(function() {
	// Trips Controller Spec
	describe('Trips Controller Tests', function() {
		// Initialize global variables
		var TripsController,
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

			// Initialize the Trips controller.
			TripsController = $controller('TripsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Trip object fetched from XHR', inject(function(Trips) {
			// Create sample Trip using the Trips service
			var sampleTrip = new Trips({
				name: 'New Trip'
			});

			// Create a sample Trips array that includes the new Trip
			var sampleTrips = [sampleTrip];

			// Set GET response
			$httpBackend.expectGET('trips').respond(sampleTrips);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();
			
			// Test scope value
			expect(scope.trips).toEqualData(sampleTrips);
		}));

		it('$scope.findOne() should create an array with one Trip object fetched from XHR using a tripId URL parameter', inject(function(Trips) {
			// Define a sample Trip object
			var sampleTrip = new Trips({
				name: 'New Trip'
			});

			// Set the URL parameter
			$stateParams.tripId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/trips\/([0-9a-fA-F]{24})$/).respond(sampleTrip);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.trip).toEqualData(sampleTrip);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Trips) {
			// Create a sample Trip object
			var sampleTripPostData = new Trips({
				name: 'New Trip'
			});

			// Create a sample Trip response
			var sampleTripResponse = new Trips({
				_id: '525cf20451979dea2c000001',
				name: 'New Trip'
			});

			// Fixture mock form input values
			scope.name = 'New Trip';

			// Set POST response
			$httpBackend.expectPOST('trips', sampleTripPostData).respond(sampleTripResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Trip was created
			expect($location.path()).toBe('/trips/' + sampleTripResponse._id);
		}));

		it('$scope.update() should update a valid Trip', inject(function(Trips) {
			// Define a sample Trip put data
			var sampleTripPutData = new Trips({
				_id: '525cf20451979dea2c000001',
				name: 'New Trip'
			});

			// Mock Trip in scope
			scope.trip = sampleTripPutData;

			// Set PUT response
			$httpBackend.expectPUT(/trips\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/trips/' + sampleTripPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid tripId and remove the Trip from the scope', inject(function(Trips) {
			// Create new Trip object
			var sampleTrip = new Trips({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Trips array and include the Trip
			scope.trips = [sampleTrip];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/trips\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTrip);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.trips.length).toBe(0);
		}));
	});
}());