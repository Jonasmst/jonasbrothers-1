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
	                          {name:'District', 			level:2},
	                          {name:'Organisation Units', 	level:3}];

	// Default is Facility.
	testCtrl.currentOrgType = testCtrl.levelOptions[3];
	// Denotes whether the polygons for an OU should be shown or not.
	testCtrl.showBorders = testCtrl.borderOptions[0];

	// Query the user is searching for.
	testCtrl.currentQuery = "";
	testCtrl.geoCoords = [];
	testCtrl.allOrgUnits = [];
	testCtrl.sortOnPosition = false;
    testCtrl.currentLat = 0;
    testCtrl.currentLng = 0;
    testCtrl.locationLock = false;
    init();
	// URL for orgunits-API
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?pageSize=1332";

	// Tweaked URL to include coordinates (if applicable) for the facility.
	// Not all facilities have coordinates. Figure out how to correctly represent those we can.
	//var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level&pageSize=1332";
    function init(){
    	var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits.json?fields=:identifiable,coordinates,level,shortName,parent&pageSize=2000";

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

            console.log(testCtrl.allOrgUnits);
    	}).
    	error(function(data, status, headers, config) {
    		alert("Error. Data: " + data);
    	});
    }

	// Changes the color of the markers related to the clicked orgUnit/facility.
	$scope.updateMap = function(orgUnit) {
		if(orgUnit.coordinates) {
			if(orgUnit.level == 4) {
				updateMarker(orgUnit);
			} else if(orgUnit.level > 1) {
				// Toggles whether the actual polygons will show or not.
				if(testCtrl.showBorders.level < 0) {
					orgUnit.polyPath.setVisible(!orgUnit.polyPath.getVisible());
				} else {
					toggleHighlight(orgUnit);
				}
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
					orgUnit.name.toLowerCase().indexOf(testCtrl.currentQuery.toLowerCase()) != -1);
		}
	}

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

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(location_found);
		} else {
			alert("Geolocation not supported:(");
			x.innerHTML = "Geolocation is not supported by this browser.";
		}
	}

    // Updates current position (lat and long) after where the mouse-pointer is over the map.
    $scope.trackPosition = function() {
        // Disable borders.
        //testCtrl.showBorders = testCtrl.borderOptions[0];
        
        if(testCtrl.locationLock == false) {
            testCtrl.currentLat = mousePosition.position.lat();
            testCtrl.currentLng = mousePosition.position.lng();
        }
    }

    // Locks or unlocks (disable/enable) position-tracking.
    $scope.lockPosition = function() {
        testCtrl.locationLock = !testCtrl.locationLock;
    }

    // Clears borders to enable position tracking (doesnt work with overlays).
    $scope.clearBorders = function() {
        testCtrl.showBorders = testCtrl.borderOptions[0];
    }

	/**
	 * Sets if we want to sort orgunits based on closest to my position.
	 * Calls methods set_location and remove_location from map.js
	 * Remove comments to use real positions instead of the fixed position
	 */
	function location_found(position) {
		if(testCtrl.sortOnPosition === false){
			testCtrl.sortOnPosition = true;
			set_location(position); // calls method from map.js and set my location on the map
		}else {
			testCtrl.sortOnPosition = false;
			remove_location(position); // Removes marker from map
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
            //Refreshes the data from db with the newly updated unit
            init(); 
		}).error(function(data, status) {
			alert("Update error");
		});

	};

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

        // Release location-lock
        testCtrl.locationLock = false;

		// Debug
		console.log(unit);

        var coords = "[" + testCtrl.currentLng + "," + testCtrl.currentLat + "]";

		var post_data = {
				"name":unit.name,
				"shortName":unit.shortName,
                "level": unit.level,
                "coordinates": coords,
                //"coordinates": [testCtrl.currentLng, testCtrl.currentLat],
                //"parent":unit.parent,
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
			
            console.log(data);

            // Disable loading animation
			$scope.unitAdded = false;
			alert("Create success");

             // Hide on success
            $("#create-unit-row").slideToggle();

            // Reset scope variable
            $scope.unit = undefined;

            //Refreshes the data from the server with the newly created unit
            init();

		}).error(function(data, status) {
			// Disable loading-animation
			$scope.unitAdded = false;
			alert("Create error :(");
			console.log("Create unit error:\n" + data);
		});
	};

    // Deletes a unit. We're not making this accessible for users, only for us to delete test-data faster.
    $scope.deleteUnit = function(unit) {
        var apiUrl = "http://inf5750-14.uio.no/api/organisationUnits/" + unit.id;

        var request = $http({
            method:"delete",
            url: apiUrl,
            headers: {
                'Authorization': 'Basic YWRtaW46ZGlzdHJpY3Q=',
                'Content-Type': 'application/json'
            },
        });

        request.success(function(data) {
            console.log("Delete success");
        }).error(function(data, status) {
            console.log("Delete error: " + data);
        });
    }

    // When 'borderOptions' changes, show the applicable borders.
    $scope.$watch('testCtrl.showBorders',function() {
	   toggleBorders(testCtrl.allOrgUnits,testCtrl.showBorders.level);
	});

}]);

//Directive that allows us to dynamically change the input url.
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

