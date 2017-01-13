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
  window.rc = rc;
	
  Meteor.apply('deudores', [Meteor.user().profile.seccion_id], function(error, result){
	  rc.totales = result[0];
	  console.log(rc.totales);
	  result.splice(0, 1);
	  rc.deudores = result;
	  console.log("despues", rc.totales)
    $scope.$apply();
  });
  
};