angular
  .module('casserole')
  .controller('PagosImprimirCtrl', PagosImprimirCtrl);
 
function PagosImprimirCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.buscar = {};
  this.buscar.nombre = "";
  this.fecha = new Date();
  
  this.semanas = $stateParams.semanas;
  this.subTotal = 0.00;
  this.iva = 0.00;
  this.total = 0.00;
  
	this.subscribe('alumno', () => {
    return [{
	    id : $stateParams.id
    }];
  });
    
  this.helpers({
		alumno : () => {
			return Alumnos.findOne();
		}
  });
  
  _.each(this.semanas, function(semana){
	  rc.subTotal += semana.importe;
	  console.log(semana.importe);
  });
  
  this.iva = 0.00;
  
  this.total = this.subTotal + this.iva;
  
  
  
};
