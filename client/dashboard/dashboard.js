angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);

	this.semanas = [];
	for(var i = 1; i <= 52; i++){
		this.semanas.push(i);
	}
	
	this.alumnos_id = [];
	this.conceptos_id = [];	
	this.semanaActual = moment(new Date()).isoWeek();
	this.anio = moment().get('year');
	this.totalPagos = 0.00;
	this.totalGastos = 0.00;
	this.graficaGastos = [];
	this.categorias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
	
	window.rc = rc;
	
  this.subscribe("inscripciones",()=>{
		return [{estatus : 1, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		var query = {campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : parseInt(this.getReactively("semanaActual")), estatus : 1, anioPago : parseInt(this.getReactively("anio"))};
		return [query]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});
	
	this.subscribe('gastos', () => {
    return [{estatus: true, semana: parseInt(rc.getReactively("semanaActual")), anio : parseInt(rc.getReactively("anio")), campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
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
	  inscripcionesActivasSemanaActual : () => {
		  return Inscripciones.find({semana : parseInt(this.getReactively("semanaActual"))}).count();
	  },
	  campus : () => {
		  return Campus.findOne();
	  },
	  pagosPorGrupo : () => {
		  //Es la gráfica de pago que hacen los alumnos agrupada por grupos activos
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
							var pagosAlumno = PlanPagos.find({alumno_id : alumno.alumno_id}).fetch();
							_.each(pagosAlumno, function(pago){
								arreglo[grupo.nombre].data += pago.importe;
							});
						});
					}else{
						arreglo[grupo.nombre].name = grupo.nombre;
						_.each(grupo.alumnos, function(alumno){
							var pagosAlumno = PlanPagos.find({alumno_id : alumno.alumno_id}).fetch();
							_.each(pagosAlumno, function(pago){
								arreglo[grupo.nombre].data += pago.importe;
							});
						});
					}	
			  });
			  
			  arreglo = _.toArray(arreglo);
			  var valores = _.pluck(arreglo, "data");
			  var nombreGrupos = _.pluck(arreglo, "name");
			  rc.totalPagos = _.reduce(valores, function (memo, num) { return memo + num }, 0);

		  }
			$('#pagosPorGrupo').highcharts( {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Ingresos por colegiatura en la semana ' + rc.semanaActual
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
		  return arreglo;
	  },
	  semanalesSemana : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Semanal", semana : parseInt(this.getReactively("semanaActual"))}).count();
	  },
	  mensualesSemana : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Mensual", semana : parseInt(this.getReactively("semanaActual"))}).count();
	  },
	  graficaGastos : () => {
		  var gastos = Gastos.find({ tipoGasto : {$not : "Depositos"}},{ sort : { diaSemana : 1 }}).fetch();
		  var arreglo = {};
			_.each(gastos, function(gasto){
				if(arreglo[gasto.tipoGasto] == undefined){
					arreglo[gasto.tipoGasto] = {};
					arreglo[gasto.tipoGasto].total = 0.00;
					arreglo[gasto.tipoGasto].data = {};
					for(var i = 0; i <= 7; i++){
						arreglo[gasto.tipoGasto].data = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];
					}
					arreglo[gasto.tipoGasto].name = gasto.tipoGasto;
					console.log(gasto.importe);
					arreglo[gasto.tipoGasto].data[gasto.diaSemana - 1] = gasto.importe;
					arreglo[gasto.tipoGasto].total = gasto.importe;
				}else{
					var total = (arreglo[gasto.tipoGasto].data[gasto.diaSemana - 1] != undefined) ? arreglo[gasto.tipoGasto].data[gasto.diaSemana - 1] : 0.00;
					total += gasto.importe;
					arreglo[gasto.tipoGasto].data[gasto.diaSemana - 1] = total;
					arreglo[gasto.tipoGasto].total += total;
				}
			});
			
			arreglo = _.toArray(arreglo);
		  console.log(arreglo);
		  $('#gastosGrafica').highcharts( {
			  chart: {
            type: 'line'
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
            categories: this.categorias,
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
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        },
        series: arreglo
	    });
		  return arreglo;
	  },
	  totalGastos : () => {
		  var gastoTotal = 0.00;
		  if(rc.graficaGastos != undefined){
			  _.each(rc.getReactively("graficaGastos"), function(gastos){
					_.each(gastos.data, function(gasto){
						gastoTotal += gasto;
					})
				});
		  }
			return gastoTotal;
	  },
	  cantidadAlumnosActivos : () => {
		  return Inscripciones.find().count();
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
  });
  
 
}

//XFSrD4ZL34Dn8nG2Q