Meteor.publish("gerentesVenta", function(){
	return Roles.getUsersInRole( 'gerenteVenta');
});

Meteor.publish("usuarios", function(options){
	console.log(options);
	return  Meteor.users.find(options);
});

Meteor.publish("coordinadores", function(){
	return Roles.getUsersInRole( ['coordinadorAcademico', 'coordinadorFinanciero'] );
});