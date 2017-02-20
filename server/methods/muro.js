Meteor.methods({
	solicitarAmistad : function(remitente, destinatario){
		var dest = Meteor.users.findOne(destinatario);
		var rem = Meteor.users.findOne(remitente);
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
			ActividadesMuro.insert({alumno_id : destinatario, actividad : rem.profile.nombreCompleto + " quiere ser tu amig" + (rem.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
			Meteor.users.update({_id : remitente}, { $push : { "profile.solicitudesHechas" : {estatus : 0, alumno_id : destinatario, fechaSolicitud : new Date()}}});
			ActividadesMuro.insert({alumno_id : remitente, actividad : dest.profile.nombreCompleto + " quiere ser tu amig" + (dest.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
			return 0;
		}else{
			return 1;
		}
	},
  aceptarSolicitud: function (solicitud, yo) {
		var solicitado = Meteor.users.findOne({_id : solicitud.alumno_id});
		var yo = Meteor.users.findOne({_id : yo});
		Meteor.users.update({_id : solicitud.alumno_id}, { $push : { "profile.friends" : {alumno_id : yo._id, fechaAmistad : new Date(), estatus : 1}}});		
		Meteor.users.update({_id : solicitud.alumno_id, "profile.solicitudesHechas.alumno_id" : yo._id}, {$set : {"profile.solicitudesHechas.$.estatus" : 1}});
		Meteor.users.update({_id : yo._id}, { $push : { "profile.friends" : {alumno_id : solicitud.alumno_id, fechaAmistad : new Date(), estatus : 1}}});
		Meteor.users.update({_id : yo._id, "profile.solicitudesRecibidas.alumno_id" : solicitud.alumno_id}, {$set : {"profile.solicitudesRecibidas.$.estatus" : 1}});
		ActividadesMuro.insert({alumno_id : solicitado._id, actividad : "Ahora " + yo.profile.nombreCompleto + " es tu amig" + (yo.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
		ActividadesMuro.insert({alumno_id : yo._id, actividad : "Ahora " + solicitado.profile.nombreCompleto + " es tu amig" + (solicitado.profile.sexo == "femenino") ? 'a' : 'o', fechaCreacion : new Date()});
		return 1;
	},
  reportarPost: function (post_id, alumno_id) {
		PostsReportados.insert({post_id : post_id, alumno_id : alumno_id, estatus : 0, fechaCreacion : new Date()});
		return true;
	},
	buscarEnMuro : function(nombreCompleto){
		if(nombreCompleto.length > 3){
			let selector = {
				"profile.nombreCompleto": { '$regex' : '.*' + nombreCompleto || '' + '.*', '$options' : 'i' },
				roles : ["alumno"]
			}
			
			var alumnos 				= Meteor.users.find(selector).fetch();
			_.each(alumnos, function(alumno){

				alumno.profile.seccion = Secciones.findOne({_id : alumno.profile.seccion_id});
				if(alumno.profile.solicitudesRecibidas.length > 0){
					_.each(alumno.profile.solicitudesRecibidas, function(solicitud){
						/*
							estatus = 0 Solicitado
							estatus = 1 Aceptado
							
							tipoRelacion = 0 Solicitad
							tipoRelacion = 1 Amigo
						*/
						if(solicitud.alumno_id == Meteor.userId() && solicitud.estatus == 0){
							alumno.profile.tipoRelacion = 1;
						}else if(solicitud.alumno_id == Meteor.userId() && solicitud.estatus == 1){
							alumno.profile.tipoRelacion = 2;
						}else{
							alumno.profile.tipoRelacion = 0;
						}
					})
					
					_.each(alumno.profile.solicitudesHechas, function(solicitud){
						/*
							estatus = 0 Solicitado
							estatus = 1 Aceptado
							
							tipoRelacion = 0 Solicitad
							tipoRelacion = 1 Amigo
						*/
						if(solicitud.alumno_id == Meteor.userId() && solicitud.estatus == 0){
							alumno.profile.tipoRelacion = 1;
						}else if(solicitud.alumno_id == Meteor.userId() && solicitud.estatus == 1){
							alumno.profile.tipoRelacion = 2;
						}else{
							alumno.profile.tipoRelacion = 0;
						}
					})
				}else{
					alumno.profile.tipoRelacion = 0;
				}
				
			})
			return alumnos;
		}
	}
});
/*
1.- cambiar el estatus de la solicitud hecha
2.- cambiar el estatus de la solicitud recibida
3.- insertar el amigo en ambos
4.- registrar las actividades


db.students.update(
   { _id: 4, "grades.grade": 85 },
   { $set: { "grades.$.std" : 6 } }
)
*/