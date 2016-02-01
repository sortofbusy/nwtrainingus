'use strict';

module.exports = {
	app: {
		title: 'Northwest Training',
		description: '',
		keywords: ''
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: process.env.SESSION_SECRET,
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/fontawesome/css/font-awesome.min.css',
				'public/lib/angular-busy/dist/angular-busy.css',
				'public/lib/angular-loading-bar/build/loading-bar.min.css',
				'public/lib/ladda/dist/ladda-themeless.min.css'
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-busy/dist/angular-busy.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/biblejs/dist/bible.js',
				'public/lib/angular-loading-bar/build/loading-bar.min.js',
				'public/lib/ladda/dist/spin.min.js',
				'public/lib/ladda/dist/ladda.min.js',
				'public/lib/angular-ladda/dist/angular-ladda.min.js',
				'public/lib/moment/min/moment.min.js',
				'public/lib/moment-timezone/builds/moment-timezone-with-data-2010-2020.min.js',
				'public/lib/angular-moment/angular-moment.min.js',
				'public/lib/angular-ui-mask/dist/mask.js',
				'public/lib/signature_pad/signature_pad.js',
				'public/lib/angular-signature/src/signature.js',
				'public/lib/checklist-model/checklist-model.js',
			]
		},
		css: [
			'public/modules/**/css/*.css',
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};