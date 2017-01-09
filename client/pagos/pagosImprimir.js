angular
  .module('casserole')
  .controller('PagosImprimirCtrl', PagosImprimirCtrl);
 
function PagosImprimirCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.buscar = {};
  this.buscar.nombre = "";
  this.fecha = new Date();
  window.rc = rc;
  
/*
  
  $stateParams.semanas = [{
			alumno_id	:"9Xuey5kJzCDTCrCAY",
			anio			:2016,
			campus_id	:"4xeCzR8qEttXW3fQ2",
			concepto	:"Colegiatura #2: Colegiatura",
			cuenta_id	:"eekTD3wysztJQvH9y",
			estatus		:1,
			fechaPago	:new Date(),
			importe		:550,
			numero		:2,
			semana		:45,
			semanaPago:50,
			tipo			:"Colegiatura",
			usuario_id:"BbW3hvswY7DtP4T7F",
			weekday		:0
		},{
			alumno_id	:"9Xuey5kJzCDTCrCAY",
			anio			:2016,
			campus_id	:"4xeCzR8qEttXW3fQ2",
			concepto	:"Colegiatura #3: Colegiatura",
			cuenta_id	:"eekTD3wysztJQvH9y",
			estatus		:1,
			fechaPago	:new Date(),
			importe		:550,
			numero		:3,
			semana		:46,
			semanaPago:50,
			tipo			:"Colegiatura",
			usuario_id:"BbW3hvswY7DtP4T7F"
		},{
			alumno_id	:"9Xuey5kJzCDTCrCAY",
			anio			:2016,
			campus_id	:"4xeCzR8qEttXW3fQ2",
			concepto	:"Colegiatura #3: Colegiatura",
			cuenta_id	:"eekTD3wysztJQvH9y",
			estatus		:1,
			fechaPago	:new Date(),
			importe		:550,
			numero		:3,
			semana		:46,
			semanaPago:50,
			tipo			:"Recargo",
			usuario_id:"BbW3hvswY7DtP4T7F"
		}
  ]
*/
	console.log($stateParams)
	 $stateParams.semanas=JSON.parse($stateParams.semanas)
	 console.log($stateParams)
  this.semanas = {};
  _.each($stateParams.semanas, function(semana){
	  if(undefined == rc.semanas[semana.tipo]){
			  rc.semanas[semana.tipo] = [{
			  numero : semana.numero,
			  importe : semana.importe,
			  semana : semana.semana,
			  tipo : semana.tipo,
			  anio : semana.anio
	  	}];
	  }else{
		  rc.semanas[semana.tipo].push({
			  numero : semana.numero,
			  importe : semana.importe,
			  semana : semana.semana,
			  tipo : semana.tipo,
			  anio : semana.anio
	  	})
	  }
  });
  
  
  console.log("resultado",_.toArray(rc.semanas));
  
  console.log(this.semanas);

  this.subTotal = 0.00;
  this.iva = 0.00;
  this.total = 0.00;
  this.iva = 0.00;
  this.total = this.subTotal + this.iva;
  this.alumno = {};
  
	this.subscribe('alumno', () => {
    return [{
	    id : $stateParams.id
    }];
  });
  this.subscribe('secciones', () => {
    return [{
	    id : this.getReactively("alumno.profile.seccion_id")
    }];
  });
    
  this.helpers({
		alumno : () => {
			return Alumnos.findOne();
		},
		seccion : () => {
			return Secciones.findOne();
		}
  });
  
  _.each($stateParams.semanas, function(semana){
	  rc.subTotal += (semana.importe/1.16);
	  rc.total += semana.importe;
	  rc.iva = rc.total-rc.subTotal;
	  console.log(semana.importe);
  });
  
};
