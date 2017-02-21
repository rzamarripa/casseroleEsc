Meteor.methods({
	calificar : function(calificacion){
		Calificaciones.insert(calificacion);
	  _.each(calificacion.alumnos, function(alumno){
		  var curricula = Curriculas.findOne({alumno_id : alumno._id});		  
		  _.each(curricula.grados, function(grado){
			  _.each(grado, function(materia){
				  if(materia.materia._id == calificacion.materia_id){
					  materia.calificacion = parseInt(alumno.calificacion);
					  materia.estatus = 1;
					  materia.fechaCreacion = new Date();
					  materia.maestro_id = calificacion.maestro_id;
					  materia.grupo_id = calificacion.grupo_id;
					  if(materia.calificacion >= 6){
						  materia.aprobado = true;
					  }else if(materia.calificacion <=5){
						  materia.aprobado = false;
						  
						  var estaReprobado = Reprobados.findOne({alumno_id : alumno._id, materia_id : calificacion.materia_id});
						  if(estaReprobado){
							  Reprobados.update({
								  alumno_id : alumno._id,
								  materia_id : calificacion.materia_id								  
							  }, {$set : {
								  maestro_id : calificacion.maestro_id,
								  grupo_id : calificacion.grupo_id,
								  calificacion : materia.calificacion,
								  estatus : true
								}});
						  }else{
							  Reprobados.insert({
								  alumno_id : alumno._id,
								  materia_id : calificacion.materia_id,
								  maestro_id : calificacion.maestro_id,
								  grupo_id : calificacion.grupo_id,
								  calificacion : materia.calificacion,
								  fechaCreacion : new Date(),
								  seccion_id : calificacion.seccion_id,
								  campus_id : calificacion.campus_id,
								  estatus : true
							  })
						  }
					  }
				  }
			  })
		  })
		  var idTemp = curricula._id;
		  delete curricula._id;
		  Curriculas.update({_id : idTemp}, { $set : curricula})
	  })
	  
	  return true;
	},
	actualizarCalificacion : function(calificacion){
		var tempId = calificacion._id;
	  delete calificacion._id;
	  calificacion.fechaActualizacionAsistencia = new Date();
	  Calificaciones.update({_id : tempId}, { $set : calificacion });
	  _.each(calificacion.alumnos, function(alumno){
		  var curricula = Curriculas.findOne({alumno_id : alumno._id});		  
		  _.each(curricula.grados, function(grado){
			  _.each(grado, function(materia){
				  if(materia.materia._id == calificacion.materia_id){
					  materia.calificacion = parseInt(alumno.calificacion);
					  materia.estatus = 1;
					  materia.fechaCreacion = new Date();
					  materia.maestro_id = calificacion.maestro_id;
					  materia.grupo_id = calificacion.grupo_id;
					  if(materia.calificacion >= 6){
						  materia.aprobado = true;
						  var estaReprobado = Reprobados.findOne({alumno_id : alumno._id, materia_id : calificacion.materia_id});
						  if(estaReprobado){
							  Reprobados.update({alumno_id : alumno._id, materia_id : calificacion.materia_id}, {$set : {estatus : false}})
						  }
					  }else if(materia.calificacion <=5){
						  materia.aprobado = false;
						  
						  var estaReprobado = Reprobados.findOne({alumno_id : alumno._id, materia_id : calificacion.materia_id});
						  if(estaReprobado != undefined){
							  Reprobados.update({
								  alumno_id : alumno._id,
								  materia_id : calificacion.materia_id								  
							  }, {$set : {
								  maestro_id : calificacion.maestro_id,
								  grupo_id : calificacion.grupo_id,
								  calificacion : materia.calificacion,
								  estatus : true
								}});
						  }else{
							  Reprobados.insert({
								  alumno_id : alumno._id,
								  materia_id : calificacion.materia_id,
								  maestro_id : calificacion.maestro_id,
								  grupo_id : calificacion.grupo_id,
								  calificacion : materia.calificacion,
								  fechaCreacion : new Date(),
								  seccion_id : calificacion.seccion_id,
								  cmapus_id : calificacion.campus_id,
								  estatus : true
							  })
						  }
					  }
				  }
			  })
		  })
		  var idTemp = curricula._id;
		  delete curricula._id;
		  Curriculas.update({_id : idTemp}, { $set : curricula})
	  })
	  
	  return true;
	}
})