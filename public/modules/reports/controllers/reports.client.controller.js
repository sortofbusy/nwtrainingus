'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$http', '$window', '$stateParams', '$location', 'Authentication', 'Reports',
	function($scope, $http, $window, $stateParams, $location, Authentication, Reports) {
		$scope.authentication = Authentication;
		if ($stateParams.groupId) $http.get('/groups/' + $stateParams.groupId).success(function(response) {
			$scope.group = response;
		});
		$scope.sessionDate = Date.now();

		$scope.absent = [];

		$scope.lessons = [];
		for (var i = 1; i <= 36; i++) {
		    $scope.lessons.push(i);
		}
		
		// Create new Report
		$scope.create = function() {
			if (!$scope.lesson) {
				$scope.error = 'Please select lesson number';
				return;
			}
			for (var i = 0; i < $scope.absent.length; i++) {
				$scope.absent[i].userId = $scope.absent[i].userId._id;
			}
			for (var j = 0; j < $scope.group.users.length; j++) {
				$scope.group.users[j] = $scope.group.users[j]._id;
			}

			// Create new Report object
			var report = new Reports ({
				comment: this.comment,
				sessionDate: this.sessionDate,
				lesson: this.lesson,
				group: this.group._id,
				present: this.group.users,
				absent: this.absent
			});
			
			// Redirect after save
			report.$save(function(response) {
				$location.path('groups/' + $scope.group._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Report
		$scope.remove = function(report) {
			if(!$window.confirm('Are you sure?')) return;
			if ( report ) { 
				report.$remove();

				for (var i in $scope.reports) {
					if ($scope.reports [i] === report) {
						$scope.reports.splice(i, 1);
					}
				}
			} else {
				$scope.report.$remove(function() {
					$location.path('groups/'+$scope.report.group);
				});
			}
		};

		// Update existing Report
		$scope.update = function() {
			var report = $scope.report;

			report.$update(function() {
				$location.path('reports/' + report._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Reports
		$scope.find = function() {
			$scope.reports = Reports.query();
		};

		// Find a list of Reports
		$scope.groupReports = function() {
			$http.get('groups/'+$stateParams.groupId+'/reports').success(function(response){
				$scope.reports = response;
			});
		};

		// Find existing Report
		$scope.findOne = function() {
			$scope.report = Reports.get({ 
				reportId: $stateParams.reportId
			});
		};

		$scope.dropSuccessHandler = function($event,index,array){
		  	array.splice(index,1);
		};

		$scope.onDrop = function($event,$data,array){
		  	if(typeof $data.excused === 'undefined'){
				$data.excused = false;	
			}
		  		// if dropping into the 'Absent' box, add a property for excused
		  	if (array === $scope.absent || array ===$scope.report.absent) {
		  		$data = {
					userId: $data,
					excused: $data.excused
				};
				// otherwise remove that property
			} else $data = $data.userId;

		  	array.push($data);
		};
	}
]);