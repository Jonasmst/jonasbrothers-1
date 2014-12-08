
$(document).ready(function() {

	// Hides the Create Unit-element
	$("#create-unit-row").hide();

	// Add onClick for Create Unit button.
	$("#add-new-btn").click(function() {
		// Shows panel for creating new unit.
		$("#create-unit-row").slideToggle();
	});

});

// Listener for cancel-button, applying the following code when the cancel-button is added to the DOM.
$(document).arrive("#create-unit-cancel-btn", function() {
	// Hides the Create Unit-element on click.
	$("#create-unit-cancel-btn").click(function() {
		$("#create-unit-row").slideToggle();
	});
});
