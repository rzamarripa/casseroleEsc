angular
.module("casserole")
.controller("CobranzaCtrl", CobranzaCtrl);
function CobranzaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.deudores = [];

  Meteor.apply('cobranza', [Meteor.user().profile.seccion_id], function(error, result){
	  rc.deudores = result;
    $scope.$apply();
  });
  
  this.imprimirGrupo = function(elem)
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