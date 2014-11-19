//TODO: Organize controller into specific functions for different requests.

//API-docs: https://www.dhis2.org/doc/snapshot/en/developer/html/dhis2_developer_manual.html

var app = angular.module('facilityRegistry',[]);

app.controller('TestController', ['$scope', '$http', function($scope, $http) {

	var testCtrl = this;

	testCtrl.levelOptions = [{name:'National Unit', level:1}, 
	                         {name:'Organisation Unit Group', level:2}, 
	                         {name:'Organisation Unit', level:3}, 
	                         {name:'Facility',level:4}];

	testCtrl.borderOptions = [{name:'None',level:-1},
	                          {name:'All',level:0},
	                          {name:'Organisation Units', level:3},
	                          {name:'Organisation Unit Groups', level:2}];

	// Default is Facility.
	testCtrl.currentOrgType = testCtrl.levelOptions[3];
	// Denotes whether the polygons for an OU should be shown or not.
	testCtrl.showBorders = testCtrl.borderOptions[0].level;
	
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

		// Reads all the coordinates.
		for (i = 0; i < testCtrl.allOrgUnits.length; i++)
			if(testCtrl.allOrgUnits[i].coordinates != undefined && testCtrl.allOrgUnits[i].coordinates.length < 200)
				testCtrl.geoCoords.push(new Array(testCtrl.allOrgUnits[i].name, testCtrl.allOrgUnits[i].coordinates.substring(1,testCtrl.allOrgUnits[i].coordinates.length-1).split(",")));

		// Add the coordinates to the map.
		addMarkers(testCtrl.geoCoords);
		
		// Create border-polygons for all the organisation units/groups with coordinates.
		for(i in testCtrl.allOrgUnits)
			if((testCtrl.allOrgUnits[i].level == 3 || testCtrl.allOrgUnits[i].level == 2) &&
					testCtrl.allOrgUnits[i].coordinates)
				createPolygon(testCtrl.allOrgUnits[i]);
	}).
	error(function(data, status, headers, config) {
		alert("Error. Data: " + data);
	});

	// Changes the color of the markers related to the clicked orgUnit/facility.
	$scope.updateMap = function(orgUnit) {
		if(orgUnit.coordinates) {
			if(orgUnit.level == 4) {
				updateMarkers(orgUnit);
			} else if(orgUnit.level > 1) {
				// Toggles whether the actual polygons will show or not.
				orgUnit.polyPath.setVisible(!orgUnit.polyPath.getVisible());

			}
		}
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

	// When 'showBorders' changes, show the applicable borders.
	$scope.$watch('testCtrl.showBorders',function() {
		toggleBorders(testCtrl.allOrgUnits,testCtrl.showBorders.level);
	});
	
	$scope.getLocation = function(){
		getClosestFacilitys();
	}

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
