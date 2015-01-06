'use strict';
/*global io:false */

//socket factory that provides the socket service
angular.module('core').factory('Socket', ['$location',
    function($location) {


      return { 
      	socketFactory: function(id) { 

          var data = {
            prefix: '',
            ioSocket: io.connect($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/' + id)
          };
          return data;
      	}
	    };
    }
]);