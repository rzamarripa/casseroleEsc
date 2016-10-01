angular
.module("casserole")
.controller("MaestroGruposCtrl", MaestroGruposCtrl);
 function MaestroGruposCtrl($scope, $meteor, $reactive , $state, $stateParams){

 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
	this.grupos = [];
	this.alumnos_id = [];
	moment.locale("es");
	this.hoy = moment().format("dddd, D MMMM YYYY, h:mm:ss a");
	this.fechaHoy = moment().format("dd - MM - yyyy");

	this.subscribe('grupos', () => {		
		return [{
			estatus : true
		}]
	});
	
	this.subscribe('alumnos', () => {		
		console.log("reacitvo")
		return [{
			_id : { $in : rc.getCollectionReactively("alumnos_id")}
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
			_.each(rc.getReactively("grupos"), function(grupo){
				_.each(grupo.asignaciones, function(asignacion){
					if(asignacion.maestro_id == Meteor.user().profile.maestro_id && asignacion.estatus == true){
						
						rc.alumnos_id = rc.alumnos_id.concat(grupo.alumnos ? grupo.alumnos : []);

						misAsignaciones.push({"grupo" : grupo,
																	"asignacion" : asignacion,
																	"alumnos" : Meteor.users.find({ _id : { $in : grupo.alumnos ? grupo.alumnos : [] }, 
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