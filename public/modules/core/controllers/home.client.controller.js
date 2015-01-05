'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location', function($scope, Authentication, $location) {

  if (Authentication.user)
    $location.path('dashboard');
  else
    $location.path('landing');
  /*
  $scope.map = {
    center: {
      latitude: 45,
      longitude: -73
    },
    zoom: 8
  };

  var onSuccess = function(position) {
    $scope.map.center = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    $scope.$apply();
  };
  function onError(error) {
    console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
  }
  //navigator.geolocation.getCurrentPosition(onSuccess, onError);
*/
}]);
