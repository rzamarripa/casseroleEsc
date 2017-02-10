angular
.module("casserole")
.controller("PagosSemanaCtrl", PagosSemanaCtrl);
function PagosSemanaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	
	this.alumnos_id = [];
	this.semanaActual = parseInt($stateParams.semana);
	this.anio = parseInt($stateParams.anio);
	this.totalPagos = 0.00;
	this.pagos = [];
	this.pagosPorSemana = [];

  
	this.imprimir = function(elem)
  {
		var mywindow = window.open('', 'PRINT', 'height=400,width=600');
		mywindow.document.write('<html><head><title>' + document.title  + '</title>');
		
		mywindow.document.write('</head><body >');
		mywindow.document.write('<h1>' + document.title  + '</h1>');
		mywindow.document.write(document.getElementById(elem).innerHTML);
		mywindow.document.write('</body></html>');
		
		mywindow.document.close(); // necessary for IE >= 10
		mywindow.focus(); // necessary for IE >= 10*/
		
		mywindow.print();
		mywindow.close();
		
		return true;

  }
  
  this.getPagosPorSemana = function(){
		NProgress.set(0.5);
	  Meteor.apply("getPagosPorSemana", [this.semanaActual, this.anio, Meteor.user().profile.campus_id], function(error, result){
		  if(result){
			  NProgress.set(1);
			  rc.pagosPorSemana = result;
			  console.log(result);
		  }else{
			  NProgress.set(1);
		  }
		  $scope.$apply();
	  })
	  
  }
}

//XFSrD4ZL34Dn8nG2Q