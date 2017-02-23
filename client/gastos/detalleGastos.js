angular
  .module('casserole')
  .controller('DetalleGastosCtrl', DetalleGastosCtrl);
 
function DetalleGastosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);

	this.semanas = [];
	for(var i = 1; i <= 52; i++){
		this.semanas.push(i);
	}
	this.semanaActual = parseInt($stateParams.semana);
	this.anio = parseInt($stateParams.anio);
	this.alumnos_id = [];
	this.conceptos_id = [];	
	this.totalGastos = 0.00;
	this.graficaGastos = [];
	this.categorias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
		
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('gastos', () => {
    return [{estatus: true, semana: parseInt(rc.getReactively("semanaActual")), anio : parseInt(rc.getReactively("anio")), campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });
  
  this.subscribe('conceptosGasto', () => {
    return [{_id : { $in : this.getCollectionReactively('conceptos_id')}}]
  });
  
  this.helpers({
	  pagosPorSemana : () => {
		  var pagos = PlanPagos.find().fetch();
		  var pagosPorGrupo = {};
		  var arreglo = {};
		  if(pagos){
			  _.each(pagos, function(pago){
				  rc.alumnos_id.push(pago.alumno_id);
			  });
			  
				_.each(pagos, function(pago){
					//Listado de Pagos realizados
					if(undefined == arreglo[pago.alumno_id]){
						arreglo[pago.alumno_id] = {};
						arreglo[pago.alumno_id].semanasPagadas = [];
						arreglo[pago.alumno_id].alumno = Meteor.users.findOne({_id : pago.alumno_id});
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
						arreglo[pago.alumno_id].tipoPlan = pago.tipoPlan;
						arreglo[pago.alumno_id].fechaPago = pago.fechaPago;
					}else{
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
					}
				});

		  }
			
		  return arreglo;
	  },

	  gastosCheque : () => {
		  var gas = Gastos.find({tipoGasto  : "Cheques"}).fetch();
		  var total = 0.00;
			if(gas != undefined){
				_.each(gas, function(g){
					total += g.importe;
					rc.conceptos_id.push(g.concepto_id);
					g.concepto = ConceptosGasto.findOne(g.concepto_id);
				})
				gas.push({chequeReferenciado : "Total", importe : total});
			}
			return gas;
	  },
	  gastosRelaciones : () => {
		  var gas = Gastos.find({tipoGasto  : "Relaciones"}).fetch();
		  var total = 0.00;
			if(gas != undefined){
				_.each(gas, function(g){
					total += g.importe;
					rc.conceptos_id.push(g.concepto_id);
					g.concepto = ConceptosGasto.findOne(g.concepto_id);
				})
				gas.push({registros : "Total", importe : total});
			}
			return gas;
	  },
	  gastosDepositos : () => {
		  var gas = Gastos.find({tipoGasto  : "Depositos"}).fetch();
		  var total = 0.00;
			if(gas != undefined){
				_.each(gas, function(g){
					total += g.importe;
					g.cuenta = Cuentas.findOne(g.cuenta_id);
				})
				gas.push({cuenta : {nombre : "Total"}, importe : total});
			}
			return gas;
	  },
	  gastosAdmon : () => {
		  var gas = Gastos.find({tipoGasto  : "Admon"}).fetch();
		  var total = 0.00;
			if(gas != undefined){
				_.each(gas, function(g){
					total += g.importe;
					rc.conceptos_id.push(g.concepto_id);
					g.concepto = ConceptosGasto.findOne(g.concepto_id);
				})
				gas.push({concepto : { nombre : "Total"}, importe : total});
			}
			return gas;
	  },
  });
  
 
}

//XFSrD4ZL34Dn8nG2Q
