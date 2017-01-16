angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	this.semanas = [];
	for(var i = 1; i <= 52; i++){
		this.semanas.push(i);
	}
	
	this.alumnos_id = [];
	this.conceptos_id = [];	
	this.semanaActual = moment(new Date()).isoWeek();
	this.anio = moment().get('year');
	
  this.subscribe("inscripciones",()=>{
		return [{estatus : 1, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semana : parseInt(this.getReactively("semanaActual")) }]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		var query = {campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : parseInt(this.getReactively("semanaActual")), pagada : 1, anioPago : parseInt(this.getReactively("anio"))};
		return [query]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});
	
	this.subscribe('gastos', () => {
    return [{estatus: true, semana: parseInt(rc.getReactively("semanaActual")), campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });
  
  this.subscribe('conceptosGasto', () => {
    return [{_id : { $in : this.getCollectionReactively('conceptos_id')}}]
  });
  
  this.subscribe('cuentas', () => {
    return [{estatus: true, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });
  
  this.subscribe('grupos', () => {
		return [{estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});

  this.helpers({
	  inscripcionesActivas : () => {
		  return Inscripciones.find().count();
	  },
	  campus : () => {
		  return Campus.findOne();
	  },
	  pagosPorGrupo : () => {
		  var grupos = Grupos.find().fetch();
		  var arreglo = {};
		  if(grupos){
			  _.each(grupos, function(grupo){
					//Listado de Pagos realizados
					if(undefined == arreglo[grupo.nombre]){
						arreglo[grupo.nombre] = {};
						arreglo[grupo.nombre].name = grupo.nombre;
						arreglo[grupo.nombre].data = 0.00;
						_.each(grupo.alumnos, function(alumno){
							var pagosAlumno = PlanPagos.find({alumno_id : alumno}).fetch();
							_.each(pagosAlumno, function(pago){
								arreglo[grupo.nombre].data += pago.importe;
							});
						});
					}else{
						arreglo[grupo.nombre].name = grupo.nombre;
						
						_.each(grupo.alumnos, function(alumno){
							var pagosAlumno = PlanPagos.find({alumno_id : alumno}).fetch();
							_.each(pagosAlumno, function(pago){
								arreglo[grupo.nombre].data += pago.importe;
							});
						});
					}	
			  });
			  
			  arreglo = _.toArray(arreglo);
			  var valores = _.pluck(arreglo, "data");
			  var nombreGrupos = _.pluck(arreglo, "name");
			  console.log(nombreGrupos, valores);
		  }
		   $('#pagosPorGrupo').highcharts( {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Pagos por grupo ' + rc.semanaActual
        },
        xAxis: {
            categories: nombreGrupos
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: ''
            }
        },
        series: [{
            name: 'Pagos',
            data: valores
        }]
    	});
			console.log(arreglo);
		  return arreglo;
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
/*
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
	  },
*/
	  graficaGastos : () => {
		  var gastos = Gastos.find({ tipoGasto : {$not : "depositos"}},{ sort : { weekday : 1 }}).fetch();
		  var arreglo = {};
			_.each(gastos, function(gasto){
				if(arreglo[gasto.tipoGasto] == undefined){
					arreglo[gasto.tipoGasto] = {};
					arreglo[gasto.tipoGasto].data = {};
					for(var i = 1; i <= 7; i++){
						arreglo[gasto.tipoGasto].data = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];
					}
					arreglo[gasto.tipoGasto].name = gasto.tipoGasto;
					arreglo[gasto.tipoGasto].data[gasto.weekday] = gasto.importe;
				}else{
					var total = (arreglo[gasto.tipoGasto].data[gasto.weekday] != undefined) ? arreglo[gasto.tipoGasto].data[gasto.weekday] : 0.00;
					total += gasto.importe;
					arreglo[gasto.tipoGasto].data[gasto.weekday] = total;
				}
			});
			
			arreglo = _.toArray(arreglo);
		  
		  $('#gastosGrafica').highcharts( {
			  chart: {
            type: 'areaspline'
        },
        title: {
            text: 'Relación de Gastos de la Semana ' + this.getReactively("semanaActual"),
            x: -20 //center
        },
        subtitle: {
            text: (rc.campus != undefined) ? rc.campus.nombre : '',
            x: -20
        },
        xAxis: {
            categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            plotBands: [{ // visualize the weekend
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
        },
        yAxis: {
            title: {
                text: 'Gasto en $'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' Pesos'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: arreglo
	    });
		  return arreglo;
	  }
  });
  
 
}

//XFSrD4ZL34Dn8nG2Q