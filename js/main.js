var app = angular.module('facilityRegistry',[]);

// The controller, used by the <body> tag in the main.html file.
// We probably no longer need this.
app.controller('SearchController', function($scope){

});

app.controller('TestController', ['$http', function($http) {
	var testCtrl = this;
	testCtrl.names = [];
	testCtrl.allOrgUnits = [];

	// URL for orgunits-API
	var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";

	// Cross-site redirect error solution: Run chrome with --disable-web-security
	var base64 = "YWRtaW46ZGlzdHJpY3Q=";
	$http.get(apiUrl, {headers: {'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q='}}).
		success(function(data) {
			testCtrl.allOrgUnits = data.organisationUnits;
			
			// Filter limit i ng-repeat gjør at vi ikke trenger denne mer.
			//testCtrl.orgUnits = data.organisationUnits.splice(0, 10);
			
			// Log stuff
			console.log(data);
			console.log(testCtrl.orgUnits);
		}).
		error(function(data, status, headers, config) {
			alert("Error. Data: " + data);
		});


}]);
