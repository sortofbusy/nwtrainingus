'use strict';

module.exports = {
	db: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/nwtraining',
	port: process.env.PORT || 80,
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/fontawesome/css/font-awesome.min.css',
				'public/lib/angular-busy/dist/angular-busy.css',
				'public/lib/angular-loading-bar/build/loading-bar.min.css',
				'public/lib/ladda/dist/ladda-themeless.min.css',
				'public/lib/ngprogress/ngprogress.css',
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-busy/dist/angular-busy.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/biblejs/dist/bible.js',
				'public/lib/angular-loading-bar/build/loading-bar.min.js',
				'public/lib/ladda/dist/spin.min.js',
				'public/lib/ladda/dist/ladda.min.js',
				'public/lib/angular-ladda/dist/angular-ladda.min.js',
				'public/lib/angular-ui-mask/dist/mask.js',
				'public/lib/signature_pad/signature_pad.js',
				'public/lib/angular-signature/src/signature.js',
				'public/lib/checklist-model/checklist-model.js',
				'public/lib/ngprogress/build/ngprogress.min.js',
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			port: process.env.MAILER_SMTP_PORT,
			host: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
