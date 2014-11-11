var app = angular.module('facilityRegistry',[]);

// The controller, used by the <body> tag in the main.html file.
// We have to pass along the $http service aswell!
app.controller('SearchController', function($scope){

	$scope.testFunction = function(msg) {
		alert('Du søkte etter: ' + msg[0]);
	};

	// We name this controller, so that we can use it within the scope of another.
	//var search = this;

	// Initialize an empty array of facilities, to be filled later.
	//this.facilities = []

	// Construct the url based on the passed request and other parameters.
	//this.query = 'baselineurl' + 'somerequest' + '.json';

	// Fills 'facilities' with lots of data, determined by our url.
	//$http.get(search.query).success(function(data){
	// Search was successful. Found some data.
	//	search.facilities = data;
	//})
	// if error: do something else.

});

app.controller('TestController', ['$http', function($http) {
	var testCtrl = this;
	testCtrl.orgUnits = [];
	testCtrl.names = [];
	testCtrl.allOrgUnits = [];

	// URL for orgunits-API
	var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";
	//var apiUrl = "http://inf5750-14.uio.no/api/currentUser";

	// Cross-site redirect error solution: Run chrome with --disable-web-security
	var base64 = "YWRtaW46ZGlzdHJpY3Q=";
	$http.get(apiUrl, {headers: {'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q='}}).
		success(function(data) {
			testCtrl.allOrgUnits = data.organisationUnits;
			testCtrl.orgUnits = data.organisationUnits.splice(0, 10);
			
			// Log stuff
			console.log(data);
			console.log(testCtrl.orgUnits);
		}).
		error(function(data, status, headers, config) {
			alert("Error. Data: " + data);
		});


}]);
