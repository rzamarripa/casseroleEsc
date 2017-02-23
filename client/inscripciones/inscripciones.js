angular.module("casserole")
.controller("InscripcionesCtrl",InscripcionesCtrl)
function InscripcionesCtrl($scope, $meteor, $reactive, $state, toastr) {
  let rc = $reactive(this).attach($scope);
	this.buscar = {};
	this.buscar.nombre = "";
		
	this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});

	rc.helpers({
	  seccion : () => {
		  return Secciones.findOne();
	  }
  });
  	
	this.cambiarEstatus = function(inscripcion_id, estatus){
		console.log(estatus);
		if(estatus == 0){
			Inscripciones.update(inscripcion_id, { $set : { estatus : 1 }});
			Meteor.apply('reactivarPlanPagos', [inscripcion_id], function(error, result){
			  toastr.success("El alumno ha sido recuperado y su plan de pagos se ha activado, pero no olvide agregarlo a un grupo");
			  rc.getInscripciones();
		  });
		}else{
			Inscripciones.update(inscripcion_id, { $set : { estatus : 0 }});
			Meteor.apply('cancelarPlanPagos', [inscripcion_id], function(error, result){
			  toastr.success("El alumno ha sido dado de baja");
			  rc.getInscripciones();
		  });
		}
	}
	
	this.getInscripciones = function(){
		if(this.buscar.nombre.length > 3){
			console.log(rc.buscar.nombre);
			var options = {
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : rc.getReactively('buscar.nombre'), 
					campus_id : Meteor.user().profile.campus_id
				}
	    }
			Meteor.apply('getInscripciones', [options], function(error, result){
				if(error){
					console.log("entré al error ", error);
				}
				if(result){ 
					console.log("entré al result ", result);
					rc.inscripciones = result;
					$scope.$apply();
				}
		  });
		}else{
			rc.inscripciones = [];
		}
  }; 
  
};