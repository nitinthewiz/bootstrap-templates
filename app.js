  var app = angular.module('app', []);

  app.controller('mainCtrl', function ($scope, $http) {

    $scope.appName = 'Yo Bootstrap'

    $scope.bootstrap_version_filter = function(row){

      return function(row){

        // if it is 2, check if 2 is allowed
        if( row.bootstrap_version == 2 )
        {
          return $scope.bootstrap_2;
        }

        if( row.bootstrap_version == 3 )
        {
          return $scope.bootstrap_3;
        }
      }

    };

	$scope.filterTemplateName = function( templateName ){
		
		templateName = templateName.replace( '&#8211;', '-' );

		templateName = templateName.replace( '&#038;', '&' );

		return templateName;

	}

	// get json file
	$http({method: 'GET', url: 'data/data.json'}).success(function(data, status, headers, config) {
		$scope.data = data;
	});


  });