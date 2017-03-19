Meteor.methods({
	calificar : function(calificacion){
		
	  _.each(calificacion.alumnos, function(alumno){
		  alumno.tipo = "Ordinario";
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
	  Calificaciones.insert(calificacion);
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
	},
	calificarCoordinacion : function(curricula){
		console.log(curricula);
		_.each(curricula.grados, function(grado){
			_.each(grado, function(materia){
				if(materia.calificacion != undefined && materia.calificacion >= 0 && materia.calificacion <= 10){
					materia.estatus = 1;
					materia.fechaCreacion = new Date();
					if(materia.calificacion >= 7){
						materia.aprobado = true;
						var estaReprobado = Reprobados.findOne({alumno_id : curricula.alumno_id, materia_id : materia.materia._id});
						if(estaReprobado){
						  Reprobados.update({alumno_id : curricula.alumno_id, materia_id : materia.materia._id}, {$set : {estatus : false}})
					  }
					}else{
						materia.aprobado = false;
						
						var estaReprobado = Reprobados.findOne({alumno_id : curricula.alumno_id, materia_id : materia.materia._id});
						
						//Insertar o modificar
					  if(estaReprobado != undefined){
						  Reprobados.update({
							  alumno_id : curricula.alumno_id,
							  materia_id : materia.materia._id								  
						  }, {$set : {
							  calificacion : materia.calificacion,
							  estatus : true
							}});
					  }else{
						  Reprobados.insert({
							  alumno_id : curricula.alumno_id,
							  materia_id : materia.materia._id,
							  calificacion : materia.calificacion,
							  fechaCreacion : new Date(),
							  seccion_id : materia.materia.seccion_id,
							  cmapus_id : materia.materia.campus_id,
							  estatus : true
						  })
					  }
					}
				}				
			})
		})
		console.log(curricula);
		var idTemp = curricula._id;
		delete curricula._id;
		Curriculas.update({_id : idTemp}, { $set : curricula});
		
		return true;
	},
	mostrarListadoAlumnosCalificaciones : function(parametros){
		var calificaciones = Calificaciones.findOne({grupo_id : parametros.grupo_id, materia_id : parametros.materia_id, maestro_id : parametros.maestro_id})
		var grupo = Grupos.findOne({_id : parametros.grupo_id});
		
		var resultado = {};
			
		if(calificaciones && calificaciones.alumnos.length > 0){
			existe = true;
			resultado = calificaciones;
			
			var alumnosCalificados = _.pluck(calificaciones.alumnos, "_id");
			var alumnosGrupo = _.pluck(grupo.alumnos, "alumno_id");
			
			var alumnosNuevos = _.difference(alumnosGrupo, alumnosCalificados);
			
			if(alumnosNuevos.length > 0){
				_.each(alumnosNuevos, function(alumno_id){
			
					var alu = Meteor.users.findOne({_id : alumno_id})
			
					calificaciones.alumnos.push(alu)
			
				})
				return resultado;
			}
				
		}else{
			
			var alumnosGrupo = _.pluck(grupo.alumnos, "alumno_id");
			resultado.alumnos = Meteor.users.find({_id : { $in : alumnosGrupo}},{ fields : { 
													"profile.nombreCompleto" : 1,
													"profile.matricula" : 1,
													"profile.fotografia" : 1,
													"profile.sexo" : 1,
													_id : 1
											}}).fetch();
		}
		
		return resultado;
	} 
})



