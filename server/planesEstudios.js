Meteor.publish("planesEstudios", function(options){
	return PlanesEstudios.find(options);
});