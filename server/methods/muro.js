Meteor.methods({
	solicitarAmistad : function(remitente, destinatario){
		var dest = Meteor.users.findOne(destinatario);
		console.log(dest);
		var solicito = 0;
		_.each(dest.profile.solicitudesRecibidas, function(solicitud){
			console.log(solicitud);
			if(solicitud.alumno_id == remitente){
				//Ya solicitó
				solicito = 1;
			}
		})
		
		if(solicito == 0){
			Meteor.users.update({_id : destinatario}, { $push : { "profile.solicitudesRecibidas" : {estatus : 0, alumno_id : remitente, fechaSolicitud : new Date()}}});
			Meteor.users.update({_id : remitente}, { $push : { "profile.solicitudesHechas" : {estatus : 0, alumno_id : destinatario, fechaSolicitud : new Date()}}});
			return 0;
		}else{
			return 1;
		}
	},
  aceptarSolicitud: function (solicitud, yo) {
		var solicitado = Meteor.users.findOne({_id : solicitud.alumno_id});
		Meteor.users.update({_id : solicitud.alumnos_id}, { $push : { "profile.friends" : yo}});
		var yo = Meteor.users.findOne({_id : yo});
		Meteor.users.update({_id : yo._id}, { $push : { "profile.friends" : solicitud.alumno_id}});
		ActividadesMuro.insert({alumno_id : solicitado._id, actividad : "Ahora " + yo.profile.nombreCompleto + " es tu amig" + (yo.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
		ActividadesMuro.insert({alumno_id : yo._id, actividad : "Ahora " + solicitado.profile.nombreCompleto + " es tu amig" + (solicitado.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
		return 1;
	}
});