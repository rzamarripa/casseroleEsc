Meteor.publish("generaciones", function(options){
	return Generaciones.find(options);
});