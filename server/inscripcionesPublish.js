Meteor.publish("inscripciones", function(options){
	return Inscripciones.find(options);
});

/*
Meteor.publish("buscarInscripciones",function(options){
	console.log(options)
	if(options.where.nombreCompleto.length > 3){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	"profile.seccion_id": options.where.seccion_id,
	  	roles : ["alumno"]
		}

		var alumnos = Meteor.users.find(selector, options.options).fetch();
		var alumnos_ids = _.pluck(alumnos, "_id");
		if(alumnos != undefined){
			return Inscripciones.find({alumno_id : { $in : alumnos_ids }});
		}
	}
});
*/