'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('landing', { //maybe remove this one
			url: '/landing',
			templateUrl: 'modules/core/views/landing.client.view.html'
		}).
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).
    	state('dash', {
			url: '/dashboard',
			templateUrl: 'modules/core/views/dashboard.client.view.html'
		});
	}
]);
