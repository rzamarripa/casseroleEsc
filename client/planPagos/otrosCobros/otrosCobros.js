angular
.module("casserole")
.controller("OtrosCobrosCtrl", OtrosCobrosCtrl);
function OtrosCobrosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.otrosCobros = [];
  this.totales = 0.00;
  window.rc = rc;
	
	this.calcularCobros = function(fechaInicial, fechaFinal){
		this.totales = 0.00;
		Meteor.apply('historialOtrosCobros', [this.fechaInicial, this.fechaFinal, Meteor.user().profile.seccion_id], function(error, result){
		  console.log(result);
		  _.each(result, function(cobro){
			  rc.totales += cobro.importe;
		  })
		  rc.otrosCobros = result;
	    $scope.$apply();
	  });
	}
	
	this.calcularSemana = function(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    rc.fechaInicial = new Date(simple);
    rc.fechaFinal = new Date(moment(simple).add(7,"days"));
	}
};