Meteor.publish("inscripciones", function(options){
	console.log(options)
	return Inscripciones.find(options);
});

Meteor.publish("pagosPendientes", function(options){
	return PlanPagos.find(options);
});
