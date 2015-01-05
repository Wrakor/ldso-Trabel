'use strict';

angular.module('core').controller('DashboardController', ['$scope', '$stateParams', 'Authentication', 'Trips',  '$http',  'SweetAlert',
	function($scope, $stateParams, Authentication, Trips, $http, SweetAlert) {		
		
		// Find existing Trip
		$scope.findTopTrips = function() {
			
			$http.get('/dashboard/getTopTrips')
           .success(function(data, status, headers, config){      
              $scope.topTrips = data;
			  $scope.topTrips.forEach(function(trip) {
				  var trip_temp = trip;
				  trip_temp.nPOIs = 0;
			  	trip.markers.forEach(function(marker) {
					trip_temp.nPOIs += marker.POIs.length;
				});
           		});
			})
           .error(function(data, status, headers, config){
              console.error('ERROR on POST /dashboard/getTopTrips');
              console.log(data);
           });
			
			
			console.log($scope.topTrips);
		};
	}

]);