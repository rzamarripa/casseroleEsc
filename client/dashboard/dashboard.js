angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.alumnos_id = [];
	this.conceptos_id = [];
	this.semanaActual = moment(new Date()).isoWeek();

  this.subscribe("inscripciones",()=>{
		return [{estatus : 1, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : moment().isoWeek(), pagada : 1}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});
	
	this.subscribe('gastos', () => {
    return [{estatus: true, semana: this.semanaActual, campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });
  
  this.subscribe('conceptosGasto', () => {
    return [{_id : { $in : this.getCollectionReactively('conceptos_id')}}]
  });
  
  this.subscribe('cuentas', () => {
    return [{estatus: true, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

  this.helpers({
	  inscripcionesActivas : () => {
		  return Inscripciones.find().count();
	  },
	  campus : () => {
		  return Campus.findOne();
	  },
	  semanales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Semanal"}).count();
	  },
	  quincenales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Quincenal"}).count();
	  },
	  mensuales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Mensual"}).count();
	  },
	  pagosPorSemana : () => {
		  var pagos = PlanPagos.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : moment().isoWeek(), pagada : 1}).fetch();		  
		  var arreglo = {};
		  if(pagos){
			  _.each(pagos, function(pago){
				  rc.alumnos_id.push(pago.alumno_id);
			  });
			  
				_.each(pagos, function(pago){
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
		  console.log("arreglo", _.toArray( arreglo));
		  return arreglo;
	  },
	  gastosCheque : () => {
		  var gas = Gastos.find({tipoGasto  : "cheques"}).fetch();
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
		  var gas = Gastos.find({tipoGasto  : "relaciones"}).fetch();
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
		  var gas = Gastos.find({tipoGasto  : "depositos"}).fetch();
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
		  var gas = Gastos.find({tipoGasto  : "admon"}).fetch();
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
	  }
  });
}

//XFSrD4ZL34Dn8nG2Q