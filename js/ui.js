
$(document).ready(function() {

	// Hides the Create Unit-element
	$("#create-unit-row").hide();

	// Add onClick for Create Unit button.
	$("#add-new-btn").click(function() {
		// Shows panel for creating new unit.
		$("#create-unit-row").slideToggle();
	});

	// Hides container on cancel button onClick
	$("#create-unit-cancel-btn").click(function() {
		alert("cancel");
		$("#create-unit-row").slideToggle();
	});


});
