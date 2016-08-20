Meteor.publish("conceptosComision", function(options){
	return ConceptosComision.find(options);
});