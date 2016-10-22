angular
.module("casserole")
.controller("GruposActivosCtrl", GruposActivosCtrl);
function GruposActivosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	
	window.rc = rc;
	
  this.action = true;
  this.nuevo = true;  
	this.grupos_id = [];
	this.maestros_id = [];
	this.materias_id = [];
	this.grupos = {};
	
	this.subscribe('grupos', () => {		
		return [{
			estatus : true
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('maestros_id')}
		}]
	});

  this.helpers({
	  grupos : () => {
		  return Grupos.find();
	  },
	  gruposActivos : () => {
		  var misAsignaciones = [];
			_.each(this.getReactively("grupos"), function(grupo){				
				_.each(grupo.asignaciones, function(asignacion){
					if(asignacion.estatus == true){
						rc.maestros_id.push(asignacion.maestro_id);
						misAsignaciones.push({
							"grupo" : grupo,
							"asignacion" : asignacion
						});
					}
				});
			});
			return misAsignaciones;
	  }	  
  });
  
  this.getMaestro = function(maestro_id){
	  var maestro = Maestros.findOne(maestro_id);
	  if(maestro){
		  return maestro.nombre + " " + maestro.apPaterno + " " + maestro.apMaterno;
	  }
  }	
};