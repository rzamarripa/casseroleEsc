angular
.module("casserole")
.controller("DeudoresCtrl", DeudoresCtrl);
function DeudoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.alumnos_id = [];
  this.deudores = [];
  this.totales = [];
  
  NProgress.set(0.5);
	
  Meteor.apply('deudores', [Meteor.user().profile.seccion_id], function(error, result){
	  if(result){
		  rc.totales = result[0];
		  result.splice(0, 1);
		  rc.deudores = result;
		  NProgress.set(1);
	  }	  

    $scope.$apply();
  });
  
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
};