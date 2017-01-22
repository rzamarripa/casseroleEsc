angular
.module("casserole")
.controller("VerCalificacionesCtrl", VerCalificacionesCtrl);
 function VerCalificacionesCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){

 	let rc = $reactive(this).attach($scope);
 	
 	this.hoy = new Date();
	this.alumnos_id = [];
	this.sePuede = false;
	this.existe = false;
		
	this.subscribe('calificaciones', () => {		
		return [{
			grupo_id : $stateParams.grupo_id,
			materia_id : $stateParams.materia_id,
			maestro_id : $stateParams.maestro_id
		}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : $stateParams.grupo_id
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
			rc.alumnos_id = grupo.alumnos;
			rc.seccion_id = this.getReactively("grupo.seccion_id");
			return Meteor.users.find({roles : ["alumno"]}).fetch();
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
		mmg : () => {
			return MaestrosMateriasGrupos.findOne({grupo_id : $stateParams.grupo_id})
		},
		capturaCalificaciones : () => {
			var resultado = {};
			if(this.getReactively("calificaciones")){
				_.each(rc.calificaciones, function(calificacion){
					if(calificacion.materia_id == $stateParams.materia_id && calificacion.grupo_id == $stateParams.grupo_id){
						rc.sePuede = true;
						rc.existe = true;
						resultado = calificacion;
					}
				})
				if(!rc.existe){
					rc.sePuede = true;
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
  });
  
  this.guardar = function(calificacion){
	  calificacion.fechaCreacion = new Date();
	  calificacion.materia_id = rc.materia._id;
	  calificacion.maestro_id = rc.maestro._id;
	  calificacion.grupo_id = rc.grupo._id;
	  calificacion.maestroMateriaGrupo_id = rc.mmg._id;
	  Calificaciones.insert(calificacion);
	  toastr.success('Ha calificado correctamente.');
  }
  
  this.actualizar = function(calificacion){
	  var tempId = calificacion._id;
	  delete calificacion._id;
	  calificacion.fechaActualizacionAsistencia = new Date();
	  Calificaciones.update({_id : tempId}, { $set : calificacion });
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
	  if(calificacion >= 100){
		  calificacion = 100;
	  }
  }
};