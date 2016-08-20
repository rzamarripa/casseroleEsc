Meteor.publish("planeaciones", function(options){
	return Planeaciones.find(options);
});