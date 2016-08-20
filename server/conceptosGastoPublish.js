Meteor.publish("conceptosGasto", function(options){
	return ConceptosGasto.find(options);
});