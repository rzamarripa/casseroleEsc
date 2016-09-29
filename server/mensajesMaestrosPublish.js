Meteor.publish("mensajesMaestros", function(params){
	return MensajesMaestros.find(params);
});