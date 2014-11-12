var app = angular.module('facilityRegistry',[]);

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

			// Log stuff
			console.log(data);
			console.log(testCtrl.orgUnits);
		}).
		error(function(data, status, headers, config) {
			alert("Error. Data: " + data);
		});


}]);
