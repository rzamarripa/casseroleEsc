angular
  .module('casserole')
  .controller('ReporteComisionesCtrl', ReporteComisionesCtrl);
 
function ReporteComisionesCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.dias = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
	this.semana = moment(new Date()).isoWeek();
	this.anio = moment().get("year");
	this.semanaActual = moment(new Date()).isoWeek();
	this.diasActuales = [];
	this.gerentes = [];
	
	
	window.rc = rc;
	
  
  this.getComisiones = function(semana, anio){
	  Meteor.apply('reporteComisiones', [this.semana, this.anio, Meteor.user().profile.seccion_id, Meteor.user().profile.campus_id], function(error, result){
		  rc.gerentes = result;
		  console.log(result);
	    $scope.$apply();
	  });
  }
};