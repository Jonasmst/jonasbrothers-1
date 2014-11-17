//Implementation using Google Maps API.

$(document).ready(initialize);
	var map;

// Initializes the map.
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

// Adds markers (from the coordinates array passed to this function) to the map.
function addMarkers(coordinates) {

	// Markers will be added dynamically.
	var marker;

	// InfoWindow to bind to the markers.
	var infowindow = new google.maps.InfoWindow();
	
	// Custom image for the markers.
	var customImage = 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png';

	//alert("We in business now, boys.");
	
	for (i = 0; i < coordinates.length; i++) { 
		// Create and add a new marker per coordinate.
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(coordinates[i][1][1], coordinates[i][1][0]),
			map: map,
			icon: customImage,
		});

		// Add a listener to each marker, so that they will display the name of the facility when clicked.
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infowindow.setContent(coordinates[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
	}

}
google.maps.event.addDomListener(window, 'load', initialize);