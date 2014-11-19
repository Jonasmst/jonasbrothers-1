
$(document).ready(function() {

	$("#create-unit-row").hide();

	// Add onClick for Create Unit button.
	$("#add-new-btn").click(function() {
		// Shows panel for creating new unit.
		$("#create-unit-row").slideToggle();
	});

	// Hides container on cancel button onClick
	$("#create-unit-cancel-btn").click(function() {
		$("#create-unit-row").slideToggle();
	});


});
