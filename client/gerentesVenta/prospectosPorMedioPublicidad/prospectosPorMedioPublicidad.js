angular
.module("casserole")
.controller("ProspectosPorMedioPublicidadCtrl", ProspectosPorMedioPublicidadCtrl);
function ProspectosPorMedioPublicidadCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.nuevo = true;
	this.action = true;
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();

  this.getProspectos = function(fechaInicial, fechaFinal){
    
    Meteor.apply('prospectosPorEtapaVenta', [fechaInicial, fechaFinal], function(error, result){
      
      var nombres = _.pluck(result, "medio");
      var valores = _.pluck(result, "cantidad");
      $('#prospectosPorMediosPublicidad').highcharts( {
          chart: {
                type: 'column'
            },
            title: {
                text: 'Prospectos por Etapa de Venta en Medios de Publicidad'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: result[0],
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Cantidad de Prospectos'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.0f} p</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: result[1]
        });
        $scope.$apply();
    });
  }


   this.getEtapas11= function(fechaInicial, fechaFinal){


     Meteor.apply('prospectosSoloEtapaVenta', [fechaInicial, fechaFinal], function(error, result){
      
      // var nombres = _.pluck(result, "medio");
      var valores = _.pluck(result, "cantidad");
$('#prospectosSoloEtapaVenta').highcharts( {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Pagos por semana ' + rc.semanaActual
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
        $scope.$apply();
    });

  }



   this.getEtapas= function(fechaInicial, fechaFinal){

     Meteor.apply('prospectosSoloEtapaVenta', [fechaInicial, fechaFinal], function(error, result){
              
              // arreglo = _.toArray(arreglo);
              // var valores = _.pluck(arreglo, "data");



              var nombreEtapas = _.pluck(result, "etapaVenta");
               var valores = _.pluck(result, "cantidad");
          
           $('#prospectosSoloEtapaVenta').highcharts( {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Prospectos por Etapas de Venta ' 
        },
        xAxis: {
            categories: nombreEtapas
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.etapaVenta}</span>: <b>{point.y}</b><br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: ''
            }
        },
        series: [{
            etapaVenta: 'Prospectos',
            data: valores
        }]
        });
       })

    }

};


