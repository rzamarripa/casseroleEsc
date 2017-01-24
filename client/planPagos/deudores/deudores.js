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
	
  Meteor.apply('deudores', [Meteor.user().profile.seccion_id], function(error, result){
	  rc.totales = result[0];
	  result.splice(0, 1);
	  rc.deudores = result;
    $scope.$apply();
  });
};