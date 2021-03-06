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
	window.rc = rc;
	
	Meteor.apply("mostrarListadoAlumnosCalificaciones", [$stateParams], function(error, result){
		if(result){
			if(result.materia_id != undefined)
				rc.existe = true;
			rc.capturaCalificaciones = result;
		}
	})
		
	this.subscribe('calificaciones', () => {		
		return [{
			grupo_id : $stateParams.grupo_id,
			materia_id : $stateParams.materia_id,
			maestro_id : $stateParams.maestro_id
		}]
	});
	
	this.subscribe('curriculas', () => {		
		return [{
			alumno_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : $stateParams.grupo_id
		}]
	});
	
	this.subscribe('secciones', () => {
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
			this.seccion_id = this.getReactively("grupo.seccion_id");
			return Materias.findOne($stateParams.materia_id);
		},
/*
		alumnosGrupo : () => {
			var grupo = Grupos.findOne($stateParams.grupo_id);
			if(grupo){
				rc.alumnos_id = _.pluck(grupo.alumnos, "alumno_id");
				
			}
			
			return Meteor.users.find({roles : ["alumno"]}).fetch();
		},
*/
		sePuede : () => {
			var seccion = Secciones.findOne();
			if(seccion)
				return seccion.abrirCalificaciones;
		},
/*
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
*/
/*
		capturaCalificaciones : () => {
			var resultado = {};
			if(this.getReactively("calificaciones")){
				_.each(rc.calificaciones, function(calificacion){
					if(calificacion.materia_id == $stateParams.materia_id && calificacion.grupo_id == $stateParams.grupo_id){
						rc.existe = true;
						resultado = calificacion;
					}
				})
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
			return resultado;
		}
*/
  });
  
  this.guardar = function(calificacion){
	  calificacion.fechaCreacion = new Date();
	  calificacion.materia_id = rc.materia._id;
	  calificacion.maestro_id = rc.maestro._id;
	  calificacion.grupo_id = rc.grupo._id;
	  calificacion.campus_id = rc.grupo.campus_id;
	  calificacion.seccion_id = rc.grupo.seccion_id;
	  //aquí hay que pasear los alumnos para cambiar las curriculas
		calificacion.estatus = 1;
		Meteor.apply("calificar",[calificacion], function(error, result){
			if(result){
				toastr.success("Ha calificado correctamente.")
			}else{
				toastr.error("No se pudo calificar.")
			}
		})
  }
  
  this.actualizar = function(calificacion){
	  Meteor.apply("actualizarCalificacion",[calificacion], function(error, result){
			if(result){
				toastr.success("Ha calificado correctamente.")
			}else{
				toastr.error("No se pudo calificar.")
			}
		})
  }
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
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