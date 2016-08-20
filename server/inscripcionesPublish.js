Meteor.publish("inscripciones", function(options){
	return Inscripciones.find(options);
});