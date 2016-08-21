Meteor.publish("mensajesVendedores", function(params){
	return MensajesVendedores.find(params);
});