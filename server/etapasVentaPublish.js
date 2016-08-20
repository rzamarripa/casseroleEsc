Meteor.publish("etapasVenta", function(options){
	return EtapasVenta.find(options,{sort:{orden:1}});
});

Meteor.publish("etapaVenta", function(options){
	var etapa = EtapasVenta.find(options);	
	return etapa;
});