angular
  .module('casserole')
  .controller('AlumnosPorEstatusCtrl', AlumnosPorEstatusCtrl);
 
function AlumnosPorEstatusCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.fechaInicio = new Date();
	this.fechaFin = new Date();
	this.semanaActual = moment(new Date()).isoWeek();
	this.diasActuales = [];
	this.alumnos = [];
	this.vendedores = [];
	
	window.rc = rc;
	
  this.getAlumnos = function(semana, anio){
	  Meteor.apply('getAlumnosPorEstatus', [new Date(this.fechaInicio.setHours(0,0,0,0)), new Date(this.fechaFin.setHours(23,59,59,0)), this.estatus, Meteor.user().profile.seccion_id], function(error, result){
		  console.log(result);
		  rc.alumnos = result;
	    $scope.$apply();
	  });
  }
};