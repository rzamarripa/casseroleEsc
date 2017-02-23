angular
  .module('casserole')
  .controller('AlumnosPorEstatusCtrl', AlumnosPorEstatusCtrl);
 
function AlumnosPorEstatusCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.fechaInicio = new Date();
	this.fechaFin = new Date();
	this.semanaActual = moment(new Date()).isoWeek();
	this.diasActuales = [];
	this.alumnos = [];
	this.vendedores = [];
	
	window.rc = rc;
	
  this.getAlumnos = function(semana, anio){
	  Meteor.apply('getAlumnosPorEstatus', [new Date(this.fechaInicio.setHours(0,0,0,0)), new Date(this.fechaFin.setHours(23,59,59,0)), this.estatus, Meteor.user().profile.seccion_id], function(error, result){
		  console.log(result);
		  rc.alumnos = result;
	    $scope.$apply();
	  });
  }
  
  this.getCantAlumnos = function(semana, anio){
	  Meteor.apply('getCantAlumnosPorEstatus', [new Date(this.fechaInicio.setHours(0,0,0,0)), new Date(this.fechaFin.setHours(23,59,59,0)), this.estatus, Meteor.user().profile.seccion_id], function(error, result){
		  console.log("cant. ", result);
		  

		  $('#cantAlumnos').highcharts( {
			  chart: {
            type: 'line'
        },
        title: {
            text: 'Alumnos por estatus por semana ',
            x: -20 //center
        },
        subtitle: {
            text: (rc.campus != undefined) ? rc.campus.nombre : '',
            x: -20
        },
        xAxis: {
            categories: result[0],
            plotBands: [{ // visualize the weekend
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
        },
        yAxis: {
            title: {
                text: 'Cantidad de Alumnos'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' Alumnos'
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
        series: result[1]
	    });

	    $scope.$apply();
	  });
  }
};