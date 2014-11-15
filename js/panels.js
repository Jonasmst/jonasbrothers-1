
// Listen to panels being added in index.html
$(document).arrive(".panel.panel-default", function() {
	var panel = $(this);
	var pheading = panel.find(".panel-heading");
	var pbody = panel.find(".panel-body");

	// Store headings color
	var headingColor = pheading.css("background");

	// Set onClick on heading
	pheading.click(function() {
		// Hide body on click
		pbody.slideToggle();
	});

	// Set onHover on heading
	pheading.hover(function() {
		// onHover
		pheading.css("cursor", "pointer"); // Update cursor to click-cursor instead of mouse-cursor.
		pheading.css("background", "rgba(0, 0, 0, 0.1)"); // Change bg-color for feedback
	}, function() {
		// onRelease
		pheading.css("background", headingColor); // Revert bg-color back to original.
	});

	// Hide body
	pbody.hide();

});


/* OLD CODE
//$(document).ready(function() {
//$("body").on('DOMNodeInserted', function(e) {

	var element = e.target;

	// Find every panel-body and hide() it
	$("body").find(".panel-body").hide();

	// Set oncliks on all headers
	$(".panel").each(function() {
		
		// Find its heading
		var heading = $(this).find(".panel-heading");
		// Find its body
		var body = $(this).find(".panel-body");

		// Store headings color
		var heading_color = heading.css("background");

		// Set onClick on heading
		heading.click(function() {
			// Hide body on click
			body.slideToggle();
		})

		// Set onHover on heading
		heading.hover(function() {
			// This happen on hover	
			heading.css("cursor", "pointer"); // Update cursor to click-cursor instead of mouse-cursor
			heading.css("background", "rgba(0, 0, 0, 0.1)"); // Change background color for feedback
		}, function() {
			// This happens after hover
			heading.css("background", heading_color); // Revert background color back to original.
		})
	});

	element.click(function() {
		alert("Heihei!");
	});


});
*/