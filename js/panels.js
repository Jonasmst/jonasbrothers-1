$(document).ready(function() {

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


});