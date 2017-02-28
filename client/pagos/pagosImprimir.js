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
  console.log($stateParams);

  this.subTotal = 0.00;
  this.total = 0.00;
  this.iva = 0.00;
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
  			var ret = {};
  			plan = PlanPagos.find({pago_id:$stateParams.pago}).fetch();
			  rc.total = 0;
			  
				_.each(plan,function (pago) {
					
					var fechaActual = moment();
					var fechaCobro = moment(pago.fecha);
					var diasRecargo = fechaActual.diff(fechaCobro, 'days')
					var diasDescuento = fechaCobro.diff(fechaActual, 'days')
	
					if(!ret["Colegiatura"] )ret["Colegiatura"]=[];
					
					ret["Colegiatura"].push({semana : pago.semana, anio : pago.anio, importe : pago.importeRegular});
					
					rc.total += pago.importeRegular;
					
					if(pago.tiempoPago == 1 && pago.importe > 0){
						if(!ret["Recargo"])ret["Recargo"]=[];
						ret["Recargo"].push({semana:pago.semana,anio:pago.anio,importe:pago.importeRecargo})
						rc.total += pago.importeRecargo;
					}
					
					if(diasDescuento >= pago.diasDescuento && pago.importe>0){
						if(!ret["Descuento"])ret["Descuento"]=[];
						ret["Descuento"].push({semana:pago.semana,anio:pago.anio,importe:pago.importeDescuento})
						rc.total -= pago.importeDescuento;
					}
					
				})
				rc.subTotal = rc.total;
				
  			return ret;
  		},
		alumno : () => {
			return Meteor.users.findOne({_id : $stateParams.alumno_id});
		},
		seccion : () => {
			return Secciones.findOne();
		}
  });
};
