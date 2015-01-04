'use strict';

// Trips controller
angular.module('trips').controller('TripsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Trips', 'uiGmapGoogleMapApi', 'ngDialog', '$http',  'SweetAlert',
	function($scope, $stateParams, $location, Authentication, Trips, gmap, ngDialog, $http, SweetAlert) {
		$scope.authentication = Authentication;

		$scope.map = {
			//TODO: Center map on trip markers
			center: {
				latitude: 20,
				longitude: 0
			},
			zoom: 2,
			events: {
				/*click: function(maps, eventName, args){
					console.log('CLICKED ON:', args[0].latLng);
				},
				center_changed: function(maps, eventName, args){
					console.log('ALOOO');
				}*/
			},
			object: {}
		};

		$scope.searchbox = {
			template:'searchbox.tpl.html',
			position:'top-left',
			events: {}
		};

		$scope.timeline_selection = undefined;
		$scope.timeline_data = [];
		$scope.timeline_options = {
		  'width':  '100%',
		  'editable': true,
		  'minHeight': '50px'
		};


		function addCurrentMarkersToTimeline(){
			$scope.trip.markers.forEach(function(marker){
				var tl_data = {
					'start': marker.start,
					'end': marker.end,
					'content': marker.place_name
				};
				$scope.timeline_data.push(tl_data);
			});
		}



		// Create new Trip
		$scope.create = function() {
			// Create new Trip object
			var trip = new Trips ({
				name: this.name
			});

			// Redirect after save
			trip.$save(function(response) {
				$location.path('trips/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Trip
		$scope.remove = function( trip ) {
			if ( trip ) { trip.$remove();

				for (var i in $scope.trips ) {
					if ($scope.trips [i] === trip ) {
						$scope.trips.splice(i, 1);
					}
				}
			} else {
				$scope.trip.$remove(function() {
					$location.path('trips');
				});
			}
		};

		// Update existing Trip
		$scope.update = function() {
			var trip = $scope.trip ;

			trip.$update(function() {
				$location.path('trips/' + trip._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Trips
		$scope.find = function() {
			$scope.trips = Trips.query();
		};

		// Find existing Trip
		$scope.findOne = function() {
			$scope.trip = Trips.get({
				tripId: $stateParams.tripId
			},function(data) { //this runs after trip is loaded
				//fix error when running tests
				if (typeof $scope.init === 'function') {
					$scope.init();
				}
			});
		};

		$scope.returnToTripView = function() {
			var url = 'trips/' + $scope.trip._id;
			$location.path(url);
		};

		$scope.AddMate = function () {
      var dialog = ngDialog.open({
        	template: '/modules/trips/views/dialogs/add-mate-dialog.client.view.html',
        	controller: 'AddMateController',
        	scope: $scope,
        	className: 'ngdialog-theme-plain'
      });

      dialog.closePromise.then(function (data) {
			  console.log(data.id + ' has been dismissed.');
			  console.log(data.value);
			  $scope.trip = data.value;
			});
    };

    $scope.leaveTrip = function(){

    	var url = '/trips/' + $scope.trip._id + '/leave';
    	$http.put(url, '')
           .success(function(data, status, headers, config){
           		console.log('SUCCESS on PUT leaveTrip');
           		console.log(data);
              $location.path('trips');
           })
           .error(function(data, status, headers, config){
              console.error('ERROR on PUT leaveTrip');
              console.log(data);
           });
		};

		$scope.requestToJoin = function(){

    	var url = '/trips/' + $scope.trip._id + '/request/join';
    	$http.post(url, '')
           .success(function(data, status, headers, config){
           		console.log('SUCCESS on POST requestToJoin');
           		console.log(data);
              $location.path('trips');
           })
           .error(function(data, status, headers, config){
              console.error('ERROR on POST requestToJoin');
              console.log(data);
           });

		};

		$scope.cloneTrip = function(){
			var url = '/trips/' + $scope.trip._id + '/clone';
			$http.post(url, '').success(
				function(data, status, headers, config){
					$location.path('trips/'+data._id);
			}).error(
				function(data, status, headers, config){
					console.log('ERROR:', data.message);
			});
		};

		$scope.disqus = {
			tripID: $stateParams.tripId,
			url: $location.absUrl()
		};

		gmap.then(function(maps) {

			$scope.searchbox.events.places_changed = function(box, eventName, args){
				var map = $scope.map.object.getGMap();
				var place = box.getPlaces()[0];
				var marker = {
					place_name: place.name,
					place_id: place.place_id,
					start: Date.now(),
					end: Date.now(),
					location: {
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					}
				};
				//TODO: save in different collection
				//TODO: should we allow this?
				var ALLOWDUPES = true;
				var exists;
				if(!ALLOWDUPES) {
					exists = false;
					$scope.trip.markers.forEach(function(marker) {
						if(marker.place_id === place.place_id) {
							exists = true;
							SweetAlert.swal('No duplicate points allowed', '', 'error');
						}
					});
				}
				if(ALLOWDUPES || !exists) {
					if(place.geometry.viewport)
					{
						marker.viewport = {
							northeast: {
								latitude: place.geometry.viewport.getNorthEast().lat(),
								longitude: place.geometry.viewport.getNorthEast().lng()
							},
							southwest: {
								latitude: place.geometry.viewport.getSouthWest().lat(),
								longitude: place.geometry.viewport.getSouthWest().lng()
							}
						};
						$scope.bounds.union(makeViewport(marker.viewport));
					}
					else
						$scope.bounds.extend(place.geometry.location);
					$scope.lineCoords.push(place.geometry.location);
					$scope.path.setPath($scope.lineCoords);
					$scope.trip.markers.push(marker);
					$scope.centerMap(marker);
					addCurrentMarkersToTimeline(); //better way maybe?
					$scope.updateTrip();
				}
			};

			$scope.centerMap = function(marker) {
				var map = $scope.map.object.getGMap();
				if(marker.viewport)
					map.fitBounds(makeViewport(marker.viewport));
				else {
					map.setCenter(
						{
							lat:marker.location.latitude,
							lng:marker.location.longitude
						});
					map.setZoom(17);
				}
			};

			$scope.deleteMarker = function(index) {
				$scope.trip.markers.splice(index, 1);
				$scope.init(); //need to re-init (bounds cant be "un-extended")
				$scope.updateTrip();
			};

			$scope.updateTrip = function() {
				$scope.isLoading = true;
				$scope.sortableOptions.disabled = true;
				$scope.trip.$update().then(function (response) {
					$scope.isLoading = false;
					$scope.sortableOptions.disabled = false;
				});
			};

			$scope.sortableOptions = {
				start: function(e, ui) {
					ui.item.i = ui.item.index();
				},
				stop: function(e, ui) {
					//update positions in lineCoords array
					if(ui.item.index()!==ui.item.i) {
						$scope.lineCoords.splice(ui.item.index(), 0, $scope.lineCoords.splice(ui.item.i, 1)[0]);
						$scope.path.setPath($scope.lineCoords);
						$scope.updateTrip();
					}
				}
			};

			$scope.path = new maps.Polyline({
				geodesic: true,
				strokeColor: 'blue',
				strokeWeight: 5,
				strokeOpacity: 0.5
			});

			function makeViewport(obj) {
				return new maps.LatLngBounds(
					new maps.LatLng(
						obj.southwest.latitude,
						obj.southwest.longitude
					),
					new maps.LatLng(
						obj.northeast.latitude,
						obj.northeast.longitude
					));
			}

			$scope.markers = {
				events: {
					click: function(marker, eventName, model, args) {
						$scope.centerMap(model);
					}
				}
			};

			$scope.closestPOI = function(marker) {
				var fourSquareQuery;
				console.log(marker);
				if(marker.viewport) {
					var viewport = makeViewport(marker.viewport);
					fourSquareQuery = 'ne=' + viewport.getNorthEast().lat + ',' + viewport.getNorthEast().lng +
					'&sw=' + viewport.getSouthWest().lat + ',' + viewport.getSouthWest().lng;
				}
				else
					fourSquareQuery = 'll=' + marker.getPosition().lat() + ',' + marker.getPosition().lng()+'&radius=800';

				$http.get('https://api.foursquare.com/v2/venues/search?client_id=H2LVVK045LCEOM235LT5GBAA3HGETTMNPRMYN23Y4EGSQGVX&client_secret=QZSL0O3ZKLZNH4XJ5I5SJNRR2W4L5YUNMFNEUY52XXG44MLT&v=20130815&intent=browse&'+fourSquareQuery+'&query=sushi').
				success(function(data, status, headers, config) {
					console.log(data.response.venues);
				}).
				error(function(data, status, headers, config) {
					alert('Error getting data from Foursquare');
				});
			};

			$scope.init = function() {

				addCurrentMarkersToTimeline();
				$scope.timeline_options.start = $scope.trip.startDate;
				$scope.timeline_options.end = $scope.trip.endDate;
				console.log($scope.timeline_options);

				var map = $scope.map.object.getGMap();
				$scope.bounds = new maps.LatLngBounds();
				$scope.lineCoords = [];
				for (var i=0; i<$scope.trip.markers.length; i++) {
					var marker = $scope.trip.markers[i];
					var latlng = new maps.LatLng(
						marker.location.latitude,
						marker.location.longitude
					);
					$scope.lineCoords.push(latlng);
					if(marker.viewport)
						$scope.bounds.union(makeViewport(marker.viewport));
					else
						$scope.bounds.extend(latlng);
				}
				$scope.path.setPath($scope.lineCoords);
				$scope.path.setMap(map);
				map.fitBounds($scope.bounds);
			};

			$scope.resetMap = function() {
				var map = $scope.map.object.getGMap();
				map.fitBounds($scope.bounds);
			};

			$scope.togglePrivacy = function() {
				$scope.trip.privacy = $scope.trip.privacy?0:1;
				//TODO: optimize this, only pass field
				$scope.updateTrip();
			};

			//TODO security issues?
			$scope.hasPermission = function(){
				var permission = false;

				if($scope.authentication.user._id === $scope.trip.user._id){
					permission = true;
				}else{
					$scope.trip.members.forEach(function(member){
						if(member.user._id === $scope.authentication.user._id || member.user.permission === 'write'){
							permission = true;
						}
					});
				}

				return permission;
			};

			$scope.isOwner = function() {
				return $scope.authentication.user._id === $scope.trip.user._id;
			};

			$scope.isTripMember = function(){
				var isMember = false;
				$scope.trip.members.forEach(function(member){
					if(member.user._id === $scope.authentication.user._id){
						isMember = true;
					}
				});
				return isMember;
			};
		});
	}
]);
