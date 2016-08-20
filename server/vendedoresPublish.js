Meteor.publish("vendedores", function(){
	return Roles.getUsersInRole( ['vendedor','gerenteVenta']);
});