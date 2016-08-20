angular
  .module('casserole')
  .controller('PagosCtrl', PagosCtrl);
 
function PagosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
  this.action = true;
  this.buscar = {};
  this.buscar.nombre = "";  

	this.subscribe('alumnos', () => {
    return [{
	    options : { limit: 10 },
	    where : { nombre : this.getReactively('buscar.nombre') }
    }] ;
  });
  
  this.helpers({
		alumnos : () => {
			return Alumnos.find();
		},
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  }
  });
};