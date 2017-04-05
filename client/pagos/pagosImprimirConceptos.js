angular
  .module('casserole')
  .controller('PagosImprimirConceptosCtrl', PagosImprimirConceptosCtrl);
 
function PagosImprimirConceptosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  
  window.rc = rc;
  console.log($stateParams);
	this.fecha = new Date();
  this.total = 0.00;
  
  Meteor.apply("imprimirTicket", [$stateParams.seccion_id, $stateParams.folioActual, $stateParams.alumno_id], function(error, result){
	  if(result){
		  rc.seccion = result[0]
		  rc.pagos = result[1];
		  rc.alumno = result[2];
		  rc.folio = $stateParams.folioActual;
		  rc.semanas = result[3];
		  console.log(result);
		  _.each(result[1], function(pago){
			  rc.total += pago.pago;
		  })
	  }else{
		  console.log(error);
	  }
	  $scope.$apply();
  })
};