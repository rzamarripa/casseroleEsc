angular
.module("casserole")
.controller("MaestroGruposCtrl", MaestroGruposCtrl);
 function MaestroGruposCtrl($scope, $meteor, $reactive , $state, $stateParams){

 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
	this.grupos = [];
	this.alumnos_id = [];
	moment.locale("es");
	this.hoy = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
	this.fechaHoy = moment().format("dd - MM - yyyy");

	this.subscribe('grupos', () => {		
		return [{
			estatus : true
		}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively("alumnos_id")}
		}]
	});
	
	this.helpers({
		avisos : () => {
		  return MensajesVendedores.find().fetch();
		},
		grupos : () => {
			return Grupos.find();				
		},
		gruposMaestro : () => {
			var misAsignaciones = [];
			var alumnos = [];
			_.each(this.getReactively("grupos"), function(grupo){
				_.each(grupo.asignaciones, function(asignacion){
					if(asignacion.maestro_id == Meteor.user().profile.maestro_id && asignacion.estatus == true){
						
						_.each(grupo.alumnos, function(alumno_id){
							rc.alumnos_id.push(alumno_id);
						});
						
						misAsignaciones.push({"grupo" : grupo,
																	"asignacion" : asignacion,
																	"alumnos" : Meteor.users.find({ _id : { $in : grupo.alumnos }, 
																		roles : ["alumno"]},{ fields : { 
																				"profile.nombreCompleto" : 1,
																				"profile.matricula" : 1,
																				"profile.sexo" : 1,
																				"profile.fotografia" : 1,
																				_id : 1
																		}}).fetch()
																	});
					}
				});
			});
			return misAsignaciones;
		}		
	});
	
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
};