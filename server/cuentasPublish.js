Meteor.publish("cuentas", function(options){
	return Cuentas.find(options);
});