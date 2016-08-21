Meteor.publish("buscarAlumnos",function(options){
	let selector = {
  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
  	"profile.seccion_id": options.where.seccion_id
	}	
	return Meteor.users.find(selector, options.options);
});

Meteor.publish("alumno",function(options){
  return Meteor.users.find(options.id);
});

Meteor.publish("alumnos",function(params){
	console.log(params)
  return Meteor.users.find(params);
});

Meteor.publish("buscarUsuario",function(options){
	if(options.where.nombreUsuario.length > 3){		
		return Meteor.users.find({username : options.where.nombreUsuario});
	}	
});