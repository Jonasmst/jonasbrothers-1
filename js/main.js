//TODO: Organize controller into specific functions for different requests.
//CONSIDER: Present border options as checkboxes instead of select?
/* TODO: Figure out levels / what we're supposed to do. 
    Currently, we're presenting every level of units (1-4). Given the 
    name Facility registry, are we supposed to deal only with facilities (level 4)?

    Also, we're listing the levels like this:
    Level 1: National Unit
    Level 2: Organisation Unit Group
    Level 3: Organisation Unit
    Level 4: Facility

    The server list's the hierarchy like this (under Organisation Unit Level):
    Level 1: National
    Level 2: District
    Level 3: Chiefdom
    Level 4: Facility

 */
/* TODO: Have we understood the hierarchy correctly? Observations:
    When selecting Organisation Unit Group in our solution, we present what the server
    presents as Organisation Units. I believe unit groups are more like categories,
    e.g. clinic, hospital. Check link.
    (LINK: http://inf5750-14.uio.no/dhis-web-maintenance-organisationunit/organisationUnit.action)

    I think we may have gotten organisation units right. A search for Badjia, 
    and orgunit according to our imp, the server displays the following hierarchy:
    Badjia - Bo - Sierra Leone. So I'm guessing Bo is a city, while
    Badjia is an orgUnit in the city of Bo, in the country Sierra Leone. Not sure, though,
    but we should make sure we understand this correctly before proceeding.

    Our orgunit group == district or city or something of less resolution.

    I think we've gotten facilities right aswell. Server displays following hierarchy:
    Adonkia CHP - Nieni - Koinadugu - Sierra Leone.

    I haven't figured out what National Units are, or whether they're relvant or not.

    To conclude, I'm pretty sure we've got orgunit-groups/districts mixed up.


	Haakon: Should we just change the name of 'Organisation Unit Group's to 'District' then?
			Seems like the easiest solution, as we hardly "do" much with them to need to change much.
 */

/* TODO: Fix: Units that are updated do not appear in the list after refreshing page.
         It seems to be something with the customFilter. If you remove the custom filtering
         from the ng-repeat, the updated units show up. Also, they show up under "national unit"
         but not under "facility".
         Levels change from 4 to 1 when updating, for some reason.
*/

//API-docs: https://www.dhis2.org/doc/snapshot/en/developer/html/dhis2_developer_manual.html

var app = angular.module('facilityRegistry',[]);

app.controller('TestController', ['$scope', '$http', function($scope, $http) {

	var testCtrl = this;

	testCtrl.levelOptions = [{name:'National Unit', 		level:1}, 
	                         {name:'District', 				level:2}, 
	                         {name:'Organisation Unit', 	level:3}, 
	                         {name:'Facility',				level:4}];

	testCtrl.borderOptions = [{name:'None',					level:-1},
	                          {name:'All',					level:0},
	                          {name:'District', 			level:2, checked:false},
	                          {name:'Organisation Units', 	level:3, checked:false}];

	// Default is Facility.
	testCtrl.currentOrgType = testCtrl.levelOptions[3];
	// Denotes whether the polygons for an OU should be shown or not.
	testCtrl.showBorders = 0;

	// Query the user is searching for.
	testCtrl.currentQuery = "";
	testCtrl.geoCoords = [];
	testCtrl.allOrgUnits = [];
	testCtrl.sortOnPosition = false;
	testCtrl.units = [];
	testCtrl.firstInit = true;
	
    // What is this?
	var myPosition = new google.maps.Marker({
		position: new google.maps.LatLng(8.269720, -12.483215), // temporary position
		map: map,
		title: "My location",
		icon: blueMarker,
		used: false,
	});

	// URL for orgunits-API
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";

	// Tweaked URL to include coordinates (if applicable) for the facility.
	// Not all facilities have coordinates. Figure out how to correctly represent those we can.
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level&pageSize=1332";

	var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level&pageSize=1332";

	// Cross-site redirect error solution: Run chrome with --disable-web-security
	var base64 = "YWRtaW46ZGlzdHJpY3Q=";
	$http.get(apiUrl, {headers: {'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q='}}).
	success(function(data) {
		testCtrl.allOrgUnits = data.organisationUnits;

		// Log all the info
		//console.log(testCtrl.allOrgUnits);

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
				updateMarker(orgUnit);
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
		// TODO: filter by position
		
		return function(orgUnit) {
			if(testCtrl.sortOnPosition === false && testCtrl.firstInit === false){
				// Sort on markers from map.js
				console.log("SortOnPosition === true");
				return null;
				
			}
			console.log("SortOnPosition === false");
			return (orgUnit.level == testCtrl.currentOrgType.level && 
					orgUnit.name.toLowerCase().indexOf(testCtrl.currentQuery.toLowerCase()) != -1);
		}
	}
	
	/*function get_closest_unit(sortedUnits){
		var closestUnit = -1; //init value
		var closestDist = -1;
		for (i = 0; i < testCtrl.allOrgUnits.length; i++){
			//if(sortedUnits[i].level == testCtrl.currentOrgType.level && 
					//sortedUnits[i].name.toLowerCase().indexOf(testCtrl.currentQuery.toLowerCase()) != -1){
				alert("1 ", myPosition.name);
				//alert("2 ", myPosition.coords.longitude);
				alert("3 ", sortedUnits[i].name);
				//alert("4 ", sortedUnits[i].coords.longitude);
				/*var tmpDist = get_Distance(myPosition.coords.latitude, myPosition.coords.longitude, 
						sortedUnits[i], sortedUnits[i]);
				if(tmpDist < closestDist || closestDist === -1){
					closestDist = tmpDist;
					closestUnit = sortedUnits[i];
				}
			//}
		}
		return closestUnit;
		
	}*/

	// Filters the options when adding a new orgunit/facility.
	$scope.optionFilter = function(level) {
		return function(option) {
			return (option.level == 3 || option.level == 4)
		}
	}

	// TODO: Author, comment where getClosestFacilities() is, what it does and where/when it's called.
	//       Also, this doesn't do anything other than finding browser location.
	//		 It also gets mobile browser location, so it is suitable for mobile also.
	// Filters the option after distance from 'my position'
	$scope.getLocation = function(level){
		testCtrl.firstInit = false;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(location_found);
		} else {
			alert("Geolocation not supported:(");
			x.innerHTML = "Geolocation is not supported by this browser.";
		}
	}

	/**
	 * Sets if we want to sort orgunits based on closest to my position.
	 * Calls methods set_location and remove_location from map.js
	 * Remove comments to use real positions instead of the fixed position
	 */
	function location_found(position) {
		//var latitude = position.coords.latitude;
		//var longitude = position.coords.longitude;
		//myPosition.position = new google.maps.LatLng(latitude, longitude);
		
		if(testCtrl.sortOnPosition === false){
			testCtrl.sortOnPosition = true;
			set_location(myPosition); // calls method from map.js and set my location on the map
			//$scope.customFilter("name");
			//alert("TRUE");
		}else {
			testCtrl.sortOnPosition = false
			remove_location(myPosition); // Removes marker from map
			//$scope.customFilter("name");
			//alert("False");
		}

	}
	
    /**
    * Updates an orgunit. Called from save-button in template. 
    * @param unit JSONObject of orgunit, modified in template.
    */
    $scope.updateOrgUnit = function(unit) {

        var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits/";

        console.log(unit);

        // Setup request
        var request = $http({
            method: "put",
            url: apiUrl + unit.id,
            data: unit,
        });

        // Perform request
        request.success(function(data) {
            // TODO: Some kind of feedback? Angular automatically updates template.
            alert("Update success!");
        }).error(function(data, status) {
            alert("Update error");
        });
    };

	// Finds shortest path using great-circle between two points.
	// lat1, lon1: latitude and longitude for 'my position'
	// lat2, lon2: latitude and longitude for unit position
	function get_Distance(lat1, lon1, lat2, lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);  // deg2rad below
		var dLon = deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

	function deg2rad(deg) {
		return deg * (Math.PI/180)
	}


    /**
    * Creates an orgunit and uploads it to the server.
    * NOTE: IDs, createdAt, lastUpdated and href seem to be added by server; no need to specify.
    * @params unit JSONObject representation of the orgunit.
    */
    $scope.createOrgUnit = function(unit) {
        // TODO: Validate forms in template: Blank should not be allowed, fuzzes stuff up.
        // TODO: Fix circular json structures. I think referencing parents as json-objects is the culprit. Figure out how to represent parents.
        // TODO: Check if children are updated automatically in parents when adding a new unit.
        // TODO: Fix cancel button so that it closes container on click.

        // Debug
        console.log(unit);

        var post_data = {
            "name":unit.name,
            "shortName":unit.shortName,
            "level":unit.level,
            //"parent": {"id":"123456", "name":"TestParent"}
        };

        var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits/";

        // Updating save-button appearance for feedback
        $scope.unitAdded = true;

        // Setup request
        var request = $http( {
            method: "post",
            url: apiUrl,
            data: post_data,
            headers: {
                'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q=',
                'Content-Type': 'application/json'
            },
        });

        // Perform request
        request.success(function(data) {
            // Disable loading animation
            $scope.unitAdded = false;
            alert("Create success");

        }).error(function(data, status) {
            // Disable loading-animation
            $scope.unitAdded = false;
            alert("Create error :(");
            console.log("Create unit error:\n" + data);
        });
    };


    // When 'borderOptions' changes, show the applicable borders.
$scope.$watch('testCtrl.showBorders',function() {
    testCtrl.borderOptions[testCtrl.showBorders].checked = !testCtrl.borderOptions[testCtrl.showBorders].checked;
    toggleBorders(testCtrl.allOrgUnits,testCtrl.showBorders);
});

}]);

// Directive that allows us to dynamically change the input url.
app.directive('createOrgUnitForm', function() {	
	return {
		link: function(scope, element, attrs) {
			scope.getPageUrl = function() {
				return 'form-template-' + attrs.orgtype + '.html';
			}
		},
		template: '<div ng-include="getPageUrl()"></div>',
	};
});

