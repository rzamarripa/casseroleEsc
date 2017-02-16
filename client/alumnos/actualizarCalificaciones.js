angular
	.module('casserole')
	.controller('ActualizarCalificacionesCtrl', ActualizarCalificacionesCtrl);
 
function ActualizarCalificacionesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	this.planEstudio_id = "";
	window.rc = rc;
	console.log($stateParams);

	this.subscribe("curriculas",()=>{
		return [{estatus:true, alumno_id : $stateParams.alumno_id, planEstudios_id : this.getReactively("planEstudio_id")}]
	});

	this.subscribe('alumno', () => {
		return [{
			id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe('inscripciones', () => {
		return [{
			_id : $stateParams.inscripcion_id
		}];
	});
		
	this.helpers({
		alumno : () => {
			var al = Meteor.users.findOne({_id : $stateParams.alumno_id});
			if(al){
				this.ocupacion_id = al.profile.ocupacion_id;
				return al;
			}			
		},
		curricula : () => {
			return Curriculas.findOne();		
		},
		inscripcion : () => {
			var inscripcion = Inscripciones.findOne($stateParams.inscripcion_id);
			if(inscripcion){
				rc.planEstudio_id = inscripcion.planEstudios_id;
			}
			return inscripcion;
		}
	});

	this.actualizarCalificaciones = function(){
		var curriculaNueva = angular.copy(rc.curricula);
		var idTemp = curriculaNueva._id;
		delete curriculaNueva._id;
		
		_.each(curriculaNueva.grados, function(grado){
			_.each(grado, function(materia){
				if(materia.calificacion != undefined && materia.calificacion >= 0 && materia.calificacion <= 10){
					materia.estatus = 1;
					materia.fechaCreacion = new Date();
					if(materia.calificacion >= 7){
						materia.aprobado = true;
					}else{
						materia.aprobado = false;
					}
				}				
			})
		})
		console.log(curriculaNueva);
		Curriculas.update({_id : idTemp}, { $set : curriculaNueva});
	}
	
	this.estaAprobado = function(materia){
		if(materia.calificacion >= 7){
			materia.aprobado = true;
		}else{
			materia.aprobado = false;
		}
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
}