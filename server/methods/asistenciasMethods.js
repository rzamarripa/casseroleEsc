Meteor.methods({
  getAlumnosGrupo : function (query) {
    query = query || {};
    var maestro = Maestros.findOne({nombreUsuario:Meteor.user().username});
    var inscripciones = Inscripciones.find(query).fetch();
    var alumnos = [];
    inscripciones.forEach(function(inscripcion){
      var alumno = Alumnos.findOne({_id:inscripcion.alumno_id});
      alumnos.push({_id:alumno._id, 
	      						matricula:alumno.matricula, 
	      						nombre:alumno.nombre, 
	      						apPaterno:alumno.apPaterno, 
	      						apMaterno:alumno.apMaterno, 
	      						checked:true});
    });
    return alumnos;
  },
  setAsistencia : function (asistencia) {
	  var maestro = Maestros.findOne({nombreUsuario:Meteor.user().username});
	  asistencia.maestro_id = maestro._id; 
	  Asistencias.insert(asistencia);
	  return true;
  },
  getAsistencias : function (grupo_id, materia_id){
	  return Asistencias.find({grupo_id:grupo_id, materia_id: materia_id},{sort:{fechaAsistencia:1}}).fetch();
  },
  getAsistencia : function (options){
	  return Asistencias.find(options).fetch();
  },
  tomarAsistencia : function (asistencia){
	  
	  _.each(asistencia, function(alumnoActual){
		  if(alumnoActual.profile.estatus == 1 && alumnoActual.estatus != 0){
			  var cantAsistencias = Asistencias.find({alumno_id : alumnoActual.alumno_id, grupo_id : alumnoActual.grupo_id, estatus : {$gte : 1}}).count();
			  if(cantAsistencias == 0){
				  Meteor.users.update({_id : alumnoActual.alumno_id}, {$set : {"profile.estatus" : 2}});
			  }
		  }
		  
		  delete alumnoActual.profile;
		  delete alumnoActual._id;
		  Asistencias.insert(alumnoActual);
	  });
	  return "listo";
  },
  actualizarAsistencia : function(asistencia){
	  
	  _.each(asistencia, function(alumnoActual){
		  ////console.log("analizando el update", alumnoActual.alumno_id, alumnoActual.profile.estatus, alumnoActual.estatus)

		  delete alumnoActual.$$hashKey;
		  var cantAsistencias = Asistencias.find({alumno_id : alumnoActual.alumno_id, grupo_id : alumnoActual.grupo_id}).count();
		  if(cantAsistencias <= 1){
			  if(cantAsistencias == 0  && alumnoActual.estatus > 0){
				  Meteor.users.update({_id : alumnoActual.alumno_id}, {$set : {"profile.estatus" : 2}});
			  }else if(cantAsistencias == 1 && alumnoActual.estatus == 0){
				  Meteor.users.update({_id : alumnoActual.alumno_id}, {$set : {"profile.estatus" : 1}});
			  }else if(cantAsistencias == 1 && alumnoActual.estatus > 0){
				  Meteor.users.update({_id : alumnoActual.alumno_id}, {$set : {"profile.estatus" : 2}});
			  }
		  }
			
		  delete alumnoActual.profile;
		  if(alumnoActual._id != undefined){
			  //console.log("act", alumnoActual.alumno_id)
			  Asistencias.update({_id : alumnoActual._id}, { $set : { estatus : alumnoActual.estatus, fechaActualizacionAsistencia : alumnoActual.fechaActualizacionAsistencia}});
		  }else{
			  //console.log("nu", alumnoActual.alumno_id);
			  Asistencias.insert(alumnoActual);
		  }
		  

	  });
	  return "listo";
  }
});