Meteor.publish("pagoVacaciones", function(params){
	return PagoVacaciones.find(params);
});