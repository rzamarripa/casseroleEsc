Meteor.publish("inscripciones", function(options){
	console.log(options)
	return Inscripciones.find(options);
});