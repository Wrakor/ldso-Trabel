'use strict';

module.exports = {
	app: {
		title: 'MEAN',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
                'http://fonts.googleapis.com/css?family=Righteous',
				'public/lib/bootstrap/dist/css/bootstrap.css',

				//'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/css/style_v2.css',

				'public/lib/famous-angular/dist/famous-angular.css',
				'public/lib/angular-xeditable/dist/css/xeditable.css',
				'public/lib/slippry/dist/slippry.min.css',
				'public/lib/ngAnimate/css/ng-animation.css',
				'public/lib/sweetalert/lib/sweet-alert.css',
				'public/lib/ngDialog/css/ngDialog.css',
				'public/lib/ngDialog/css/ngDialog-theme-plain.css',
				'public/lib/bootstrap-social/bootstrap-social.css',
				'public/lib/angular-timeline/links_timeline/timeline.css'
			],
			js: [
				'public/lib/lodash/dist/lodash.underscore.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/famous/famous-global.js',
				'public/lib/famous-angular/dist/famous-angular.js',
				'public/lib/bluebird/js/browser/bluebird.js',
				'public/lib/angular-google-maps/dist/angular-google-maps.min.js',
				'public/lib/angular-xeditable/dist/js/xeditable.min.js',
				'public/lib/angular-ui-sortable/sortable.min.js',
				'public/lib/jquery-ui/jquery-ui.min.js',
				'public/lib/jquery-ui/ui/minified/sortable.min.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/mixitup2/build/jquery.mixitup.min.js',
				'public/lib/slippry/dist/slippry.min.js',
				'public/lib/wowjs/dist/wow.js',
				'public/lib/bootstrap/dist/js/bootstrap.js',
				'public/lib/bootstrap-hover-dropdown/bootstrap-hover-dropdown.js',
				'public/lib/sweetalert/lib/sweet-alert.js',
				'public/lib/angular-sweetalert/SweetAlert.js',
				'public/lib/ngDialog/js/ngDialog.js',
				'public/lib/disqus-here/src/disqus-here.js',
				'public/lib/angularjs-country-select/angular.country-select.js',
				'public/lib/angular-timeline/links_timeline/timeline.js'
				//'public/lib/angular-foundation/mm-foundation-tpls-VERSION.js',


			]
		},
		css: [
			'public/modules/**/css/*.css',
			'public/modules/core/css/landing/*.css',
			'public/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js',
			'public/scripts/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
