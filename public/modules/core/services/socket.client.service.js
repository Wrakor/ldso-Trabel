/*global io:false */
'use strict';


//socket factory that provides the socket service
angular.module('core').factory('Socket', ['socketFactory', '$location',
    function(socketFactory, $location) {

      return { 
      	factory: function(id) { 

          var myIoSocket = io.connect($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/' + id);

          var mySocket = socketFactory({
            prefix: '',
            ioSocket: myIoSocket
          });

          return mySocket;
      	}
	    };
    }
]);