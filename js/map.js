//Implementation using Google Maps API.

$(document).ready(initialize);
var map;
var blueMarker;
var redMarker;
var markers;
var infowindow;

//Initializes the map.
function initialize() {

	// Initial options. Centers on Sierra Leone.
	var mapOptions = {
			center: { lat: 8.4494988, lng: -11.7868289},
			zoom: 8
	};
	// Creates the map.
	map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);
}

//Adds markers (from the coordinates array passed to this function) to the map.
function addMarkers(coordinates) {

	// Markers will be added dynamically.
	var marker;
	markers = [];

	// InfoWindow to bind to the markers.
	infowindow = new google.maps.InfoWindow();

	// Custom image for the markers.
	blueMarker = 'img/measle_blue.png';
	redMarker = 'img/measle_red.png';

	var customImage = 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png';

	//alert("We in business now, boys.");

	for (i = 0; i < coordinates.length; i++) { 
		// Create and add a new marker per coordinate.
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(coordinates[i][1][1], coordinates[i][1][0]),
			map: map,
			title: coordinates[i][0],
			icon: blueMarker,
			used: false,
		});

		markers.push(marker);

		// Add a listener to each marker, so that they will display the name of the facility when clicked.
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infowindow.setContent(coordinates[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
	}
}
//Shows all current markers.
function showMarkers() {
	for(var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

//Updates one or more markers on the map.
function updateMarkers(orgUnit) {

	//alert(orgUnit.coordinates[0]);
	if(orgUnit.level == 4) {
		for(var i = 0; i < markers.length; i++) {
			if(markers[i].getTitle() == orgUnit.name)
				if(markers[i].used == false){
					markers[i].setIcon();
					markers[i].used = true;
				} else {
					markers[i].setIcon(blueMarker);
					markers[i].used = false;
				}
		}
		showMarkers();
	}
}

function createPolygon(orgUnit) {

	// Splits the coordinate string into neat pairs of lat/lng.
	var coords = orgUnit.coordinates.substring(3,orgUnit.coordinates.length-4).split("],");

	// Path of the polygon object. 
	var orgPath = [];
	// The polygon object.
	var polygon;
	// Default color is red.
	var polyColor = '#FF0000';
	// Positional object.
	var lngObject = "";
	// InfoWindow to bind to the polygons.
	infowindow = new google.maps.InfoWindow();

	// Extracts the coordinates.
	for(var i = 0; i < coords.length; i++) {
		coords[i] = coords[i].split(",");
		coords[i][0] = coords[i][0].substring(1,coords[i][0].length);
		var lngObject = new google.maps.LatLng(coords[i][1],coords[i][0]);

		lngObject = new google.maps.LatLng(coords[i][1],coords[i][0]);
		orgPath.push(lngObject);
	}

	if(orgUnit.level == 2) {
		// Organisation Unit Group, use a different color.
		polyColor = '#009ACD';
	}

	// Draw polygon object.
	polygon = new google.maps.Polygon({
		paths: orgPath, 
		strokeColor: polyColor,
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: polyColor,
		fillOpacity: 0.25
	})
	/* Currently not working properly. Do we want info when orgUnits are clicked?.
	google.maps.event.addListener(polygon, 'mouseover', (function(polygon, i) {
		return function() {
			infowindow.setContent(orgUnit.name);
			infowindow.open(map, polygon);
		}
	})(polygon, i));
	*/
	// Auto-hide the polygon.
	orgUnit.polyPath = polygon;
	orgUnit.polyPath.setMap(map);		
	orgUnit.polyPath.setVisible(false);
}

//Activates all borders for the orgUnits of a certain level.
function toggleBorders(orgUnits, level) {
	
	if(level == -1) {
		// Make all polygons invisible.
		for(i in orgUnits) {
			if(orgUnits[i].level == 2 || orgUnits[i].level == 3)
				orgUnits[i].polyPath.setVisible(false);
		}
	} else if(level == 0) {
		// Make all polygons visible.
		for(i in orgUnits) {
			if(orgUnits[i].level == 2 || orgUnits[i].level == 3)
				orgUnits[i].polyPath.setVisible(true);
		}
	} else {
		// Make polygons for a specified level visible.
		for(i in orgUnits) {
			if(orgUnits[i].level == level)
				orgUnits[i].polyPath.setVisible(!orgUnits[i].polyPath.getVisible());
		}
	}
}

function contains(poly, unit){
	for(var i = 0; i < poly.length; i++){
		if(poly[i] === unit){
			return true;
		}
	}
	return true;
}
//Finds users location and the 3 nearest facilities
function getClosestFacilitys(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(location_found);
	} else {
		alert("Geolocation not supported:(");
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

//Call this function when you've succesfully obtained the location. 
function location_found(position) {
	//var latitude = position.coords.latitude;
	//var longitude = position.coords.longitude;

	//Using fix coordinates to make it more realistisc
	var latitude = 8.269720;
	var longitude = -12.483215;


	marker = new google.maps.Marker({
		position: new google.maps.LatLng(latitude, longitude),
		map: map,
		title: "My location",
		icon: blueMarker,
		used: false,
	});
	markers.push(marker);

	if(marker.used == false){
		marker.setIcon();
		marker.used = true;
	} else {
		marker.setIcon(blueMarker);
		marker.used = false;
	}
	alert("latitude: " + latitude + "\nlongitude: " + longitude + "\nFixed coordinates");
}



google.maps.event.addDomListener(window, 'load', initialize);