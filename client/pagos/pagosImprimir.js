angular
  .module('casserole')
  .controller('PagosImprimirCtrl', PagosImprimirCtrl);
 
function PagosImprimirCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.buscar = {};
  this.buscar.nombre = "";
  this.fecha = new Date();
  
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
	

  this.subTotal = 0.00;
  this.iva = 0.00;
  this.total = 0.00;
  this.iva = 0.00;
  this.total = this.subTotal + this.iva;
  this.alumno = {};
  
	this.subscribe('alumno', () => {
    return [{
	    id : $stateParams.alumno_id
    }];
  });
  this.subscribe('secciones', () => {
    return [{
	    _id : this.getReactively("alumno.profile.seccion_id")
    }];
  });

    this.subscribe('pagosAlumno', () => {

		return [{
			alumno_id : $stateParams.alumno_id
		}];
	});
    this.subscribe("planPagos",()=>{
		return [{alumno_id : $stateParams.alumno_id, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
    
  rc.helpers({
  		semanas :() =>{
  			var ret ={};
  			plan=PlanPagos.find({pago_id:$stateParams.pago}).fetch();
  			//console.log(plan);
  			/*_.each($stateParams.semanas, function(semana){
				  rc.subTotal += (semana.importe/1.16);
				  rc.total += semana.importe;
				  rc.iva = rc.total-rc.subTotal;
				  console.log(semana.importe);
			  });*/
				_.each(plan,function (pago) {
					var fechaActual = moment();
					var fechaCobro = moment(pago.fecha);
					var diasRecargo = fechaActual.diff(fechaCobro, 'days')
					var diasDescuento = fechaCobro.diff(fechaActual, 'days')
	
					if(!ret["Colegiatura"] )ret["Colegiatura"]=[];
					
					ret["Colegiatura"].push({semana:pago.semana,anio:pago.anio,importe:pago.importe})
					rc.total =pago.importe;
					if(pago.tiempoPago==1 && pago.importe>0){
						if(!ret["Recargo"])ret["Recargo"]=[];
						ret["Recargo"].push({semana:pago.semana,anio:pago.anio,importe:pago.importeRecargo})
						rc.total +=pago.importeRecargo;
					}
					if(diasDescuento >= pago.diasDescuento && pago.importe>0){
						if(!ret["Descuento"])ret["Descuento"]=[];
						ret["Descuento"].push({semana:pago.semana,anio:pago.anio,importe:pago.importeDescuento})
						rc.total -=pago.importeDescuento;
					}
				})
				rc.subTotal= rc.total/1.16;
				rc.iva = rc.total-rc.subTotal;
  			return ret

  		},
		alumno : () => {
			return Meteor.users.findOne({_id : $stateParams.alumno_id});
		},
		seccion : () => {
			return Secciones.findOne();
		}
  });


  
  
  
};
