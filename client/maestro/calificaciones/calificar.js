angular
.module("casserole")
.controller("CalificarCtrl", CalificarCtrl);
 function CalificarCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){

 	let rc = $reactive(this).attach($scope);
 	
 	this.hoy = new Date();
	this.alumnos_id = [];
	this.existe = false;
	this.seccion_id = "";
	this.grupo = {};
		
	this.subscribe('calificaciones', () => {		
		return [{
			grupo_id : $stateParams.grupo_id,
			materia_id : $stateParams.materia_id,
			maestro_id : $stateParams.maestro_id
		}]
	});
	
	this.subscribe('curriculas', () => {		
		return [{
			planEstudios_id : this.getReactively("grupo.planEstudios_id")
		}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : $stateParams.grupo_id
		}]
	});
	
	this.subscribe('secciones', () => {
		console.log(this.getReactively("seccion_id"));
		return [{
			_id : this.getReactively("seccion_id")
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : Meteor.user().profile.maestro_id
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			_id : $stateParams.materia_id
		}]
	});

	this.subscribe('inscripciones', () => {		
		return [{
			grupo_id : $stateParams.grupo_id, estatus : 1
		}]
	});

	this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});

	this.subscribe('maestrosMateriasGrupos', () => {
		return [{
			grupo_id: $stateParams.grupo_id
		}]
	});

	this.helpers({		
		grupo : () => {
			
			return Grupos.findOne($stateParams.grupo_id);
		},
		maestro : () => {
			return Maestros.findOne($stateParams.maestro_id);
		},
		materia : () => {
			return Materias.findOne($stateParams.materia_id);
		},
		alumnosGrupo : () => {
			var grupo = Grupos.findOne($stateParams.grupo_id);
			rc.alumnos_id = _.pluck(grupo.alumnos, "alumno_id");
			this.seccion_id = this.getReactively("grupo.seccion_id");
			return Meteor.users.find({roles : ["alumno"]}).fetch();
		},
		sePuede : () => {
			var seccion = Secciones.findOne();
			if(seccion)
				return seccion.abrirCalificaciones;
		},
		alumnos : () => {
			if(this.alumnosGrupo){
				var alumnos = [];
				_.each(this.getReactively("alumnosGrupo"), function(al){
					alumnos.push({alumno_id : al._id, 
												matricula : al.profile.matricula, 
												nombreCompleto : al.profile.nombreCompleto, 
												matricula : al.profile.matricula, 
												estatus : true });
				});
				
				return alumnos;
			}
		},
		calificaciones : () => {
			return Calificaciones.find();
		},
		capturaCalificaciones : () => {
			var resultado = {};
			if(this.getReactively("calificaciones")){
				_.each(rc.calificaciones, function(calificacion){
					if(calificacion.materia_id == $stateParams.materia_id && calificacion.grupo_id == $stateParams.grupo_id){
						rc.existe = true;
						resultado = calificacion;
					}
				})
				console.log(rc.existe);
				if(!rc.existe){
					resultado.alumnos = Meteor.users.find({roles : ["alumno"]},{ fields : { 
															"profile.nombreCompleto" : 1,
															"profile.matricula" : 1,
															"profile.fotografia" : 1,
															"profile.sexo" : 1,
															_id : 1
													}}).fetch();
				}
			}
			
			console.log("resultado", resultado);
			return resultado;
		}
  });
  
  this.guardar = function(calificacion){
	  calificacion.fechaCreacion = new Date();
	  calificacion.materia_id = rc.materia._id;
	  calificacion.maestro_id = rc.maestro._id;
	  calificacion.grupo_id = rc.grupo._id;
	  //aquí hay que pasear los alumnos para ambiar las curriculas
		calificacion.estatus = 1;
	  Calificaciones.insert(calificacion);
	  _.each(calificacion.alumnos, function(alumno){
		  var curricula = Curriculas.findOne({alumno_id : alumno._id});		  
		  _.each(curricula.grados, function(grado){
			  _.each(grado, function(materia){
				  if(materia.materia._id == calificacion.materia_id){
					  materia.calificacion = parseInt(alumno.calificacion);
					  materia.estatus = 1;
					  materia.fechaCreacion = new Date();
					  materia.maestro_id = rc.maestro._id;
					  materia.grupo_id = rc.grupo._id;
					  if(materia.calificacion >= 6){
						  materia.aprobado = true;
					  }else{
						  materia.aprobado = false;
					  }
				  }
			  })
		  })
		  var idTemp = curricula._id;
		  delete curricula._id;
		  Curriculas.update({_id : idTemp}, { $set : curricula})
		  console.log("curricula", curricula)
	  })
	  console.log("calificacion", calificacion);
	  toastr.success('Ha calificado correctamente.');
  }
  
  this.actualizar = function(calificacion){
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
					  materia.maestro_id = rc.maestro._id;
					  materia.grupo_id = rc.grupo._id;
					  if(materia.calificacion >= 6){
						  materia.aprobado = true;
					  }else{
						  materia.aprobado = false;
					  }
				  }
			  })
		  })
		  var idTemp = curricula._id;
		  delete curricula._id;
		  Curriculas.update({_id : idTemp}, { $set : curricula})
		  console.log("curricula", curricula)
	  })
	  console.log("calificacion", calificacion);
	  toastr.success('Ha actualizado la calificación correctamente.');
  }
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  }
  
  this.validaCalificacion = function(calificacion){
	  if(calificacion >= 10){
		  calificacion = 10;
	  }
  }
};