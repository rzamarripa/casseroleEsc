Meteor.publish("conceptosPago", function(options){
	return ConceptosPago.find(options);
});