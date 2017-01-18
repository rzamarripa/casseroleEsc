angular
.module("casserole")
.controller("CobranzaCtrl", CobranzaCtrl);
function CobranzaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.deudores = [];
  window.rc = rc;

  Meteor.apply('cobranza', [Meteor.user().profile.seccion_id], function(error, result){
	  rc.deudores = result;
    $scope.$apply();
  });
  
};