Meteor.publish("gerentesVenta", function(){
	return Roles.getUsersInRole( 'gerenteVenta');
});

Meteor.publish("usuarios", function(options){
	return  Meteor.users.find(options);
});

Meteor.publish("coordinadores", function(){
	return Roles.getUsersInRole( ['coordinadorAcademico', 'coordinadorFinanciero'] );
});

Meteor.publish("usuariosMensajes", function(options){
	return  Roles.getUsersInRole(['coordinadorAcademico', 'coordinadorFinanciero', 'maestro', 'director']);
});

Meteor.publish("todosUsuarios", function(){
	return Roles.getUsersInRole(['coordinadorAcademico', 'coordinadorFinanciero', 'director']);
});