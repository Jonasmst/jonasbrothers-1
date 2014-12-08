//Implementation using Google Maps API.

$(document).ready(initialize);
var map;
var blueMarker;
var redMarker;
var markers;
var infowindow;
var closestMarker;
var myPosition = new google.maps.Marker({
	position: new google.maps.LatLng(8.269720, -12.483215), // temporary position
	map: map,
	title: "My location",
	icon: redMarker,
});
var mousePosition = new google.maps.Marker({
	position: new google.maps.LatLng(8.2, -12.4),
	map: map,
})

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

	// Setting listener for myPosition-listening.
	google.maps.event.addListener(map, 'mousemove', function(event) {
        mousePosition.setPosition(event.latLng);
	});
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
				infowindow.setContent("<div class='info'><h4>" + coordinates[i][0] + "</h4>Facility</div>");
				infowindow.open(map, marker);
			}
		})(marker, i));
	}
}

//Updates the marker of a single facility.
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
			infowindow.setContent("<div class='info'><h4>"+orgUnit.name+"</h4>" + contentString + "</div>");
			infowindow.setOptions({maxWidth: 320});
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
function set_location(position) {
	//var latitude = position.coords.latitude;
	//var longitude = position.coords.longitude;
	//myPosition.position = new google.maps.LatLng(latitude, longitude);

	myPosition.setMap(map);
	myPosition.setIcon(redMarker);
	myPosition.setVisible(true);
	// set different marker for closest facility
	closestMarker = markers[0];
	var closestDist = get_Distance(myPosition.position.lat(), myPosition.position.lng(), markers[0].position.lat(), markers[0].position.lng());
	// check for all units
	for(i = 0; i < markers.length; i++){
		var tmp = get_Distance(myPosition.position.lat(), myPosition.position.lng(), markers[i].position.lat(), markers[i].position.lng());
		if(tmp < closestDist){
			closestDist = tmp;
			closestMarker = markers[i];
		}
	}
	closestMarker.setIcon(redMarker);
	// Add circle overlay and bind to marker
	var circle = new google.maps.Circle({
	  map: map,
	  radius: closestDist * 1000 + 1,
	  fillColor: '#AA0000',
	  strokeWeight: 0.0,
	});
	circle.bindTo('center', myPosition, 'position');
}

//Finds shortest path using great-circle between two points.
//lat1, lon1: latitude and longitude for 'my position'
//lat2, lon2: latitude and longitude for unit position
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

//removes marker
function remove_location(){
	closestMarker.setIcon(blueMarker);
	myPosition.setVisible(false);
}


google.maps.event.addDomListener(window, 'load', initialize);