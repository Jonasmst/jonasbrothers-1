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

	for (i = 0; i < coordinates.length; i++) { 
		// Create and add a new marker per coordinate.
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(coordinates[i][1][1], coordinates[i][1][0]),
			map: map,
			title: coordinates[i][0],
			icon: blueMarker,
			current: false,
		});

		markers.push(marker);

		// Add a listener to each marker, so that they will display the name of the facility when clicked.
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infowindow.setContent("<h4>Facility</h4>"+coordinates[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
	}
}

// Updates the marker of a single facility.
function updateMarker(orgUnit) {
	for(var i = 0; i < markers.length; i++) {
		if(markers[i].getTitle() == orgUnit.name) {
			if(markers[i].current == false){
				markers[i].setIcon();
				markers[i].setMap(map);
				markers[i].current = true;
			} else {
				markers[i].setIcon(blueMarker);
				markers[i].setMap(map);
				markers[i].current = false;
			}
			break;
		}
	}
}

function createPolygon(orgUnit) {

	// Splits the coordinate string into neat pairs of lat/lng.
	var coords = orgUnit.coordinates.substring(3,orgUnit.coordinates.length-4).split("],");
	// The boundaries of the polygon to be made.
	var bounds = new google.maps.LatLngBounds();
	// Path of the polygon object. 
	var orgPath = [];
	// The polygon object.
	var polygon;
	// Default color is red.
	var polyColor = '#FF6969';
	// Positional object.
	var lngObject = "";
	// The string to be contained in the infowindow.
	var contentString = "Organisation Unit";
	// InfoWindow to bind to the polygons.
	infowindow = new google.maps.InfoWindow();
	// Indicates whether the current orgunit is highlighted.
	orgUnit.highlighted = false;
	
	// Extracts the coordinates.
	for(var i = 0; i < coords.length; i++) {
		coords[i] = coords[i].split(",");
		
		coords[i][0] = coords[i][0].substring(1,coords[i][0].length);
		
		// Coordinates at the beginning and may have "]]" or "[[" artifacts.
		if(coords[i][1].substring(coords[i][1].length-1) == "]") {
			coords[i][1] = coords[i][1].substring(0,coords[i][1].length-2);
		} else if(coords[i][0].substring(0,1) == "[") {
			coords[i][0] = coords[i][0].substring(2,coords[i][0].length);
		}
		
		var lngObject = new google.maps.LatLng(coords[i][1],coords[i][0]);
		
		lngObject = new google.maps.LatLng(coords[i][1],coords[i][0]);
		bounds.extend(lngObject);
		orgPath.push(lngObject);
	
	}

	if(orgUnit.level == 2) {
		// District, use a different color.
		polyColor = '#009ACD';
		contentString = "District";
	}

	// Draw polygon object.
	polygon = new google.maps.Polygon({
		paths: orgPath, 
		strokeColor: polyColor,
		strokeOpacity: 0.8,
		strokeWeight: 1,
		fillColor: polyColor,
		fillOpacity: 0.25,
	})
	
	// Makes the polygon clickable.
	google.maps.event.addListener(polygon, 'click', (function(polygon, i) {
		return function() {
			infowindow.setContent("<h4>"+contentString+"</h4>" + orgUnit.name);
			infowindow.setPosition(bounds.getCenter());
			infowindow.open(map);	
			toggleHighlight(orgUnit);
		}
	})(polygon, i));
	
	// Auto-hide the polygon.
	orgUnit.polyPath = polygon;
	orgUnit.polyPath.setMap(map);		
	orgUnit.polyPath.setVisible(false);
}

// Toggles whether the polygon is highlighted or not on the map.
function toggleHighlight(orgUnit) {
	if(!orgUnit.highlighted) {
		orgUnit.polyPath.setOptions({strokeWeight: 3.5, fillOpacity: 0.0});
		orgUnit.highlighted = true;
	} else {
		orgUnit.polyPath.setOptions({strokeWeight: 1.0, fillOpacity: 0.25	});
		orgUnit.highlighted = false;
	}
}

// Toggles polygon visibility for districts/organisation units.
function toggleBorders(orgUnits, level) {
	for(i in orgUnits) {
		if(orgUnits[i].polyPath) {
			if(level == -1) {
				orgUnits[i].polyPath.setVisible(false);
			} else if(level == 0) {
				orgUnits[i].polyPath.setVisible(true);
			} 
			if(orgUnits[i].level == level && (level == 2 || level == 3)){
				orgUnits[i].polyPath.setVisible(true);	
			} else if(level == 2 || level == 3){
				orgUnits[i].polyPath.setVisible(false);	
			}
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


//Sets 'my location'. 
function set_location(myPosition) {
	alert("SET " + myPosition.title);
	myPosition.setIcon();
	markers.push(myPosition);
	showMarkers();
}

// removes marker
function remove_location(myPosition){
	alert("Remove " + myPosition.title);
	markers.splice(myPosition);
	showMarkers();
}


google.maps.event.addDomListener(window, 'load', initialize);