// TODO: Organize controller into specific functions for different requests.

// API-docs: https://www.dhis2.org/doc/snapshot/en/developer/html/dhis2_developer_manual.html

var app = angular.module('facilityRegistry',[]);

app.controller('TestController', ['$scope', '$http', function($scope, $http) {

	var testCtrl = this;
	testCtrl.geoCoords = [];
	testCtrl.allOrgUnits = [];

	// URL for orgunits-API
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";

	// Tweaked URL to include coordinates (if applicable) for the facility.
	// Not all facilities have coordinates. Figure out how to correctly represent those we can.
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level&pageSize=1332";

    var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:all,coordinates,level&pageSize=100";

	// Cross-site redirect error solution: Run chrome with --disable-web-security
	var base64 = "YWRtaW46ZGlzdHJpY3Q=";
	$http.get(apiUrl, {headers: {'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q='}}).
	success(function(data) {
		testCtrl.allOrgUnits = data.organisationUnits;

		// Log all the info
		console.log(testCtrl.allOrgUnits);

		// Reads all the coordinates. CURRENTLY ONLY GETS THOSE ON LEVEL 4.
		// HARD-CODED AS FFFFFFF. Creates pairs of [name, [coordinates]].
		// Discuss how we implement this.
		for (i = 0; i < testCtrl.allOrgUnits.length; i++)
			if(testCtrl.allOrgUnits[i].coordinates != undefined && testCtrl.allOrgUnits[i].coordinates.length < 200)
				testCtrl.geoCoords.push(new Array(testCtrl.allOrgUnits[i].name, testCtrl.allOrgUnits[i].coordinates.substring(1,testCtrl.allOrgUnits[i].coordinates.length-1).split(",")));

		// Log all the coordinates.
		//console.log(testCtrl.geoCoords);
		
		// Add the coordinates to the map.
		addMarkers(testCtrl.geoCoords);		
	}).
	error(function(data, status, headers, config) {
		alert("Error. Data: " + data);
	});

    // PUT-test
    $scope.updateOrgUnit = function(unit) {
        var orgUnitID = unit.id;
        alert("Click, id: " + orgUnitID);
        
        console.log(unit);

        // Setup request
        var request = $http({
            method: "put",
            url: "http://inf5750-14.uio.no/api/organisationUnits/" + orgUnitID,
            data: unit,
        });

        // Perform request
        request.success(function(data) {
            alert("Success!");
        }).error(function(data, status) {
            alert("Error! " + data);
        });
    };

}]);
