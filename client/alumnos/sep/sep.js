
angular
  .module('casserole')
  .controller('AlumnosSepCtrl', AlumnosSepCtrl);
 
function AlumnosSepCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.alumnosSep = [];

  this.getAlumnosReprobados = function(){
	  Meteor.apply("getAlumnosSep", [Meteor.user().profile.campus_id], function(error, result){
		  console.log(result);
		  if(result){
			  rc.alumnosSep = result;
		  }else{
			  toastr.error("No se encontraron alumnos reprobados");
		  }
		  
		  $scope.$apply();
	  })
  }
}