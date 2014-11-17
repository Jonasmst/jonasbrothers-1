// TODO: Organize controller into specific functions for different requests.

// API-docs: https://www.dhis2.org/doc/snapshot/en/developer/html/dhis2_developer_manual.html

var app = angular.module('facilityRegistry',[]);

app.controller('TestController', ['$scope', '$http', function($scope, $http) {

	var testCtrl = this;

	testCtrl.levelOptions = [{name:'National Unit', level:1}, 
	                         {name:'Organisation Unit Group', level:2}, 
	                         {name:'Organisation Unit', level:3}, 
	                         {name:'Facility',level:4}];
	
	// Default is Facility.
	testCtrl.currentOrgType = testCtrl.levelOptions[3];
	// Query the user is searching for.
	testCtrl.currentQuery = "";
	
	testCtrl.geoCoords = [];
	testCtrl.allOrgUnits = [];

	// URL for orgunits-API
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";

	// Tweaked URL to include coordinates (if applicable) for the facility.
	// Not all facilities have coordinates. Figure out how to correctly represent those we can.
	var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level&pageSize=1332";

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
	
	// Changes the color of the markers related to the clicked orgUnit/facility.
	$scope.updateMap = function(orgUnit) {
		if(orgUnit.coordinates)
			updateMarkers(orgUnit.name, orgUnit.level);
	}
	
	// A custom filter for the ng-repeat.
	$scope.customFilter = function(name) {
		// Custom filter. Currently filtering:
		// - By level.
		// - Query.
		return function(orgUnit) {
			return (orgUnit.level == testCtrl.currentOrgType.level && 
					orgUnit.name.toLowerCase().indexOf(testCtrl.currentQuery) != -1);
		}
	}
	

    // PUT-test
    $scope.updateOrgUnit = function(orgUnitID) {
        alert("Click, id: " + orgUnitID);
        var results = $.grep(testCtrl.allOrgUnits, function(e) { return e.id === orgUnitID;});
        // Given that we can guarantee that ID is in the array, and is unique. Should imp checks.
        var unit = results[0];
        
        console.log(unit);

        // TEST updating name.
        unit.name += " TEST";

        // TODO: Add inputs for editing specific properties, name, location, etc.

        var request = $http({
            method: "put",
            url: "http://inf5750-14.uio.no/api/organisationUnits/" + orgUnitID,
            data: unit,
        });

        request.success(function(data) {
            alert("Success!");
        }).error(function(data, status) {
            alert("Error! " + data);
        });
    }

}]);
