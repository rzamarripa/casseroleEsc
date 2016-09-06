Meteor.publish("tipoPublicidad", function(options){
	return TipoPublicidad.find(options);
});