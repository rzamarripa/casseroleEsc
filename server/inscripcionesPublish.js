Meteor.publish("inscripciones", function(options){
	console.log(options)
	return Inscripciones.find(options);
});

Meteor.publish("buscarInscripciones",function(options){
	if(options.where.nombreCompleto.length > 0){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	"profile.seccion_id": options.where.seccion_id,
	  	roles : ["alumno"]
		}

		var alumno = Meteor.users.findOne(selector, options.options);
		return Inscripciones.find({alumno_id : alumno._id});
	}
});