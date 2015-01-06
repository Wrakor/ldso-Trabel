'use strict';

angular.module('users').controller('SendMessageController', ['$scope', '$http', '$stateParams', 'SweetAlert',
	function($scope, $http, $stateParams, SweetAlert) {

	$scope.userID = $stateParams.userID;

    $scope.findOne = function(){
		if ($scope.userID) {
		  $http.get('/users/' + $stateParams.userID)
			  .success(function(data, status, headers, config){
  				console.log('SUCESS');
  				console.log(data);
  				$scope.receiver = data;
			  })
			  .error(function(data, status, headers, config){
				  console.log('ERROR');
				  console.log(data);
			  });
		}
	};

	function sendRequest(str){
      console.log('Sending request');


      var requestData = {
        pattern: str,
        members: [],
      };
      $http.post('/users/list', requestData)
           .success(function(data, status, headers, config){
              $scope.users = data;
		  console.log(data);
           })
           .error(function(data, status, headers, config){
              console.error('ERROR on POST /users/list');
              console.log(data);
           });
    }

    $scope.$watch('message.receiver', function(newValue, oldValue) {
      if(newValue !== undefined){
        if(newValue.length > 2 && oldValue.length <= 2){
          sendRequest(newValue);
        }
      }
    });

    $scope.sendMessage = function(){

		if ($scope.message.receiver)
			var userInfo = $scope.message.receiver.split('<'), userName = userInfo[0];

			$scope.users.forEach(function(user) {
				if (user.displayName === userName) {
					$stateParams.userID = user._id;
					console.log('user:' + user._id);
				}
			});

      var requestData = {
        subject: $scope.message.subject,
        content: $scope.message.content,
      };

      console.log($stateParams.userID);
      $http.put('/users/add/message/received/' + $stateParams.userID, requestData)
          .success(function(data, status, headers, config){
            console.log('SUCESS');
            console.log(data);
            $http.put('/users/add/message/sent/' + $stateParams.userID, requestData) //make it more semantic, the ID in the URL is not the sender's, but rather, the receiver's
                .success(function(data, status, headers, config){
                  console.log('SUCESS');
                  console.log(data);

				  SweetAlert.swal('Message Sent!', '', 'success');
                })
                .error(function(data, status, headers, config){
                    console.log('ERROR');
                    console.log(data);
					SweetAlert.swal('Message Not Sent!', '', 'error');
            });
          })
          .error(function(data, status, headers, config){
              console.log('ERROR');
              console.log(data);
		  	  SweetAlert.swal('Message Not Sent!', '', 'error');
      });

    };
	}
]);
