angular
.module("casserole")
.controller("DeudoresGrupoCtrl", DeudoresGrupoCtrl);
function DeudoresGrupoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.deudores = [];
	NProgress.set(0.5);
  Meteor.apply('cobranza', [Meteor.user().profile.seccion_id], function(error, result){
	  rc.deudores = result;
	  NProgress.set(1);
    $scope.$apply();
  });
  
  this.imprimirGrupo = function(elem)
  {
	  var divToPrint=document.getElementById(elem);
		newWin= window.open("");
		newWin.document.write(divToPrint.outerHTML);
		newWin.print();
		newWin.close();
/*
		var mywindow = window.open('', 'PRINT', 'height=400,width=600');
		mywindow.document.write('<html><head><title>' + document.title  + '</title>');
		
		mywindow.document.write('</head><body >');
		mywindow.document.write('<h1>' + document.title  + '</h1>');
		mywindow.document.write(document.getElementById(elem).innerHTML);
		mywindow.document.write('</body></html>');
		
		mywindow.document.close(); // necessary for IE >= 10
		mywindow.focus(); // necessary for IE >= 10
		
		mywindow.print();
		mywindow.close();
*/
		
		return true;

  }
};