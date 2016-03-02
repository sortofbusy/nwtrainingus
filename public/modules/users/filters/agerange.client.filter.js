'use strict';

angular.module('users').filter('agerange', [
	function() {
		return function(applications, greaterThan, lowerThan) { 
	        applications = applications.filter(function(application){
	            if (!application.applicant || !application.applicant.age) return false;
	            return application.applicant.age >= greaterThan && application.applicant.age <= lowerThan;
	        });
			return applications;
	    };
	}
]);