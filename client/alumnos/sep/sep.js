
angular
  .module('casserole')
  .controller('AlumnosSepCtrl', AlumnosSepCtrl);
 
function AlumnosSepCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.alumnosReprobados = [];

  this.getAlumnosReprobados = function(){
	  Meteor.apply("getAlumnosSep", [Meteor.user().profile.campus_id], function(error, result){
		  if(result){
			  rc.alumnosReprobados = result;
		  }else{
			  toastr.error("No se encontraron alumnos reprobados");
		  }
		  
		  $scope.$apply();
	  })
  }
}