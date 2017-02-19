angular
.module("casserole")
.controller("AlumnoGruposCtrl", AlumnoGruposCtrl);
 function AlumnoGruposCtrl($scope, $meteor, $reactive , $state, $stateParams){
 	let rc = $reactive(this).attach($scope);

 	this.hoy = new Date();
	this.grupos = [];
	window.rc = rc;
	
	this.subscribe('inscripciones', () => {		
		return [{
			estatus : 1, alumno_id : $stateParams.alumno_id
		}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			estatus : true
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			estatus : true
		}]
	});

	this.helpers({
		grupos : () => {
			return Grupos.find();
		},
		maestros : () => {
			return Maestros.find();
		},
		misInscripciones : () => {
			return Inscripciones.find().fetch();
		},
		misAsignaciones : () => {
			this.asignaciones = [];
			if(this.getReactively("misInscripciones")){
				_.each(this.getReactively("grupos"), function(grupo){
					_.each(grupo.asignaciones, function(asignacion){
						if(asignacion.estatus == true){
							_.each(grupo.alumnos, function(alumno){
								if(alumno.alumno_id == Meteor.userId()){
									rc.asignaciones.push({
										alumno_id : $stateParams.alumno_id,
										grupo : {
											_id : grupo._id,
											grupoNombre : grupo.nombre,
											grupoIdentificador : grupo.identificador,
										},										
										materia : asignacion.materia,
										semanas : asignacion.semanas,
										maestro : Maestros.findOne(asignacion.maestro_id)
									});
								}
							});
						}
					});
				});
			}
		}
  });
  
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
};