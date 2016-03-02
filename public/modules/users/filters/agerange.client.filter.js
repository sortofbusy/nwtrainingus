'use strict';

angular.module('users').filter('agerange', [
	function() {
		return function(applications, greaterThan, lowerThan) { 
	        applications = applications.filter(function(application){
	            return application.applicant.age >= greaterThan && application.applicant.age <= lowerThan;
	        });
			return applications;
	    };
	}
]);